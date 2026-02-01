"use server";

import { createClient } from "@/utils/supabase/server";
import { analyzeJobContent } from "@/utils/gemini";
import { revalidatePath } from "next/cache";

export async function analyzeJobWithAI(jobId: string) {
    const supabase = createClient();

    // 1. Fetch Job Data
    const { data: job, error } = await supabase
        .from("jobs")
        .select("title, description, requirements, working_hours, benefits, id")
        .eq("id", jobId)
        .single();

    if (error || !job) {
        return { success: false, error: "Job not found" };
    }

    // 2. Prepare text for AI
    const jobText = `
    Title: ${job.title}
    Description: ${job.description}
    Requirements: ${job.requirements}
    Working Hours: ${job.working_hours}
    Benefits: ${job.benefits}
    `;

    // 3. Call Gemini
    const analysisResult = await analyzeJobContent(jobText);

    if (!analysisResult) {
        return { success: false, error: "AI Analysis failed" };
    }

    // 4. Update Database
    const { error: updateError } = await supabase
        .from("jobs")
        .update({
            ai_analysis: analysisResult
        })
        .eq("id", jobId);

    if (updateError) {
        return { success: false, error: "Failed to update job with AI data: " + updateError.message };
    }

    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/admin/jobs");

    return { success: true, data: analysisResult };
}
