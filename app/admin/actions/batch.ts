"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "./auth";
import { extractJobDataFromFile } from "./ai";
import type { ExtractedJobData } from "./ai";

/**
 * Calculate AI confidence score for extracted job data
 * @param data - Extracted job data
 * @returns Confidence score (0-100)
 */
function calculateAIConfidence(data: ExtractedJobData): number {
    let score = 100;

    // Deduct for missing required fields
    if (!data.title) score -= 30;
    if (!data.area) score -= 20;
    if (!data.salary) score -= 20;

    // Deduct for missing optional fields
    if (!data.description) score -= 10;
    if (!data.type) score -= 5;

    // Deduct for empty arrays
    if (!data.tags || data.tags.length === 0) score -= 5;
    if (!data.requirements || data.requirements.length === 0) score -= 5;

    return Math.max(0, Math.min(100, score));
}

/**
 * Start a new batch extraction for bulk job import
 * @param files - Array of files to process
 * @param mode - 'standard' or 'anonymous' extraction mode
 * @returns Batch ID or error
 */
export async function startBatchExtraction(
    files: File[],
    mode: 'standard' | 'anonymous' = 'standard'
): Promise<{ batchId?: string; error?: string }> {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    if (!files || files.length === 0) {
        return { error: "ファイルが選択されていません" };
    }

    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "User not found" };

    try {
        // 1. Create batch record
        const { data: batch, error: batchError } = await supabase
            .from("extraction_batches")
            .insert({
                total_files: files.length,
                created_by: user.id,
                status: 'processing'
            })
            .select()
            .single();

        if (batchError || !batch) {
            return { error: batchError?.message || "Failed to create batch" };
        }

        const batchId = batch.id;

        // 2. Upload files and process each one
        for (const file of files) {
            if (file.size === 0) continue;

            // Upload to storage
            const extension = file.name.split('.').pop();
            const fileName = `batch/${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

            const { error: uploadError } = await supabase.storage
                .from("job-documents")
                .upload(fileName, file);

            if (uploadError) {
                console.error("Upload error:", uploadError);
                // Create error draft job
                await supabase.from("draft_jobs").insert({
                    title: file.name,
                    batch_id: batchId,
                    source_file_name: file.name,
                    source_file_type: file.type,
                    extraction_status: 'error',
                    extraction_warnings: [`Failed to upload: ${uploadError.message}`],
                    ai_confidence: 0
                });
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from("job-documents")
                .getPublicUrl(fileName);

            // Extract job data using AI
            const extractResult = await extractJobDataFromFile(publicUrl, mode);

            if (extractResult.error || !extractResult.data) {
                // Create error draft job
                await supabase.from("draft_jobs").insert({
                    title: file.name,
                    batch_id: batchId,
                    source_file_url: publicUrl,
                    source_file_name: file.name,
                    source_file_type: file.type,
                    extraction_status: 'error',
                    extraction_warnings: [extractResult.error || "Extraction failed"],
                    ai_confidence: 0
                });
                continue;
            }

            const extractedData = extractResult.data;

            // Calculate AI confidence score
            const confidence = calculateAIConfidence(extractedData);

            // Determine status and warnings
            let status: 'success' | 'warning' | 'error' = 'success';
            const warnings: string[] = [];

            if (!extractedData.title) {
                status = 'warning';
                warnings.push("タイトルが抽出されませんでした");
            }
            if (!extractedData.area) {
                status = 'warning';
                warnings.push("勤務地が抽出されませんでした");
            }
            if (!extractedData.salary) {
                status = 'warning';
                warnings.push("給与が抽出されませんでした");
            }
            if (confidence < 70) {
                status = 'warning';
                warnings.push("抽出精度が低いです。確認してください。");
            }

            // Create draft job
            await supabase.from("draft_jobs").insert({
                title: extractedData.title || file.name,
                area: extractedData.area,
                type: extractedData.type,
                salary: extractedData.salary,
                category: extractedData.category,
                tags: extractedData.tags || [],
                description: extractedData.description,
                requirements: extractedData.requirements ? JSON.stringify(extractedData.requirements) : null,
                working_hours: extractedData.working_hours,
                holidays: extractedData.holidays ? JSON.stringify(extractedData.holidays) : null,
                benefits: extractedData.benefits ? JSON.stringify(extractedData.benefits) : null,
                selection_process: extractedData.selection_process,
                nearest_station: extractedData.nearest_station,
                location_notes: extractedData.location_notes,
                salary_type: extractedData.salary_type,
                attire_type: extractedData.attire_type,
                hair_style: extractedData.hair_style,
                raise_info: extractedData.raise_info,
                bonus_info: extractedData.bonus_info,
                commute_allowance: extractedData.commute_allowance,
                job_category_detail: extractedData.job_category_detail,
                hourly_wage: extractedData.hourly_wage,
                salary_description: extractedData.salary_description,
                period: extractedData.period,
                start_date: extractedData.start_date,
                workplace_name: extractedData.workplace_name,
                workplace_address: extractedData.workplace_address,
                workplace_access: extractedData.workplace_access,
                attire: extractedData.attire,
                ai_analysis: {
                    generated_tags: extractedData.tags || [],
                    source_mode: mode
                },
                source_file_url: publicUrl,
                source_file_name: file.name,
                source_file_type: file.type,
                batch_id: batchId,
                extraction_status: status,
                extraction_warnings: warnings.length > 0 ? warnings : null,
                ai_confidence: confidence
            });
        }

        return { batchId };
    } catch (error) {
        console.error("Batch extraction error:", error);
        return { error: error instanceof Error ? error.message : "Unknown error" };
    }
}

/**
 * Get batch progress
 * @param batchId - Batch ID
 * @returns Progress information
 */
export async function getBatchProgress(
    batchId: string
): Promise<{
    total?: number;
    processed?: number;
    success?: number;
    warning?: number;
    errorCount?: number;
    status?: string;
    error?: string;
}> {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = createSupabaseClient();

    const { data: batch, error } = await supabase
        .from("extraction_batches")
        .select("*")
        .eq("id", batchId)
        .single();

    if (error || !batch) {
        return { error: error?.message || "Batch not found" };
    }

    return {
        total: batch.total_files,
        processed: batch.processed_count,
        success: batch.success_count,
        warning: batch.warning_count,
        errorCount: batch.error_count,
        status: batch.status
    };
}

/**
 * Get draft jobs for a batch
 * @param batchId - Batch ID (optional, if not provided returns all draft jobs)
 * @returns Array of draft jobs
 */
export async function getDraftJobs(batchId?: string): Promise<{
    data?: Record<string, unknown>[];
    error?: string;
}> {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = createSupabaseClient();

    let query = supabase
        .from("draft_jobs")
        .select("*")
        .order("created_at", { ascending: false });

    if (batchId) {
        query = query.eq("batch_id", batchId);
    }

    const { data, error } = await query;

    if (error) {
        return { error: error.message };
    }

    return { data };
}

/**
 * Update a draft job
 * @param id - Draft job ID
 * @param formData - Form data with updated fields
 * @returns Success or error
 */
export async function updateDraftJob(
    id: string,
    formData: FormData
): Promise<{ success?: boolean; error?: string }> {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = createSupabaseClient();

    // Parse form data (same as createJob/updateJob)
    const title = formData.get("title") as string;
    const area = formData.get("area") as string;
    const type = formData.get("type") as string;
    const salary = formData.get("salary") as string;
    const category = formData.get("category") as string;

    const tagsRaw = formData.get("tags") as string;
    let tags: string[] = [];
    try {
        const parsed = JSON.parse(tagsRaw);
        if (Array.isArray(parsed)) {
            tags = parsed;
        } else {
            tags = tagsRaw.split(/[,\s\u3000]+/).map(t => t.trim()).filter(Boolean);
        }
    } catch {
        tags = tagsRaw.split(/[,\s\u3000]+/).map(t => t.trim()).filter(Boolean);
    }

    const description = formData.get("description") as string;
    const requirements = formData.get("requirements") as string;
    const working_hours = formData.get("working_hours") as string;
    const holidays = formData.get("holidays") as string;
    const benefits = formData.get("benefits") as string;
    const selection_process = formData.get("selection_process") as string;
    const nearest_station = formData.get("nearest_station") as string;
    const location_notes = formData.get("location_notes") as string;
    const salary_type = formData.get("salary_type") as string;
    const raise_info = formData.get("raise_info") as string;
    const bonus_info = formData.get("bonus_info") as string;
    const commute_allowance = formData.get("commute_allowance") as string;
    const job_category_detail = formData.get("job_category_detail") as string;
    const attire_type = formData.get("attire_type") as string;
    const hair_style = formData.get("hair_style") as string;

    const { error } = await supabase
        .from("draft_jobs")
        .update({
            title,
            area,
            type,
            salary,
            category,
            tags,
            description,
            requirements,
            working_hours,
            holidays,
            benefits,
            selection_process,
            nearest_station,
            location_notes,
            salary_type,
            attire_type,
            hair_style,
            raise_info,
            bonus_info,
            commute_allowance,
            job_category_detail,
            updated_at: new Date().toISOString()
        })
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/batch-import");
    return { success: true };
}

/**
 * Delete a draft job
 * @param id - Draft job ID
 * @returns Success or error
 */
export async function deleteDraftJob(id: string): Promise<{ success?: boolean; error?: string }> {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = createSupabaseClient();

    const { error } = await supabase
        .from("draft_jobs")
        .delete()
        .eq("id", id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin/batch-import");
    return { success: true };
}

/**
 * Publish draft jobs to production
 * @param ids - Array of draft job IDs to publish
 * @returns Success or error
 */
export async function publishDraftJobs(
    ids: string[]
): Promise<{ success?: boolean; error?: string; count?: number }> {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = createSupabaseClient();

    if (!ids || ids.length === 0) {
        return { error: "No jobs selected" };
    }

    try {
        // Get draft jobs
        const { data: draftJobs, error: fetchError } = await supabase
            .from("draft_jobs")
            .select("*")
            .in("id", ids);

        if (fetchError || !draftJobs) {
            return { error: fetchError?.message || "Failed to fetch draft jobs" };
        }

        let successCount = 0;
        const errors: string[] = [];

        // Insert each draft job into jobs table
        for (const draft of draftJobs) {
            // Auto-generate Job Code
            const job_code = `${Math.floor(100000 + Math.random() * 900000)}`;

            const { error: insertError } = await supabase
                .from("jobs")
                .insert({
                    title: draft.title,
                    job_code,
                    area: draft.area,
                    type: draft.type,
                    salary: draft.salary,
                    category: draft.category,
                    tags: draft.tags,
                    description: draft.description,
                    requirements: draft.requirements,
                    working_hours: draft.working_hours,
                    holidays: draft.holidays,
                    benefits: draft.benefits,
                    selection_process: draft.selection_process,
                    ai_analysis: draft.ai_analysis,
                    nearest_station: draft.nearest_station,
                    location_notes: draft.location_notes,
                    salary_type: draft.salary_type,
                    attire_type: draft.attire_type,
                    hair_style: draft.hair_style,
                    raise_info: draft.raise_info,
                    bonus_info: draft.bonus_info,
                    commute_allowance: draft.commute_allowance,
                    job_category_detail: draft.job_category_detail
                });

            if (insertError) {
                errors.push(`${draft.title}: ${insertError.message}`);
            } else {
                successCount++;
            }
        }

        // Delete published draft jobs
        if (successCount > 0) {
            const { error: deleteError } = await supabase
                .from("draft_jobs")
                .delete()
                .in("id", ids);

            if (deleteError) {
                console.error("Failed to delete draft jobs:", deleteError);
            }
        }

        revalidatePath("/jobs");
        revalidatePath("/admin/jobs");
        revalidatePath("/admin/batch-import");

        if (errors.length > 0 && successCount === 0) {
            return { error: `Failed to publish: ${errors.join(", ")}` };
        } else if (errors.length > 0) {
            return {
                success: true,
                count: successCount,
                error: `${successCount}件公開しました（${errors.length}件失敗: ${errors.join(", ")}）`
            };
        }

        return { success: true, count: successCount };
    } catch (error) {
        console.error("Publish error:", error);
        return { error: error instanceof Error ? error.message : "Unknown error" };
    }
}
