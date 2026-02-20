"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { checkAdmin } from "./auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { JOB_MASTERS } from "@/app/constants/jobMasters";
import { extractTokenUsage, logTokenUsage } from "@/utils/gemini";
import { buildExtractionSystemInstruction, buildExtractionUserPrompt } from "@/utils/promptBuilder";
import type { TokenUsage } from "@/utils/types";

// Type for extracted job data
export interface ExtractedJobData {
    title?: string;
    area?: string;
    search_areas?: string[];
    type?: string;
    salary?: string;
    category?: string;
    tags?: string[];
    description?: string;
    requirements?: string;
    working_hours?: string;
    holidays?: string[];
    benefits?: string[];
    selection_process?: string;
    // Additional fields from PDF
    company_name?: string;
    nearest_station?: string;
    location_notes?: string;
    salary_type?: string;
    attire_type?: string;
    hair_style?: string;
    raise_info?: string;
    bonus_info?: string;
    commute_allowance?: string;
    job_category_detail?: string;
    commute_method?: string;
    hourly_wage?: number;
    salary_description?: string;
    period?: string;
    start_date?: string;
    workplace_name?: string;
    workplace_address?: string;
    workplace_access?: string;
    attire?: string;
    training_info?: string;
    dress_code?: string;
    work_days?: string;
    contact_person?: string;
    notes?: string;
    // Dispatch-specific fields (派遣専用)
    client_company_name?: string;
    training_period?: string;
    training_salary?: string;
    actual_work_hours?: string;
    work_days_per_week?: string;
    end_date?: string;
    nail_policy?: string;
    shift_notes?: string;
    general_notes?: string;
    // Fulltime-specific fields (正社員専用)
    industry?: string;
    company_overview?: string;
    company_size?: string;
    annual_salary_min?: number;
    annual_salary_max?: number;
    overtime_hours?: string;
    annual_holidays?: string;
    probation_period?: string;
    probation_details?: string;
    appeal_points?: string;
    welcome_requirements?: string;
    recruitment_background?: string;
    company_url?: string;
    business_overview?: string;
    company_address?: string;
    established_date?: string;
    smoking_policy?: string;
    department_details?: string;
    // 正社員追加フィールド
    education_training?: string;
    representative?: string;
    capital?: string;
    work_location_detail?: string;
    salary_detail?: string;
    transfer_policy?: string;
    // エン転職対応フィールド
    salary_example?: string;
    annual_revenue?: string;
    onboarding_process?: string;
    interview_location?: string;
    salary_breakdown?: string;
}

// Type for tag matching result
export interface TagMatchResult {
    match: 'exact' | 'similar' | 'new';
    option?: { id: string; label: string; value: string };
    original: string;
    suggestion?: string;
}

// Type for chat-based AI refinement
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type: 'text' | 'refinement_preview';
    refinementData?: {
        originalFields: Record<string, unknown>;
        proposedFields: Record<string, unknown>;
        changedFields: string[];
    };
}

// Field synonym mapping for natural language extraction
const FIELD_SYNONYMS: Record<string, string[]> = {
    title: ["タイトル", "求人タイトル", "仕事名", "お仕事名", "件名"],
    description: ["仕事内容", "業務内容", "職務内容", "仕事の詳細", "詳細"],
    requirements: ["応募資格", "条件", "応募条件", "資格", "要件", "必須要件", "必須条件"],
    welcome_requirements: ["歓迎要件", "歓迎条件", "歓迎スキル", "歓迎経験", "WANT"],
    working_hours: ["勤務時間", "労働時間", "シフト", "時間"],
    holidays: ["休日", "休暇", "休み"],
    benefits: ["福利厚生", "待遇", "福利"],
    period: ["雇用期間", "期間", "勤続期間"],
    start_date: ["就業開始時期", "開始時期", "開始日"],
    salary_type: ["給与形態", "給与タイプ"],
    hourly_wage: ["時給", "時間給", "時給"],
    salary_description: ["給与詳細", "給与の詳細", "賃金詳細"],
    raise_info: ["昇給", "昇給制度"],
    bonus_info: ["賞与", "ボーナス"],
    commute_allowance: ["交通費", "通勤手当", "通勤費"],
    nearest_station: ["最寄駅", "最寄り駅", "駅"],
    location_notes: ["勤務地備考", "勤務地", "場所", "ロケーション"],
    workplace_name: ["勤務先名", "会社名", "企業名"],
    workplace_address: ["勤務地住所", "住所"],
    workplace_access: ["アクセス", "アクセス方法"],
    selection_process: ["選考プロセス", "選考", "応募フロー"],
    attire_type: ["服装", "服装規定"],
    hair_style: ["髪型", "ヘアスタイル"],
    attire: ["服装・髪型", "服装髪型"],
    tags: ["タグ", "特徴", "キーワード"],
    job_category_detail: ["詳細職種名", "職種詳細"],
};

