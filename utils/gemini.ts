import { GoogleGenerativeAI } from "@google/generative-ai";
import { JOB_MASTERS } from "@/app/constants/jobMasters";
import { JOB_MASTERS_V2 } from "@/app/constants/jobMastersV2";
import type { HierarchicalTags, ExtractedJobData, HierarchicalExtractionResult, Job, DetectDuplicateResult, TokenUsage } from "./types";

const MODEL_ID = "gemini-2.0-flash";

const apiKey = process.env.GEMINI_API_KEY!;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = () => {
    return genAI.getGenerativeModel({
        model: MODEL_ID,
        generationConfig: {
            responseMimeType: "application/json",
        }
    });
};

export async function analyzeJobContent(jobText: string) {
    const model = getGeminiModel();

    const prompt = `
    You are an expert HR Recruiter and Data Analyst.
    Analyze the following Job Description and extract structured data.

    STRICT CONSTRAINT:
    For "generated_tags", "holidays", "benefits", and "requirements", you MUST try to map extracted concepts to the following PRE-DEFINED LISTS.
    Only add a custom tag if it is critically important and not covered by the list.

    [PRE-DEFINED MASTERS]
    Holidays: ${JOB_MASTERS.holidays.join(", ")}
    Benefits: ${JOB_MASTERS.benefits.join(", ")}
    Requirements: ${JOB_MASTERS.requirements.join(", ")}
    Tags: ${JOB_MASTERS.tags.join(", ")}
    
    Output JSON format:
    {
        "generated_tags": ["tag1", "tag2", ...],
        "generated_holidays": ["holiday1", ...], // Select from Holidays list
        "generated_benefits": ["benefit1", ...], // Select from Benefits list
        "generated_requirements": ["req1", ...], // Select from Requirements list
        "employment_type_normalized": "正社員" | "契約社員" | "派遣社員" | "パート・アルバイト",
        "salary_analysis": {
            "min": number,
            "max": number,
            "is_annual": boolean
        },
        "suitability_scores": {
            "A_stability": number (0-100), // Stability / Routine / Long-term
            "B_private_life": number (0-100), // Work-life balance / Low overtime
            "C_income_growth": number (0-100), // High income / Commission / Growth
            "D_speed_immediate": number (0-100) // Start immediately / No experience needed
        },
        "summary": "One sentence summary"
    }

    Job Description:
    ${jobText}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return JSON.parse(response.text());
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return null;
    }
}

// ==========================================
// Token Usage Tracking (TDD Implementation)
// ==========================================

/**
 * Extract token usage from Gemini API response
 * @param result - GenerateContentResult from Gemini API
 * @returns TokenUsage object or null if metadata not available
 */
export function extractTokenUsage(result: unknown): TokenUsage | null {
    if (!result || typeof result !== 'object') return null;

    const response = (result as Record<string, unknown>).response;
    if (!response || typeof response !== 'object') return null;

    const metadata = (response as Record<string, unknown>).usageMetadata;
    if (!metadata || typeof metadata !== 'object') return null;

    const meta = metadata as Record<string, unknown>;
    return {
        promptTokens: typeof meta.promptTokenCount === 'number' ? meta.promptTokenCount : 0,
        candidateTokens: typeof meta.candidatesTokenCount === 'number' ? meta.candidatesTokenCount : 0,
        totalTokens: typeof meta.totalTokenCount === 'number' ? meta.totalTokenCount : 0,
    };
}

/**
 * Log token usage for monitoring and cost analysis
 * @param functionName - Name of the calling function
 * @param usage - Token usage data
 */
export function logTokenUsage(functionName: string, usage: TokenUsage | null): void {
    if (!usage) {
        console.warn('[TokenUsage] No usage metadata available for ' + functionName);
        return;
    }
    console.log('[TokenUsage]', {
        function: functionName,
        promptTokens: usage.promptTokens,
        candidateTokens: usage.candidateTokens,
        totalTokens: usage.totalTokens,
    });
}

// ==========================================
// Hierarchical Tag Extraction (TDD Implementation)
// ==========================================

// Cache for tag-to-category mapping (performance optimization)
let cachedTagToCategory: Record<string, { main: string; sub: string }> | null = null;

/**
 * Build tag-to-category mapping (cached for performance)
 */
function buildTagToCategoryMapping(): Record<string, { main: string; sub: string }> {
    if (cachedTagToCategory) {
        return cachedTagToCategory;
    }

    const mapping: Record<string, { main: string; sub: string }> = {};

    for (const [mainCat, subCats] of Object.entries(JOB_MASTERS_V2)) {
        for (const [subCat, tags] of Object.entries(subCats)) {
            for (const tag of tags) {
                mapping[tag] = { main: mainCat, sub: subCat };
            }
        }
    }

    cachedTagToCategory = mapping;
    return mapping;
}

/**
 * Extract hierarchical tags from job text using AI
 * @param jobText - Job description text
 * @param mode - 'standard' or 'anonymous' extraction mode
 * @returns Hierarchical extraction result with tags and confidence
 */
export async function extractHierarchicalTags(
    jobText: string,
    mode: 'standard' | 'anonymous' = 'standard'
): Promise<HierarchicalExtractionResult> {
    try {
        const model = getGeminiModel();

        // Build hierarchical tagging prompt
        const modeInstruction = mode === 'anonymous'
            ? '企業名を伏せて抽出してください（例：「大手通信企業」など）'
            : '企業名を具体的に出力してください';

        const prompt = `
あなたはプロの求人アナライザーです。以下の求人テキストを分析し、階層的なカテゴリでタグ付けしてください。

${modeInstruction}

【大カテゴリ構造】
- work_conditions（勤務条件）
  - 勤務地: 駅チカ、車通勤OK、転勤なし
  - 勤務時間: 残業なし、残業少なめ、週3日からOK、週4日からOK
  - 働き方: リモートワーク可、服装自由、シフト制、完全シフト制、平日休み、土日祝のみOK
- holidays（休日・休暇）
  - 週休制度: 完全週休2日制、週休2日制、土日祝休み
  - 年間休日: 年間休日120日以上
  - 長期休暇: 長期休暇あり、夏季休暇、年末年始休暇、GW休暇
  - その他休暇: 有給休暇、慶弔休暇、産前産後休暇、育児休暇
- compensation（給与・待遇）
  - 給与体系: 賞与あり、昇給あり
  - 手当: 交通費全額支給、交通費規定支給、残業代全額支給、住宅手当、家族手当
  - 福利厚生: 社会保険完備、退職金制度、寮・社宅あり、PC貸与
  - キャリア: 研修制度あり、資格取得支援、社員登用あり
- requirements（応募条件）
  - 経験: 未経験OK、経験者優遇、ブランクOK
  - 学歴: 学歴不問、大卒以上
  - 対象者: 第二新卒歓迎、フリーター歓迎、主婦(夫)活躍中、20代活躍中、30代活躍中
  - スキル: PCスキル（基本操作）、Excelスキル、英語力不問
- recruitment_info（募集情報）
  - 緊急度: 急募、大量募集
  - 企業タイプ: 外資系企業、大手企業、ベンチャー企業
  - その他: オープニングスタッフ

【出力形式】
{
  "hierarchical_tags": {
    "work_conditions": {
      "勤務地": ["駅チカ・駅ナカ"],
      "勤務時間": ["残業少なめ"],
      "働き方": ["服装自由"]
    },
    "holidays": {
      "週休制度": ["土日祝休み"]
    }
  },
  "confidence": 85
}

求人テキスト:
${jobText}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const parsed = JSON.parse(response.text());

        return {
            hierarchical_tags: parsed.hierarchical_tags,
            confidence: parsed.confidence || 0
        };
    } catch (error) {
        console.error('extractHierarchicalTags error:', error);
        return {
            hierarchical_tags: {},
            confidence: 0
        };
    }
}

