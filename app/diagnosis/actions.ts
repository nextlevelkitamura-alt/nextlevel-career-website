'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

interface JobData {
    id: string;
    title: string;
    category: string;
    salary: string;
    area: string;
    description?: string;
}

interface MatchScoreResult {
    score: number;
    reason: string;
    jobId: string;
}

interface DiagnosisAnswers {
    priority?: string;
    atmosphere?: string;
    salary?: string;
    holidays?: string;
    challenge?: string;
    employment?: string;
}

// Calculate job match score using Gemini 2.0 Flash
export async function calculateJobMatchScore(
    job: JobData,
    diagnosisType: string,
    answers: DiagnosisAnswers
): Promise<MatchScoreResult | null> {
    if (!apiKey) {
        console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

        const typeDescriptions: Record<string, string> = {
            'A': '安定重視 - コツコツ長く働ける、ルールが明確で安定した環境',
            'B': 'プライベート重視 - 効率よく仕事をこなす、残業が少ない',
            'C': '収入アップ・チャレンジ - 高収入、成果主義、新しい分野への挑戦',
            'D': 'スピード就業 - すぐに働ける、未経験歓迎、短期からOK'
        };

        const prompt = `あなたは求人と求職者の親和性を判定するAIです。

## 診断結果タイプ
タイプ: ${diagnosisType} (${typeDescriptions[diagnosisType]})

## 診断回答
${Object.entries(answers)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n')}

## 求人データ
タイトル: ${job.title}
カテゴリ: ${job.category}
給与: ${job.salary}
エリア: ${job.area}
${job.description ? `仕事内容: ${job.description}` : ''}

## 親和性スコア
0〜100の数値で、この求人が診断結果タイプ「${diagnosisType}」にどの程度合致するかを判定してください。

判定基準:
1. 仕事の優先事項との一致度
2. 職場環境の適合性
3. 給与条件のマッチング
4. 休日の希望との一致
5. 成長意欲に合致するか

出力形式（JSONのみ、他のテキストは含めないでください）:
{
  "score": 85,
  "reason": "マッチング理由を30文字以内で簡潔に"
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON
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

        const parsed = JSON.parse(jsonStr);

        return {
            score: Math.min(100, Math.max(0, parsed.score || 0)),
            reason: parsed.reason || '親和性が高い求人です',
            jobId: job.id
        };

    } catch (error) {
        console.error('AI matching error:', error);
        return null;
    }
}