// Category-based field mapping
const CATEGORY_FIELD_MAP: Record<string, string[]> = {
    "給与": ["salary_type", "hourly_wage", "salary_description", "raise_info", "bonus_info", "commute_allowance", "salary"],
    "時給": ["hourly_wage", "salary_type"],
    "賃金": ["hourly_wage", "salary_description", "salary_type"],
    "勤務地": ["nearest_station", "location_notes", "workplace_address", "workplace_access"],
    "勤務先": ["workplace_name", "workplace_address", "workplace_access"],
    "アクセス": ["nearest_station", "location_notes", "workplace_access"],
    "交通": ["nearest_station", "location_notes", "commute_allowance"],
};

// Extract target fields from natural language message
function extractTargetFields(message: string): string[] {
    const normalizedMessage = message.toLowerCase();
    const extractedFields = new Set<string>();

    // Check category-based extraction first
    for (const [keyword, fields] of Object.entries(CATEGORY_FIELD_MAP)) {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
            fields.forEach(field => extractedFields.add(field));
        }
    }

    // Check individual field synonyms
    for (const [field, synonyms] of Object.entries(FIELD_SYNONYMS)) {
        for (const synonym of synonyms) {
            if (normalizedMessage.includes(synonym.toLowerCase())) {
                extractedFields.add(field);
                break;
            }
        }
    }

    // If no fields extracted, return empty array (AI will interpret)
    return Array.from(extractedFields);
}

// Extract job data from file URL using Gemini Flash
export async function extractJobDataFromFile(fileUrl: string, mode: 'standard' | 'anonymous' = 'standard', jobType?: string): Promise<{ data?: ExtractedJobData; error?: string; tokenUsage?: TokenUsage }> {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return { error: "GEMINI_API_KEY is not configured. Please add it to .env.local" };
    }

    try {
        // Fetch the file
        const response = await fetch(fileUrl);
        if (!response.ok) {
            return { error: `Failed to fetch file: ${response.statusText}` };
        }

        const contentType = response.headers.get("content-type") || "";
        const arrayBuffer = await response.arrayBuffer();
        const base64Data = Buffer.from(arrayBuffer).toString("base64");

        // Determine MIME type
        let mimeType = "application/pdf";
        if (contentType.includes("image")) {
            mimeType = contentType.split(";")[0];
        } else if (contentType.includes("pdf")) {
            mimeType = "application/pdf";
        }

        // Initialize Gemini with system instruction (cacheable for token optimization)
        const genAI = new GoogleGenerativeAI(apiKey);
        const systemInstruction = buildExtractionSystemInstruction(JOB_MASTERS);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction,
        });

        const prompt = buildExtractionUserPrompt(mode, jobType);

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType,
                    data: base64Data,
                },
            },
            prompt,
        ]);

        // Log token usage for cost analysis
        const tokenUsage = extractTokenUsage(result);
        logTokenUsage('extractJobDataFromFile', tokenUsage);

        const responseText = result.response.text();

        // Extract JSON from response (handle potential markdown wrapping)
        let jsonStr = responseText;
        const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        } else {
            // Try to find raw JSON
            const startIdx = responseText.indexOf('{');
            const endIdx = responseText.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1) {
                jsonStr = responseText.slice(startIdx, endIdx + 1);
            }
        }

        const extractedData: ExtractedJobData = JSON.parse(jsonStr);
        return { data: extractedData, tokenUsage: tokenUsage ?? undefined };

    } catch (error) {
        console.error("AI extraction error:", error);

        // User-friendly error messages
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("Too Many Requests")) {
            return {
                error: "レート制限に達しました。少し待ってから再度お試しください（15秒程度）。無料枠の制限によるものです。"
            };
        }

        if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("API key not valid")) {
            return { error: "APIキーが無効です。.env.localのGEMINI_API_KEYを確認してください。" };
        }

        return { error: `AI抽出エラー: ${errorMessage.slice(0, 300)}` };
    }
}

