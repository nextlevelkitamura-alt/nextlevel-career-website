"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "./auth";

// Get all jobs (with client name)
export async function getJobs(query?: string) {
    const supabase = createSupabaseClient();
    let builder = supabase
        .from("jobs")
        .select("*, clients(name), job_attachments(id), dispatch_job_details(*), fulltime_job_details(*)")
        .order("created_at", { ascending: false });

    if (query) {
        builder = builder.or(`title.ilike.%${query}%,job_code.ilike.%${query}%`);
    }

    const { data, error } = await builder;

    if (error) throw new Error(error.message);
    return data;
}

// Get all unique tags from jobs
export async function getAllUniqueTags() {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("jobs")
        .select("tags");

    if (error) throw new Error(error.message);

    // Flatten and unique
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allTags = data.flatMap((job: any) => job.tags || []);
    const uniqueTags = Array.from(new Set(allTags)).filter(Boolean).sort() as string[];

    return uniqueTags;
}

// Get single job with attachments and details
export async function getJob(id: string) {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("jobs")
        .select("*, clients(name), job_attachments(*), dispatch_job_details(*), fulltime_job_details(*)")
        .eq("id", id)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

// Create job
export async function createJob(formData: FormData) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const title = formData.get("title") as string;

    // Auto-generate Job Code (e.g., 123456)
    const job_code = `${Math.floor(100000 + Math.random() * 900000)}`;

    const area = formData.get("area") as string;
    const type = formData.get("type") as string;
    const salary = formData.get("salary") as string;
    const category = formData.get("category") as string;

    // Parse search_areas
    const searchAreasRaw = formData.get("search_areas") as string;
    let search_areas: string[] = [];
    try {
        const parsed = JSON.parse(searchAreasRaw);
        if (Array.isArray(parsed)) search_areas = parsed.filter(Boolean);
    } catch { /* ignore */ }

    // Parse tags: Handle both JSON string (from TagSelector) and legacy space-separated string
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

    const client_id = formData.get("client_id") as string || null;

    const description = formData.get("description") as string;
    const requirements = formData.get("requirements") as string;
    const working_hours = formData.get("working_hours") as string;
    const holidays = formData.get("holidays") as string;
    const benefits = formData.get("benefits") as string;
    const selection_process = formData.get("selection_process") as string;

    // New fields
    const hourly_wage = formData.get("hourly_wage") ? parseInt(formData.get("hourly_wage") as string) : null;
    const salary_description = formData.get("salary_description") as string;
    const period = formData.get("period") as string;
    const start_date = formData.get("start_date") as string;
    const workplace_name = formData.get("workplace_name") as string;
    const workplace_address = formData.get("workplace_address") as string;
    const workplace_access = formData.get("workplace_access") as string;
    const attire = formData.get("attire") as string;
    const attire_type = formData.get("attire_type") as string;
    const hair_style = formData.get("hair_style") as string;
    const nearest_station = formData.get("nearest_station") as string;
    const location_notes = formData.get("location_notes") as string;
    const salary_type = formData.get("salary_type") as string;
    const raise_info = formData.get("raise_info") as string;
    const bonus_info = formData.get("bonus_info") as string;
    const commute_allowance = formData.get("commute_allowance") as string;
    const job_category_detail = formData.get("job_category_detail") as string;

    // 派遣専用フィールド
    const client_company_name = formData.get("client_company_name") as string;
    const is_client_company_public = formData.get("is_client_company_public") === "true";
    const training_salary = formData.get("training_salary") as string;
    const training_period = formData.get("training_period") as string;
    const end_date = formData.get("end_date") as string;
    const actual_work_hours = formData.get("actual_work_hours") as string;
    const work_days_per_week = formData.get("work_days_per_week") as string;
    const nail_policy = formData.get("nail_policy") as string;
    const shift_notes = formData.get("shift_notes") as string;
    const general_notes = formData.get("general_notes") as string;

    // 正社員専用フィールド
    const company_name = formData.get("company_name") as string;
    const is_company_name_public = formData.get("is_company_name_public") === "true";
    const company_address = formData.get("company_address") as string;
    const industry = formData.get("industry") as string;
    const company_size = formData.get("company_size") as string;
    const established_date = formData.get("established_date") as string;
    const company_overview = formData.get("company_overview") as string;
    const business_overview = formData.get("business_overview") as string;
    const annual_salary_min = formData.get("annual_salary_min") ? parseInt(formData.get("annual_salary_min") as string) : null;
    const annual_salary_max = formData.get("annual_salary_max") ? parseInt(formData.get("annual_salary_max") as string) : null;
    const overtime_hours = formData.get("overtime_hours") as string;
    const annual_holidays = (formData.get("annual_holidays") as string) || null;
    const probation_period = formData.get("probation_period") as string;
    const probation_details = formData.get("probation_details") as string;
    const part_time_available = formData.get("part_time_available") === "true";
    const smoking_policy = formData.get("smoking_policy") as string;
    const appeal_points = formData.get("appeal_points") as string;
    const welcome_requirements = formData.get("welcome_requirements") as string;
    const department_details = formData.get("department_details") as string;
    const recruitment_background = formData.get("recruitment_background") as string;
    const company_url = formData.get("company_url") as string;
    const education_training = formData.get("education_training") as string;
    const representative = formData.get("representative") as string;
    const capital = formData.get("capital") as string;
    const work_location_detail = formData.get("work_location_detail") as string;
    const salary_detail = formData.get("salary_detail") as string;
    const transfer_policy = formData.get("transfer_policy") as string;
    const salary_example = formData.get("salary_example") as string;
    const bonus = formData.get("bonus") as string;
    const raise_value = formData.get("raise") as string;
    const annual_revenue = formData.get("annual_revenue") as string;
    const onboarding_process = formData.get("onboarding_process") as string;
    const interview_location = formData.get("interview_location") as string;
    const published_at = formData.get("published_at") as string || null;
    const expires_at = formData.get("expires_at") as string || null;

    const { data: jobData, error } = await supabase.from("jobs").insert({
        title,
        job_code,
        area,
        search_areas,
        type,
        salary,
        category,
        tags,
        client_id,
        description,
        requirements,
        working_hours,
        holidays,
        benefits,
        selection_process,
        hourly_wage,
        salary_description,
        period,
        start_date,
        workplace_name,
        workplace_address,
        workplace_access,
        attire,
        attire_type,
        hair_style,
        nearest_station,
        location_notes,
        salary_type,
        raise_info,
        bonus_info,
        commute_allowance,
        job_category_detail,
        published_at: published_at || new Date().toISOString(),
        expires_at: expires_at || null,
    }).select().single();

    if (error) return { error: error.message };

    // 雇用形態別の詳細情報を保存
    if (jobData) {
        if (type === "派遣" || type === "紹介予定派遣") {
            // 派遣求人詳細を保存
            const { error: dispatchError } = await supabase.from("dispatch_job_details").insert({
                id: jobData.id,
                client_company_name,
                is_client_company_public,
                training_salary,
                training_period,
                end_date,
                actual_work_hours,
                work_days_per_week,
                nail_policy,
                shift_notes,
                general_notes,
            });

            if (dispatchError) {
                console.error("Dispatch details insert error:", dispatchError);
                return { error: `派遣詳細の保存に失敗しました: ${dispatchError.message}` };
            }
        } else if (type === "正社員" || type === "契約社員") {
            // 正社員・契約社員求人詳細を保存
            const { error: fulltimeError } = await supabase.from("fulltime_job_details").insert({
                id: jobData.id,
                company_name,
                is_company_name_public,
                company_address,
                industry,
                company_size,
                established_date,
                company_overview,
                business_overview,
                annual_salary_min,
                annual_salary_max,
                overtime_hours,
                annual_holidays,
                probation_period,
                probation_details,
                part_time_available,
                smoking_policy,
                appeal_points,
                welcome_requirements,
                department_details,
                recruitment_background,
                company_url,
                education_training,
                representative,
                capital,
                work_location_detail,
                salary_detail,
                transfer_policy,
                salary_example,
                bonus,
                raise: raise_value,
                annual_revenue,
                onboarding_process,
                interview_location,
            });

            if (fulltimeError) {
                console.error("Fulltime details insert error:", fulltimeError);
                return { error: `正社員詳細の保存に失敗しました: ${fulltimeError.message}` };
            }
        }
    }

    // Handle Pre-registered (Draft) Files
    const draftFileIds = formData.getAll("draft_file_ids") as string[];
    if (draftFileIds.length > 0 && jobData) {
        const { data: drafts, error: fetchError } = await supabase
            .from("job_draft_files")
            .select("*")
            .in("id", draftFileIds);

        if (!fetchError && drafts) {
            for (const draft of drafts) {
                // Insert into job_attachments
                await supabase.from("job_attachments").insert({
                    job_id: jobData.id,
                    file_name: draft.file_name,
                    file_url: draft.file_url,
                    file_type: draft.file_type,
                    file_size: draft.file_size,
                });

                // Remove from job_draft_files (now linked to a job)
                await supabase.from("job_draft_files").delete().eq("id", draft.id);
            }
        }
    }

    // Handle Multiple PDF Uploads (Direct uploads from form)
    const files = formData.getAll("pdf_files") as File[];
    if (files.length > 0 && jobData) {
        const uploadErrors: string[] = [];
        for (const file of files) {
            if (file.size > 0) {
                const extension = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
                const { error: uploadError } = await supabase.storage
                    .from("job-documents")
                    .upload(fileName, file);

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    uploadErrors.push(`Failed to upload ${file.name}: ${uploadError.message}`);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from("job-documents")
                    .getPublicUrl(fileName);

                // Fix for Japanese filenames (mojibake)
                const originalName = Buffer.from(file.name, "latin1").toString("utf8");

                const { error: insertError } = await supabase.from("job_attachments").insert({
                    job_id: jobData.id,
                    file_name: originalName,
                    file_url: publicUrl,
                    file_type: file.type,
                    file_size: file.size,
                });

                if (insertError) {
                    console.error("DB Insert error:", insertError);
                    uploadErrors.push(`Failed to save record for ${file.name}: ${insertError.message}`);
                }
            }
        }
        if (uploadErrors.length > 0) {
            return { error: uploadErrors.join(", ") };
        }
    }

    revalidatePath("/jobs");
    revalidatePath("/admin/jobs");
    revalidatePath("/admin/jobs/pre-registration");
    return { success: true };
}