/**
 * Map flat tags array to hierarchical structure
 * @param flatTags - Array of tag strings
 * @returns Hierarchical tags organized by category
 */
export function mapTagsToHierarchy(flatTags: string[]): HierarchicalTags {
    // Handle empty input
    if (!flatTags || flatTags.length === 0) {
        return {};
    }

    const result: Record<string, Record<string, string[]>> = {};
    const tagToCategory = buildTagToCategoryMapping();

    // Use Set for O(1) deduplication
    const seenTags = new Set<string>();

    // Map each tag to its hierarchical position
    for (const tag of flatTags) {
        // Skip duplicates
        const uniqueKey = tag;
        if (seenTags.has(uniqueKey)) {
            continue;
        }
        seenTags.add(uniqueKey);

        const mapping = tagToCategory[tag];
        if (!mapping) {
            // Unknown tag - skip it
            continue;
        }

        const { main, sub } = mapping;

        // Initialize main category if not exists
        if (!result[main]) {
            result[main] = {};
        }

        // Initialize sub category if not exists
        if (!result[main][sub]) {
            result[main][sub] = [];
        }

        // Add tag to sub category
        result[main][sub].push(tag);
    }

    return result;
}

// ==========================================
// Duplicate Detection (TDD Implementation)
// ==========================================