// Match extracted tags with existing job_options
export async function matchTagsWithOptions(
    extractedItems: string[],
    category: string
): Promise<TagMatchResult[]> {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return [];

    const supabase = createSupabaseClient();

    // Fetch existing options for this category
    const { data: options, error } = await supabase
        .from("job_options")
        .select("id, label, value")
        .eq("category", category);

    if (error || !options) {
        console.error("Failed to fetch job_options:", error);
        return extractedItems.map(item => ({ match: 'new' as const, original: item }));
    }

    return extractedItems.map(item => {
        const normalizedItem = item.trim().toLowerCase();

        // Exact match
        const exactMatch = options.find(o =>
            o.label.toLowerCase() === normalizedItem ||
            o.value.toLowerCase() === normalizedItem
        );
        if (exactMatch) {
            return { match: 'exact' as const, option: exactMatch, original: item };
        }

        // Similar match (contains or is contained)
        const similarMatch = options.find(o => {
            const normalizedLabel = o.label.toLowerCase();
            const normalizedValue = o.value.toLowerCase();
            return normalizedLabel.includes(normalizedItem) ||
                normalizedItem.includes(normalizedLabel) ||
                normalizedValue.includes(normalizedItem) ||
                normalizedItem.includes(normalizedValue);
        });
        if (similarMatch) {
            return {
                match: 'similar' as const,
                option: similarMatch,
                original: item,
                suggestion: similarMatch.label
            };
        }

        // No match - new tag needed
        return { match: 'new' as const, original: item };
    });
}

// Helper: Process extracted data and match tags with existing options
export async function processExtractedJobData(extractedData: ExtractedJobData): Promise<{
    processedData: ExtractedJobData;
    matchResults: {
        requirements: TagMatchResult[];
        welcomeRequirements: TagMatchResult[];
        holidays: TagMatchResult[];
        benefits: TagMatchResult[];
    };
}> {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    // Match tags with existing options
    // requirements と welcome_requirements はテキスト文字列のためタグマッチング不要
    const requirementsMatch: TagMatchResult[] = [];
    const welcomeRequirementsMatch: TagMatchResult[] = [];
    const holidaysMatch = extractedData.holidays
        ? await matchTagsWithOptions(extractedData.holidays, 'holidays')
        : [];
    const benefitsMatch = extractedData.benefits
        ? await matchTagsWithOptions(extractedData.benefits, 'benefits')
        : [];

    return {
        processedData: extractedData,
        matchResults: {
            requirements: requirementsMatch,
            welcomeRequirements: welcomeRequirementsMatch,
            holidays: holidaysMatch,
            benefits: benefitsMatch,
        },
    };
}

