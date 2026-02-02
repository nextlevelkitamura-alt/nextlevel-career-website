import { GoogleGenerativeAI } from "@google/generative-ai";
import { JOB_MASTERS } from "@/app/constants/jobMasters";

const MODEL_ID = "gemini-2.0-flash";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY!;

if (!apiKey) {
    console.warn("GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables.");
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