/**
 * Detect duplicate jobs using AI similarity analysis
 * @param newJobData - New job data to check
 * @param existingJobs - List of existing jobs to compare against
 * @returns Detection result with duplicate status and similar jobs
 */
export async function detectDuplicateJob(
    newJobData: ExtractedJobData,
    existingJobs: Job[] = []
): Promise<DetectDuplicateResult> {
    // Early return if no existing jobs to compare
    if (!existingJobs || existingJobs.length === 0) {
        return {
            isDuplicate: false,
            similarJobs: [],
        };
    }

    try {
        const model = getGeminiModel();

        // Format existing jobs for comparison
        const existingJobsSummary = existingJobs.map(job => (
            `ID: ${job.id}\n` +
            `タイトル: ${job.title}\n` +
            `エリア: ${job.area || '未指定'}\n` +
            `給与: ${job.salary || '未指定'}\n` +
            `説明: ${job.description || 'なし'}`
        )).join('\n\n');

        const prompt = `
あなたは求人データの重複を検出するプロのアナライザーです。
以下の新しい求人データと既存の求人リストを比較し、
重複または同一の求人だと思われるものを特定してください。

【新しい求人】
タイトル: ${newJobData.title || '未指定'}
エリア: ${newJobData.area || '未指定'}
給与: ${newJobData.salary || '未指定'}
カテゴリ: ${newJobData.category || '未指定'}
説明: ${newJobData.description || 'なし'}

【既存の求人リスト】
${existingJobsSummary}

【判定基準】
- 以下の条件をすべて満たす場合、重複と判定してください:
  1. タイトルが類似している（完全一致または部分的に一致）
  2. エリアが同じ
  3. 給与条件が類似している

【出力形式】
{
  "is_duplicate": true/false,
  "duplicate_ids": ["uuid1", "uuid2"],
  "reason": "類似の理由"
}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const parsed = JSON.parse(response.text());

        if (parsed.is_duplicate && parsed.duplicate_ids && parsed.duplicate_ids.length > 0) {
            const similarJobs = existingJobs.filter(job =>
                parsed.duplicate_ids.includes(job.id)
            );
            return {
                isDuplicate: true,
                similarJobs,
                reason: parsed.reason,
            };
        }

        return {
            isDuplicate: false,
        };
    } catch (error) {
        console.error('detectDuplicateJob error:', error);
        return {
            isDuplicate: false,
        };
    }
}