// Refine job data with AI instructions
export async function refineJobWithAI(
    currentData: ExtractedJobData,
    instruction: string,
    targetFields: string[]
): Promise<{ data?: ExtractedJobData; error?: string; tokenUsage?: TokenUsage }> {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return { error: "GEMINI_API_KEY is not configured. Please add it to .env.local" };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // Build current data context for AI
        const currentDataContext = Object.entries(currentData)
            .filter(([, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => {
                const formattedValue = Array.isArray(value) ? value.join(', ') : value;
                return `  ${key}: ${formattedValue}`;
            })
            .join('\n');

        // Build target fields description
        const fieldDescriptions: Record<string, string> = {
            title: "求人タイトル",
            description: "仕事内容",
            requirements: "必須要件",
            welcome_requirements: "歓迎要件",
            working_hours: "勤務時間",
            holidays: "休日・休暇",
            benefits: "福利厚生",
            selection_process: "選考プロセス",
            nearest_station: "最寄駅",
            location_notes: "勤務地備考",
            salary_type: "給与形態",
            raise_info: "昇給情報",
            bonus_info: "賞与情報",
            commute_allowance: "交通費情報",
            job_category_detail: "詳細職種名",
            attire_type: "服装",
            hair_style: "髪型",
            hourly_wage: "時給（検索用）",
            salary_description: "給与詳細",
            period: "雇用期間",
            start_date: "就業開始時期",
            workplace_name: "勤務先名",
            workplace_address: "勤務地住所",
            workplace_access: "アクセス",
            attire: "服装・髪型（まとめ）",
        };

        const targetFieldsDescription = targetFields
            .map(f => fieldDescriptions[f] || f)
            .join('、');

        // Fetch job options for reference
        const supabase = createSupabaseClient();
        const { data: jobOptions } = await supabase
            .from("job_options")
            .select("category, label, value");

        const optionsByCategory = jobOptions?.reduce((acc, opt) => {
            if (!acc[opt.category]) acc[opt.category] = [];
            acc[opt.category].push(opt.label);
            return acc;
        }, {} as Record<string, string[]>) || {};

        const holidaysList = optionsByCategory['holidays']?.join(', ') || '';
        const benefitsList = optionsByCategory['benefits']?.join(', ') || '';
        const tagsList = optionsByCategory['tags']?.join(', ') || '';

        const prompt = `あなたは求人情報を改善・修正するプロの求人コンサルタントAIです。

## 現在の求人データ
${currentDataContext}

## ユーザーの指示
${instruction}

## 対象フィールド
${targetFieldsDescription}

## 重要な指示

### 求人タイトル（title）を修正する場合
- 以下の条件に該当する場合、**必ずタイトルに所定のキーワードを含めてください**。
  1. **時給1,500円以上**の場合 -> 「【高時給】」または「【高収入】」を含める。
  2. **駅から徒歩10分以内の場合** -> 「【駅チカ】」を含める。
  3. 両方に該当する場合 -> 「【駅チカ×高時給】」のように組み合わせる。

### 仕事内容（description）を修正する場合
- **400〜600文字程度**の分量で記述してください。
- 「架空の1日の流れ」や「存在しないスケジュール」は絶対に生成しないでください。
- 現在の情報をベースに、ユーザーの指示を反映してください。

### マスタデータへの準拠
以下の項目を修正する場合は、**原則として以下のリストから選択してください**。

【休日・休暇 (holidays)】
${holidaysList}

【福利厚生 (benefits)】
${benefitsList}

【タグ (tags)】
${tagsList}
※その求人のメリット・魅力を表すものを2〜3個選択。
※「週3日からOK」「週4日からOK」などのシフト条件があれば必ず含めること。

## 出力フォーマット
指定されたフィールドのみを含むJSON形式で出力してください。
例えば、titleとdescriptionを修正する場合：
{
  "title": "修正後のタイトル",
  "description": "修正後の仕事内容"
}

配列フィールド（holidays, benefits, tags）は配列形式で出力してください。
requirements, welcome_requirements はテキスト文字列（原文転記）で出力してください。
その他のフィールドは文字列で出力してください。

## 注意事項
- JSONのみを出力し、説明文やマークダウンは含めないでください
- 指定されたフィールドのみを出力してください
- 現在のデータの良い部分は維持しつつ、ユーザーの指示を反映してください`;

        const result = await model.generateContent(prompt);

        // Log token usage for cost analysis
        const tokenUsage = extractTokenUsage(result);
        logTokenUsage('refineJobWithAI', tokenUsage);

        const responseText = result.response.text();

        // Extract JSON from response
        let jsonStr = responseText;
        const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        } else {
            const startIdx = responseText.indexOf('{');
            const endIdx = responseText.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1) {
                jsonStr = responseText.slice(startIdx, endIdx + 1);
            }
        }

        const refinedData: ExtractedJobData = JSON.parse(jsonStr);

        // Merge with current data (only update specified fields)
        const mergedData: ExtractedJobData = { ...currentData };
        for (const field of targetFields) {
            const keyValue = refinedData[field as keyof ExtractedJobData];
            if (keyValue !== undefined) {
                (mergedData as Record<string, unknown>)[field] = keyValue;
            }
        }

        return { data: mergedData, tokenUsage: tokenUsage ?? undefined };

    } catch (error) {
        console.error("AI refinement error:", error);

        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes("429") || errorMessage.includes("quota")) {
            return {
                error: "レート制限に達しました。少し待ってから再度お試しください（15秒程度）。"
            };
        }

        if (errorMessage.includes("API_KEY") || errorMessage.includes("unauthorized")) {
            return { error: "APIキーが無効です。" };
        }

        return { error: `AI修正エラー: ${errorMessage.slice(0, 200)}` };
    }
}