// Update job
export async function updateJob(id: string, formData: FormData) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const title = formData.get("title") as string;
    const area = formData.get("area") as string;
    const type = formData.get("type") as string;
    const salary = formData.get("salary") as string;
    const category = formData.get("category") as string;

    // Parse search_areas
    const searchAreasRaw = formData.get("search_areas") as string;
    let search_areas: string[] = [];
    try {
        const parsed = JSON.parse(searchAreasRaw);
        if (Array.isArray(parsed)) search_areas = parsed.filter(Boolean);
    } catch { /* ignore */ }

    // Parse tags: Handle both JSON string (from TagSelector) and legacy space-separated string
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

    const client_id = formData.get("client_id") as string || null;

    const description = formData.get("description") as string;
    const requirements = formData.get("requirements") as string;
    const working_hours = formData.get("working_hours") as string;
    const holidays = formData.get("holidays") as string;
    const benefits = formData.get("benefits") as string;
    const selection_process = formData.get("selection_process") as string;

    // New fields
    const hourly_wage = formData.get("hourly_wage") ? parseInt(formData.get("hourly_wage") as string) : null;
    const salary_description = formData.get("salary_description") as string;
    const period = formData.get("period") as string;
    const start_date = formData.get("start_date") as string;
    const workplace_name = formData.get("workplace_name") as string;
    const workplace_address = formData.get("workplace_address") as string;
    const workplace_access = formData.get("workplace_access") as string;
    const attire = formData.get("attire") as string;
    const attire_type = formData.get("attire_type") as string;
    const hair_style = formData.get("hair_style") as string;
    const nearest_station = formData.get("nearest_station") as string;
    const location_notes = formData.get("location_notes") as string;
    const salary_type = formData.get("salary_type") as string;
    const raise_info = formData.get("raise_info") as string;
    const bonus_info = formData.get("bonus_info") as string;
    const commute_allowance = formData.get("commute_allowance") as string;
    const job_category_detail = formData.get("job_category_detail") as string;

    // 派遣専用フィールド
    const client_company_name = formData.get("client_company_name") as string;
    const is_client_company_public = formData.get("is_client_company_public") === "true";
    const training_salary = formData.get("training_salary") as string;
    const training_period = formData.get("training_period") as string;
    const end_date = formData.get("end_date") as string;
    const actual_work_hours = formData.get("actual_work_hours") as string;
    const work_days_per_week = formData.get("work_days_per_week") as string;
    const nail_policy = formData.get("nail_policy") as string;
    const shift_notes = formData.get("shift_notes") as string;
    const general_notes = formData.get("general_notes") as string;

    // 正社員専用フィールド
    const company_name = formData.get("company_name") as string;
    const is_company_name_public = formData.get("is_company_name_public") === "true";
    const company_address = formData.get("company_address") as string;
    const industry = formData.get("industry") as string;
    const company_size = formData.get("company_size") as string;
    const established_date = formData.get("established_date") as string;
    const company_overview = formData.get("company_overview") as string;
    const business_overview = formData.get("business_overview") as string;
    const annual_salary_min = formData.get("annual_salary_min") ? parseInt(formData.get("annual_salary_min") as string) : null;
    const annual_salary_max = formData.get("annual_salary_max") ? parseInt(formData.get("annual_salary_max") as string) : null;
    const overtime_hours = formData.get("overtime_hours") as string;
    const annual_holidays = (formData.get("annual_holidays") as string) || null;
    const probation_period = formData.get("probation_period") as string;
    const probation_details = formData.get("probation_details") as string;
    const part_time_available = formData.get("part_time_available") === "true";
    const smoking_policy = formData.get("smoking_policy") as string;
    const appeal_points = formData.get("appeal_points") as string;
    const welcome_requirements = formData.get("welcome_requirements") as string;
    const department_details = formData.get("department_details") as string;
    const recruitment_background = formData.get("recruitment_background") as string;
    const company_url = formData.get("company_url") as string;
    const education_training = formData.get("education_training") as string;
    const representative = formData.get("representative") as string;
    const capital = formData.get("capital") as string;
    const work_location_detail = formData.get("work_location_detail") as string;
    const salary_detail = formData.get("salary_detail") as string;
    const transfer_policy = formData.get("transfer_policy") as string;
    const salary_example = formData.get("salary_example") as string;
    const bonus = formData.get("bonus") as string;
    const raise_value = formData.get("raise") as string;
    const annual_revenue = formData.get("annual_revenue") as string;
    const onboarding_process = formData.get("onboarding_process") as string;
    const interview_location = formData.get("interview_location") as string;
    const published_at = formData.get("published_at") as string || null;
    const expires_at = formData.get("expires_at") as string || null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
        title,
        // job_code is not updatable
        area,
        search_areas,
        type,
        salary,
        category,
        tags,
        client_id,
        description,
        requirements,
        working_hours,
        holidays,
        benefits,
        selection_process,
        hourly_wage,
        salary_description,
        period,
        start_date,
        workplace_name,
        workplace_address,
        workplace_access,
        attire,
        attire_type,
        hair_style,
        nearest_station,
        location_notes,
        salary_type,
        raise_info,
        bonus_info,
        commute_allowance,
        job_category_detail,
        published_at: published_at || undefined,
        expires_at: expires_at || null,
    };

    const { error } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", id);

    if (error) return { error: error.message };

    // 雇用形態別の詳細情報を更新（upsert）
    if (type === "派遣" || type === "紹介予定派遣") {
        // 派遣求人詳細を upsert
        const { error: dispatchError } = await supabase
            .from("dispatch_job_details")
            .upsert({
                id,
                client_company_name,
                is_client_company_public,
                training_salary,
                training_period,
                end_date,
                actual_work_hours,
                work_days_per_week,
                nail_policy,
                shift_notes,
                general_notes,
            }, {
                onConflict: 'id'
            });

        if (dispatchError) {
            console.error("Dispatch details upsert error:", dispatchError);
        }
    } else if (type === "正社員" || type === "契約社員") {
        // 正社員・契約社員求人詳細を upsert
        const { error: fulltimeError } = await supabase
            .from("fulltime_job_details")
            .upsert({
                id,
                company_name,
                is_company_name_public,
                company_address,
                industry,
                company_size,
                established_date,
                company_overview,
                business_overview,
                annual_salary_min,
                annual_salary_max,
                overtime_hours,
                annual_holidays,
                probation_period,
                probation_details,
                part_time_available,
                smoking_policy,
                appeal_points,
                welcome_requirements,
                department_details,
                recruitment_background,
                company_url,
                education_training,
                representative,
                capital,
                work_location_detail,
                salary_detail,
                transfer_policy,
                salary_example,
                bonus,
                raise: raise_value,
                annual_revenue,
                onboarding_process,
                interview_location,
            }, {
                onConflict: 'id'
            });

        if (fulltimeError) {
            console.error("Fulltime details upsert error:", fulltimeError);
        }
    }

    // Handle New File Uploads
    const files = formData.getAll("pdf_files") as File[];
    console.error(`[updateJob] Received ${files.length} files`);

    if (files.length > 0) {
        const uploadErrors: string[] = [];
        for (const file of files) {
            console.error(`[updateJob] Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);
            if (file.size > 0) {
                const extension = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;
                const { error: uploadError } = await supabase.storage
                    .from("job-documents")
                    .upload(fileName, file);

                if (uploadError) {
                    console.error("Upload error:", uploadError);
                    uploadErrors.push(`Failed to upload ${file.name}: ${uploadError.message}`);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from("job-documents")
                    .getPublicUrl(fileName);

                // Fix for Japanese filenames (mojibake)
                // FormData sometimes encodes non-ASCII filenames as Latin-1
                const originalName = Buffer.from(file.name, "latin1").toString("utf8");

                const { error: insertError } = await supabase.from("job_attachments").insert({
                    job_id: id,
                    file_name: originalName,
                    file_url: publicUrl,
                    file_type: file.type,
                    file_size: file.size,
                });

                if (insertError) {
                    console.error("DB Insert error:", insertError);
                    uploadErrors.push(`Failed to save record for ${file.name}: ${insertError.message}`);
                }
            }
        }
        if (uploadErrors.length > 0) {
            return { error: uploadErrors.join(", ") };
        }
    }

    revalidatePath("/jobs");
    revalidatePath("/admin/jobs");
    return { success: true };
}

// Delete job
export async function deleteJob(id: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase.from("jobs").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/jobs");
    revalidatePath("/admin/jobs");
    return { success: true };
}

// Delete job file
export async function deleteJobFile(fileId: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    // Get file info first to delete from storage
    const { data: file } = await supabase
        .from("job_attachments")
        .select("file_url")
        .eq("id", fileId)
        .single();

    if (file) {
        // Extract filename from URL (simplified, might need robust parsing)
        const fileName = file.file_url.split('/').pop();
        if (fileName) {
            await supabase.storage.from("job-documents").remove([fileName]);
        }
    }

    const { error } = await supabase
        .from("job_attachments")
        .delete()
        .eq("id", fileId);

    if (error) return { error: error.message };

    revalidatePath("/admin/jobs");
    return { success: true };
}

// Delete legacy job file (pdf_url)
export async function deleteLegacyJobFile(jobId: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    // Get file info first
    const { data: job } = await supabase
        .from("jobs")
        .select("pdf_url")
        .eq("id", jobId)
        .single();

    if (job?.pdf_url) {
        // Extract filename from URL
        const fileName = job.pdf_url.split('/').pop();
        if (fileName) {
            await supabase.storage.from("job-documents").remove([fileName]);
        }
    }

    const { error } = await supabase
        .from("jobs")
        .update({ pdf_url: null })
        .eq("id", jobId);

    if (error) return { error: error.message };

    revalidatePath("/admin/jobs");
    return { success: true };
}
