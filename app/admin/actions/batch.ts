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
                requirements: extractedData.requirements || null,
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
                    source_mode: mode,
                    // 正社員専用フィールド
                    ...((extractedData.type === '正社員' || extractedData.type === '契約社員') ? {
                        fulltime_details: {
                            company_name: extractedData.company_name || null,
                            is_company_name_public: true,
                            company_address: extractedData.company_address || null,
                            industry: extractedData.industry || null,
                            company_size: extractedData.company_size || null,
                            established_date: extractedData.established_date || null,
                            company_overview: extractedData.company_overview || null,
                            business_overview: extractedData.business_overview || null,
                            annual_salary_min: extractedData.annual_salary_min || null,
                            annual_salary_max: extractedData.annual_salary_max || null,
                            overtime_hours: extractedData.overtime_hours || null,
                            annual_holidays: extractedData.annual_holidays || null,
                            probation_period: extractedData.probation_period || null,
                            probation_details: extractedData.probation_details || null,
                            part_time_available: false,
                            smoking_policy: extractedData.smoking_policy || null,
                            appeal_points: extractedData.appeal_points || null,
                            welcome_requirements: Array.isArray(extractedData.welcome_requirements)
                                ? extractedData.welcome_requirements.join(', ')
                                : extractedData.welcome_requirements || null,
                            department_details: extractedData.department_details || null,
                            recruitment_background: extractedData.recruitment_background || null,
                            company_url: extractedData.company_url || null,
                            education_training: extractedData.education_training || null,
                            representative: extractedData.representative || null,
                            capital: extractedData.capital || null,
                            work_location_detail: extractedData.work_location_detail || null,
                            salary_detail: extractedData.salary_detail || null,
                            transfer_policy: extractedData.transfer_policy || null,
                            salary_example: extractedData.salary_example || null,
                            annual_revenue: extractedData.annual_revenue || null,
                            onboarding_process: extractedData.onboarding_process || null,
                            interview_location: extractedData.interview_location || null,
                            salary_breakdown: extractedData.salary_breakdown || null,
                        }
                    } : {}),
                    // 派遣専用フィールド
                    ...((extractedData.type === '派遣' || extractedData.type === '紹介予定派遣') ? {
                        dispatch_details: {
                            client_company_name: extractedData.client_company_name || null,
                            is_client_company_public: false,
                            training_salary: extractedData.training_salary || null,
                            training_period: extractedData.training_period || null,
                            end_date: extractedData.end_date || null,
                            actual_work_hours: extractedData.actual_work_hours || null,
                            work_days_per_week: extractedData.work_days_per_week || null,
                            nail_policy: extractedData.nail_policy || null,
                            shift_notes: extractedData.shift_notes || null,
                            general_notes: extractedData.general_notes || null,
                            welcome_requirements: Array.isArray(extractedData.welcome_requirements)
                                ? extractedData.welcome_requirements.join(', ')
                                : extractedData.welcome_requirements || null,
                        }
                    } : {}),
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

        // Insert each draft job into jobs table + detail tables
        for (const draft of draftJobs) {
            // Auto-generate Job Code
            const job_code = `${Math.floor(100000 + Math.random() * 900000)}`;

            // ai_analysisからフィールドを補完
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ai = (draft.ai_analysis || {}) as Record<string, any>;

            const { data: jobData, error: insertError } = await supabase
                .from("jobs")
                .insert({
                    title: draft.title,
                    job_code,
                    area: draft.area,
                    search_areas: draft.search_areas || ai.search_areas || [],
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
                    nearest_station: draft.nearest_station || ai.nearest_station,
                    location_notes: draft.location_notes || ai.location_notes,
                    salary_type: draft.salary_type || ai.salary_type,
                    attire_type: draft.attire_type || ai.attire_type,
                    hair_style: draft.hair_style || ai.hair_style,
                    raise_info: draft.raise_info || ai.raise_info,
                    bonus_info: draft.bonus_info || ai.bonus_info,
                    commute_allowance: draft.commute_allowance || ai.commute_allowance,
                    job_category_detail: draft.job_category_detail || ai.job_category_detail,
                    hourly_wage: draft.hourly_wage || ai.hourly_wage || null,
                    salary_description: ai.salary_description || null,
                    period: ai.period || null,
                    start_date: ai.start_date || null,
                    workplace_name: ai.workplace_name || null,
                    workplace_address: ai.workplace_address || null,
                    workplace_access: ai.workplace_access || null,
                    published_at: new Date().toISOString(),
                })
                .select("id, type")
                .single();

            if (insertError) {
                errors.push(`${draft.title}: ${insertError.message}`);
                continue;
            }

            successCount++;

            // 雇用形態別の詳細テーブルを作成
            if (jobData) {
                const jobType = jobData.type;
                if (jobType === "派遣" || jobType === "紹介予定派遣") {
                    const { error: detailError } = await supabase
                        .from("dispatch_job_details")
                        .insert({
                            id: jobData.id,
                            client_company_name: ai.client_company_name || null,
                            is_client_company_public: false,
                            training_salary: ai.training_salary || null,
                            training_period: ai.training_period || null,
                            end_date: ai.end_date || null,
                            actual_work_hours: ai.actual_work_hours || null,
                            work_days_per_week: ai.work_days_per_week || null,
                            nail_policy: ai.nail_policy || null,
                            shift_notes: ai.shift_notes || null,
                            general_notes: ai.general_notes || null,
                            welcome_requirements: ai.welcome_requirements || null,
                        });
                    if (detailError) {
                        console.error(`Dispatch detail insert error for ${draft.title}:`, detailError);
                    }
                } else if (jobType === "正社員" || jobType === "契約社員") {
                    const { error: detailError } = await supabase
                        .from("fulltime_job_details")
                        .insert({
                            id: jobData.id,
                            company_name: ai.company_name || null,
                            is_company_name_public: true,
                            company_address: ai.company_address || null,
                            industry: ai.industry || null,
                            company_size: ai.company_size || null,
                            established_date: ai.established_date || null,
                            company_overview: ai.company_overview || null,
                            business_overview: ai.business_overview || null,
                            annual_salary_min: ai.annual_salary_min || null,
                            annual_salary_max: ai.annual_salary_max || null,
                            overtime_hours: ai.overtime_hours || null,
                            annual_holidays: ai.annual_holidays || null,
                            probation_period: ai.probation_period || null,
                            probation_details: ai.probation_details || null,
                            part_time_available: ai.part_time_available || false,
                            smoking_policy: ai.smoking_policy || null,
                            appeal_points: ai.appeal_points || null,
                            welcome_requirements: ai.welcome_requirements || null,
                            department_details: ai.department_details || null,
                            recruitment_background: ai.recruitment_background || null,
                            company_url: ai.company_url || null,
                            education_training: ai.education_training || null,
                            representative: ai.representative || null,
                            capital: ai.capital || null,
                            work_location_detail: ai.work_location_detail || null,
                            salary_detail: ai.salary_detail || null,
                            transfer_policy: ai.transfer_policy || null,
                            salary_example: ai.salary_example || null,
                            bonus: ai.bonus || null,
                            raise: ai.raise || ai.raise_info || null,
                            annual_revenue: ai.annual_revenue || null,
                            onboarding_process: ai.onboarding_process || null,
                            interview_location: ai.interview_location || null,
                            salary_breakdown: ai.salary_breakdown || null,
                            shift_notes: ai.shift_notes || null,
                        });
                    if (detailError) {
                        console.error(`Fulltime detail insert error for ${draft.title}:`, detailError);
                    }
                }
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