// Chat-based AI refinement with conversation history
export async function chatRefineJobWithAI(
    currentData: ExtractedJobData,
    userMessage: string,
    conversationHistory: ChatMessage[],
    jobType?: string
): Promise<{
    data?: ExtractedJobData;
    changedFields?: string[];
    error?: string;
}> {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return { error: "GEMINI_API_KEY is not configured. Please add it to .env.local" };
    }

    try {
        // Extract target fields from user message
        const extractedFields = extractTargetFields(userMessage);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // Build current data context
        const currentDataContext = Object.entries(currentData)
            .filter(([, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => {
                const formattedValue = Array.isArray(value) ? value.join(', ') : value;
                return `  ${key}: ${formattedValue}`;
            })
            .join('\n');

        // Build conversation history context (last 10 messages)
        const recentHistory = conversationHistory.slice(-10);
        const historyContext = recentHistory
            .map(m => `${m.role}: ${m.content}`)
            .join('\n');

        // Field descriptions
        const fieldDescriptions: Record<string, string> = {
            title: "求人タイトル",
            description: "仕事内容",
            requirements: "必須要件",
            welcome_requirements: "歓迎要件",
            working_hours: "勤務時間",
            holidays: "休日・休暇",
            benefits: "福利厚生",
            selection_process: "選考プロセス",
            nearest_station: "最寄駅",
            location_notes: "勤務地備考",
            salary_type: "給与形態",
            raise_info: "昇給情報",
            bonus_info: "賞与情報",
            commute_allowance: "交通費情報",
            job_category_detail: "詳細職種名",
            attire_type: "服装",
            hair_style: "髪型",
            hourly_wage: "時給（検索用）",
            salary_description: "給与詳細",
            period: "雇用期間",
            start_date: "就業開始時期",
            workplace_name: "勤務先名",
            workplace_address: "勤務地住所",
            workplace_access: "アクセス",
            attire: "服装・髪型（まとめ）",
        };

        // Fetch job options for reference
        const supabase = createSupabaseClient();
        const { data: jobOptions } = await supabase
            .from("job_options")
            .select("category, label, value");

        const optionsByCategory = jobOptions?.reduce((acc, opt) => {
            if (!acc[opt.category]) acc[opt.category] = [];
            acc[opt.category].push(opt.label);
            return acc;
        }, {} as Record<string, string[]>) || {};

        const holidaysList = optionsByCategory['holidays']?.join(', ') || '';
        const benefitsList = optionsByCategory['benefits']?.join(', ') || '';
        const tagsList = optionsByCategory['tags']?.join(', ') || '';

        const prompt = `あなたは求人情報を改善・修正するプロの求人コンサルタントAIです。

## 会話の履歴（最新10件）
${historyContext || "（この会話の最初です）"}

## 現在の求人データ
${currentDataContext}

## 最新のユーザー指示
${userMessage}

## フィールド定義と同義語
以下のフィールドを認識します：

**基本情報**:
- title: タイトル、求人タイトル、仕事名、お仕事名
- description: 仕事内容、業務内容、職務内容、仕事の詳細
- requirements: 必須要件、応募資格、条件、応募条件
- welcome_requirements: 歓迎要件、歓迎条件、歓迎スキル、歓迎経験

**給与関連**:
- salary: 給与、時給、賃金、報酬、給料
- salary_type: 給与形態
- hourly_wage: 時給、時間給
- salary_description: 給与詳細
- raise_info: 昇給
- bonus_info: 賞与
- commute_allowance: 交通費、通勤手当

**勤務先情報**:
- nearest_station: 最寄駅、最寄り駅
- location_notes: 勤務地備考、アクセス
- workplace_name: 勤務先名、会社名
- workplace_address: 勤務地住所、住所
- workplace_access: アクセス、アクセス方法

## カテゴリベースの抽出
以下のキーワードを含む場合は、カテゴリ全体を対象とします：

- "給与"、"時給"、"賃金" などのキーワード → 給与関連全フィールド
- "勤務地"、"勤務先"、"アクセス" などのキーワード → 勤務先情報全フィールド

## 検出された対象フィールド
${extractedFields.length > 0 ? extractedFields.map(f => fieldDescriptions[f] || f).join('、') : "（ユーザーの指示から自動的に抽出します）"}

## 指示
1. ユーザーの指示から修正対象フィールドを抽出してください
2. 抽出されたフィールドのみを修正してください
3. その他のフィールドは現在の値を維持してください
4. マスタデータに準拠した表現を使用してください
5. 必須フィールド（title, area, salary等）が空にならないようにしてください

## 重要な指示

### 求人タイトル（title）を修正する場合
- 以下の条件に該当する場合、**必ずタイトルに所定のキーワードを含めてください**。
  1. **時給1,500円以上**の場合 -> 「【高時給】」または「【高収入】」を含める。
  2. **駅から徒歩10分以内の場合** -> 「【駅チカ】」を含める。
  3. 両方に該当する場合 -> 「【駅チカ×高時給】」のように組み合わせる。

### 仕事内容（description）を修正する場合
- **400〜600文字程度**の分量で記述してください。
- 「架空の1日の流れ」や「存在しないスケジュール」は絶対に生成しないでください。
- 現在の情報をベースに、ユーザーの指示を反映してください。

### マスタデータへの準拠
以下の項目を修正する場合は、**原則として以下のリストから選択してください**。

【休日・休暇 (holidays)】
${holidaysList}

【福利厚生 (benefits)】
${benefitsList}

【タグ (tags)】
${tagsList}
※その求人のメリット・魅力を表すものを2〜3個選択。
※「週3日からOK」「週4日からOK」などのシフト条件があれば必ず含めること。

### 詳細条件の抽出について
以下の詳細フィールドを修正する場合は、具体的な情報を抽出してください：

**勤務先情報**:
- workplace_name: 勤務先名称を抽出（例: 株式会社〇〇商事 札幌支店、〇〇株式会社 ビルメンテナンス事業部）
- workplace_address: 勤務地の住所を抽出（例: 〒060-0001 北海道札幌市中央区〇〇1-2-3）
- workplace_access: アクセス方法を抽出（例: JR札幌駅から徒歩5分、地下鉄さっぽろ駅徒歩3分）
  - **重要**: 徒歩時間が含まれる場合は必ず「〇〇駅から徒歩〇分」の形式で抽出してください
  - バスの場合は「〇〇バス停から徒歩〇分」の形式
- nearest_station: 最寄り駅を抽出（例: JR札幌駅、地下鉄さっぽろ駅）
- location_notes: 勤務地の備考情報（例: 1階、駅前ビル、駐車場あり）

**給与詳細**:
- hourly_wage: 時給の数値のみ抽出（例: 1500 → 1500、1,500円 → 1500）
- salary_description: 給与の補足情報（例: 交通費全額支給、昇給あり、賞与年2回）
- raise_info: 昇給情報（例: 年1回昇給あり、能力による昇給制度あり、昇給なし）
- bonus_info: 賞与情報（例: 支給あり、業績に応じて、夏冬の賞与あり）
- commute_allowance: 交通費情報（例: 月上限5万円まで全額支給、公共交通機関100%支給）

**雇用条件**:
- period: 雇用期間（例: 長期、3ヶ月以上、〇月まで、期間の定めなし）
- start_date: 就業開始時期（例: 即日、4月1日〜、相談）

**その他**:
- job_category_detail: 詳細職種名（例: 化粧品・コスメ販売(店長・チーフ・サブ)、軽作業）

## 出力形式
{
  "targetFields": ["title", "description"],
  "reasoning": "フィールド選定の理由",
  "proposedChanges": {
    "title": "修正後のタイトル",
    "description": "修正後の仕事内容"
  }
}

## 雇用形態別ルール
${jobType === '派遣' || jobType === '紹介予定派遣' ? `
### 派遣求人ルール
- **企業名は必ず匿名化**する（「大手メーカー」「IT企業」「外資系金融」等に置換）
- タイトル・説明文でも具体的な企業名は伏せる
- タイトルパターン: 【時給{金額}円】【{訴求タグ}】{職種}@{最寄駅 or エリア}
- 時給を最初に配置して最も目立たせる
- 訴求タグ例: 未経験OK、即日スタート、交通費全額、残業なし、服装自由、ネイルOK
- 重視項目: 時給、交通費、勤務時間・実働時間、服装・髪型・ネイル規定、就業開始時期
` : jobType === '正社員' || jobType === '契約社員' ? `
### 正社員求人ルール
- **企業名はそのまま記載**する（匿名化しない）
- タイトルパターン: 【{訴求タグ}】{職種} | {企業の特徴}
- 訴求タグ例: 年収400万円〜、リモートワーク可、年間休日125日、未経験歓迎
- 重視項目: 年収レンジ、企業名・業界、企業概要、仕事の魅力、残業時間、年間休日
` : '（雇用形態未指定 — 汎用ルールで修正）'}

## 注意事項
- JSONのみを出力し、説明文やマークダウンは含めないでください
- targetFieldsには実際に変更したフィールドのみを含めてください
- reasoningに、なぜそのフィールドを修正したか簡潔に説明してください`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON from response
        let jsonStr = responseText;
        const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        } else {
            const startIdx = responseText.indexOf('{');
            const endIdx = responseText.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1) {
                jsonStr = responseText.slice(startIdx, endIdx + 1);
            }
        }

        const aiResponse = JSON.parse(jsonStr);

        // Extract changed fields and proposed data
        const changedFields = aiResponse.targetFields || [];
        const proposedChanges = aiResponse.proposedChanges || {};

        // Guard rules validation
        const requiredFields = ["title", "area", "salary", "category"];
        const warnings: string[] = [];

        for (const field of changedFields) {
            // Check if required fields would become empty
            if (requiredFields.includes(field) && !proposedChanges[field]) {
                warnings.push(`${field}は必須フィールドです。空値にすることはできません。`);
            }

            // Check for drastic changes in numeric fields
            if (field === "hourly_wage") {
                const original = currentData[field as keyof ExtractedJobData] as number;
                const proposed = proposedChanges[field] as number;
                if (original && proposed) {
                    const diff = Math.abs(original - proposed);
                    const percentChange = (diff / original) * 100;
                    if (percentChange > 30) {
                        warnings.push(`時給の変更が大きくなっています（${Math.round(percentChange)}%変動）`);
                    }
                }
            }
        }

        if (warnings.length > 0) {
            return {
                error: `ガードレール警告:\n${warnings.join('\n')}`
            };
        }

        // Merge with current data
        const mergedData: ExtractedJobData = { ...currentData };
        for (const field of changedFields) {
            const keyValue = proposedChanges[field];
            if (keyValue !== undefined) {
                (mergedData as Record<string, unknown>)[field] = keyValue;
            }
        }

        return { data: mergedData, changedFields };

    } catch (error) {
        console.error("Chat AI refinement error:", error);

        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes("429") || errorMessage.includes("quota")) {
            return {
                error: "レート制限に達しました。少し待ってから再度お試しください（15秒程度）。"
            };
        }

        if (errorMessage.includes("API_KEY") || errorMessage.includes("unauthorized")) {
            return { error: "APIキーが無効です。" };
        }

        return { error: `AI修正エラー: ${errorMessage.slice(0, 200)}` };
    }
}
