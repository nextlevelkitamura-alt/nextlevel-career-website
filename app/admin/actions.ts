"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { JOB_MASTERS } from "@/app/constants/jobMasters";
import { extractTokenUsage, logTokenUsage } from "@/utils/gemini";
import { buildExtractionSystemInstruction, buildExtractionUserPrompt } from "@/utils/promptBuilder";
import type { TokenUsage } from "@/utils/types";

import { revalidatePath } from "next/cache";

const SUPER_ADMIN_EMAIL = "nextlevel.kitamura@gmail.com";

// Check if current user is admin
export async function checkAdmin() {
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return false;
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    return profile?.is_admin === true;
}

// Get all clients
export async function getClients() {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
}

// Create new client
export async function createClient(name: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("clients")
        .insert({ name })
        .select()
        .single();

    if (error) return { error: error.message };
    return { success: true, client: data };
}

// Delete client
export async function deleteClient(id: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };
    return { success: true };
}

// Update client
export async function updateClient(id: string, name: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("clients")
        .update({ name })
        .eq("id", id);

    if (error) return { error: error.message };
    return { success: true };
}

// Get Job Options (used by MastersTagManager)
export async function getJobOptions(category?: string) {
    const supabase = createSupabaseClient();
    let query = supabase.from("job_options").select("*").order("created_at", { ascending: true });

    if (category) {
        query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

// Create Job Option (used by MastersTagManager)
export async function createJobOption(category: string, label: string, value: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("job_options")
        .insert({ category, label, value })
        .select()
        .single();

    if (error) return { error: error.message };
    return { success: true, option: data };
}

// Delete Job Option (used by MastersTagManager)
export async function deleteJobOption(id: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("job_options")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };
    return { success: true };
}

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
                job_id: jobData.id,
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
                welcome_requirements,
            });

            if (dispatchError) {
                console.error("Dispatch details insert error:", dispatchError);
                // 既に jobs にデータが入っているので、エラーでもロールバックはしない
            }
        } else if (type === "正社員" || type === "契約社員") {
            // 正社員・契約社員求人詳細を保存
            const { error: fulltimeError } = await supabase.from("fulltime_job_details").insert({
                job_id: jobData.id,
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
            });

            if (fulltimeError) {
                console.error("Fulltime details insert error:", fulltimeError);
                // 既に jobs にデータが入っているので、エラーでもロールバックはしない
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
                job_id: id,
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
                welcome_requirements,
            }, {
                onConflict: 'job_id'
            });

        if (dispatchError) {
            console.error("Dispatch details upsert error:", dispatchError);
        }
    } else if (type === "正社員" || type === "契約社員") {
        // 正社員・契約社員求人詳細を upsert
        const { error: fulltimeError } = await supabase
            .from("fulltime_job_details")
            .upsert({
                job_id: id,
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
            }, {
                onConflict: 'job_id'
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

// Get all applications for admin
export async function getAdminApplications() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    // Separate queries to avoid relation issues between applications and profiles
    const { data: applications, error } = await supabase
        .from("applications")
        .select(`
            *,
            jobs (
                title,
                id
            )
        `)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    // Fetch profiles for these applications
    const userIds = Array.from(new Set(applications.map(app => app.user_id)));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let profiles: any[] = [];

    if (userIds.length > 0) {
        const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, last_name, first_name, last_name_kana, first_name_kana, birth_date, prefecture, phone_number")
            .in("id", userIds);
        profiles = profilesData || [];
    }

    // Merge data
    const data = applications.map(app => ({
        ...app,
        profiles: profiles.find(p => p.id === app.user_id) || null
    }));

    return data;
}

// Update application status
export async function updateApplicationStatus(id: string, newStatus: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/applications");
    return { success: true };
}

// Update application memo
export async function updateApplicationMemo(id: string, memo: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("applications")
        .update({ admin_memo: memo })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/applications");
    return { success: true };
}

// (Moved to top of file)

// Get all users for administration
export async function getAdminUsers() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    // Fetch profiles. Assuming 'email' column exists based on auth actions.
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return profiles;
}

// Update user role (isAdmin status)
export async function updateUserRole(targetUserId: string, makeAdmin: boolean) {
    // 1. Security Check: Operator must be an admin
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) throw new Error("Unauthorized");

    // 2. Safety Lock: Prevent self-demotion
    if (currentUser.id === targetUserId && !makeAdmin) {
        return { error: "自分自身の管理者権限は解除できません（安全装置）" };
    }

    // 3. Super Admin Protection: Prevent editing the Owner
    // Fetch target user's profile to check email
    const { data: targetProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", targetUserId)
        .single();

    if (targetProfile && targetProfile.email === SUPER_ADMIN_EMAIL) {
        return { error: "オーナー（Super Admin）の権限は変更できません" };
    }

    const { error } = await supabase
        .from("profiles")
        .update({ is_admin: makeAdmin })
        .eq("id", targetUserId);

    if (error) return { error: error.message };

    revalidatePath("/admin/users");
    return { success: true };
}

// Delete user (Owner Only)
// Requires SUPABASE_SERVICE_ROLE_KEY in .env
export async function deleteUser(targetUserId: string) {
    const supabase = createSupabaseClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // 1. Verify Admin (Any admin can delete users, but restricted targets)
    const isAdmin = await checkAdmin();
    if (!isAdmin || !currentUser) {
        throw new Error("Unauthorized: Only Admins can delete users.");
    }

    // 2. Prevent self-deletion and Owner deletion
    if (currentUser.id === targetUserId) {
        return { error: "自分自身を削除することはできません。" };
    }

    // Check if target is the Super Admin
    // We need to fetch the target user's email to verify if they are the owner
    // Since we are using admin client later, we can check it then, or assume the ID check is enough if we knew the ID. 
    // But email is safer.
    // However, for efficiency, let's proceed to create admin client and then check target user details if needed, 
    // OR just rely on the UI hiding it and this being a "good enough" check for now? 
    // Better to be safe. We can check if targetUserId matches the owner's ID if we knew it, but we don't.
    // So let's just proceed. If the target IS the owner, we should block it.
    // But `deleteUser` implementation below uses `adminClient.auth.admin.deleteUser`.
    // We should probably check the target user's email before deleting.

    // Let's check target user email via Admin Client
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return { error: "サーバー設定エラー: Service Role Keyが見つかりません。" };
    }

    const adminClient = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    const { data: { user: targetUser }, error: fetchError } = await adminClient.auth.admin.getUserById(targetUserId);
    if (fetchError || !targetUser) {
        return { error: "ユーザーが見つかりません。" };
    }

    if (targetUser.email === SUPER_ADMIN_EMAIL) {
        return { error: "オーナー（Super Admin）を削除することはできません。" };
    }

    // Proceed to delete
    // 4. Delete from Auth (This should cascade to profiles usually, but we check)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
        console.error("Delete user error:", deleteError);
        return { error: "削除に失敗しました: " + deleteError.message };
    }

    revalidatePath("/admin/users");
    return { success: true };
}

// Get Client Inquiries
export async function getClientInquiries() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("client_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

// Update Inquiry Status
export async function updateInquiryStatus(id: string, newStatus: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("client_inquiries")
        .update({ status: newStatus })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/corporate-inquiries");
    return { success: true };
}

// Delete Inquiry
export async function deleteInquiry(id: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("client_inquiries")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/corporate-inquiries");
    return { success: true };
}

// Draft Files
export async function getDraftFiles() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("job_draft_files")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export async function uploadDraftFile(formData: FormData) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
        // Fallback for single file input if "files" is empty (legacy support if needed, but we will switch to "files")
        const singleFile = formData.get("file") as File;
        if (singleFile) files.push(singleFile);
    }

    if (files.length === 0) {
        return { error: "ファイルが選択されていないか、空のファイルです。" };
    }

    let successCount = 0;
    const errors: string[] = [];

    for (const file of files) {
        if (file.size === 0) continue;

        const extension = file.name.split('.').pop();
        const fileName = `drafts/${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

        const { error: uploadError } = await supabase.storage
            .from("job-documents")
            .upload(fileName, file);

        if (uploadError) {
            errors.push(`${file.name}: ${uploadError.message}`);
            continue;
        }

        const { data: { publicUrl } } = supabase.storage
            .from("job-documents")
            .getPublicUrl(fileName);

        // Fix for Japanese filenames
        const originalName = Buffer.from(file.name, "latin1").toString("utf8");

        // ONLY save to job_draft_files. DO NOT save to job_attachments (which requires job_id).
        const { error: insertError } = await supabase.from("job_draft_files").insert({
            file_name: originalName,
            file_url: publicUrl,
            file_type: file.type,
            file_size: file.size,
        });

        if (insertError) {
            errors.push(`${file.name}: ${insertError.message}`);
        } else {
            successCount++;
        }
    }

    revalidatePath("/admin/jobs/pre-registration");

    if (errors.length > 0 && successCount === 0) {
        return { error: `すべてのファイルのアップロードに失敗しました: ${errors.join(", ")}` };
    } else if (errors.length > 0) {
        return { success: true, message: `${successCount}件アップロードしました（${errors.length}件失敗: ${errors.join(", ")}）` };
    }

    return { success: true, count: successCount };
}

// Sync existing tags from jobs to job_options
export async function syncTagsToMaster() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    // 1. Get all tags from jobs
    const { data: jobs, error: jobsError } = await supabase
        .from("jobs")
        .select("tags");

    if (jobsError) return { error: jobsError.message };

    // Flatten and unique
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allTags = jobs.flatMap((job: any) => job.tags || []);
    const uniqueTags = Array.from(new Set(allTags)).filter(Boolean) as string[];

    if (uniqueTags.length === 0) return { success: true, count: 0 };

    // 2. Get existing tag options
    const { data: existingOptions, error: optionsError } = await supabase
        .from("job_options")
        .select("label")
        .eq("category", "tags");

    if (optionsError) return { error: optionsError.message };

    const existingLabels = new Set(existingOptions.map(o => o.label));

    // 3. Filter out existing ones
    const newTags = uniqueTags.filter(tag => !existingLabels.has(tag));

    if (newTags.length === 0) return { success: true, count: 0 };

    // 4. Insert new tags
    const inserts = newTags.map(tag => ({
        category: "tags",
        label: tag,
        value: tag
    }));

    const { error: insertError } = await supabase
        .from("job_options")
        .insert(inserts);

    if (insertError) return { error: insertError.message };

    return { success: true, count: newTags.length };
}

export async function deleteDraftFile(id: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    // Get file info to delete from storage first
    const { data: fileInfo, error: fetchError } = await supabase
        .from("job_draft_files")
        .select("file_url")
        .eq("id", id)
        .single();

    if (fetchError || !fileInfo) {
        return { error: "ファイルが見つかりません。" };
    }

    // Extract path from public URL
    // Public URL format: .../storage/v1/object/public/job-documents/drafts/filename.ext
    const pathParts = fileInfo.file_url.split("job-documents/");
    const filePath = pathParts[pathParts.length - 1];

    if (filePath) {
        await supabase.storage.from("job-documents").remove([filePath]);
    }

    const { error } = await supabase
        .from("job_draft_files")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/jobs/pre-registration");
    return { success: true };
}

// Get unread counts for admin navigation badges
export async function getAdminNotificationCounts() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { applications: 0, inquiries: 0 };

    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { applications: 0, inquiries: 0 };

    // Get IDs already read by this admin
    const { data: readItems } = await supabase
        .from("admin_notification_reads")
        .select("resource_id")
        .eq("admin_id", user.id);

    const readIds = readItems?.map(item => item.resource_id) || [];

    // Count pending applications not read by this admin
    let appQuery = supabase
        .from("applications")
        .select("*", { count: 'exact', head: true })
        .eq("status", "pending");

    if (readIds.length > 0) {
        appQuery = appQuery.not("id", "in", `(${readIds.join(",")})`);
    }
    const { count: appCount } = await appQuery;

    // Count unhandled inquiries not read by this admin
    let inquiryQuery = supabase
        .from("client_inquiries")
        .select("*", { count: 'exact', head: true })
        .eq("status", "未対応");

    if (readIds.length > 0) {
        inquiryQuery = inquiryQuery.not("id", "in", `(${readIds.join(",")})`);
    }
    const { count: inquiryCount } = await inquiryQuery;

    return {
        applications: appCount || 0,
        inquiries: inquiryCount || 0
    };
}

// Mark a resource as read by the current admin
export async function markAsRead(resourceType: "application" | "inquiry", resourceId: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "User not found" };

    const { error } = await supabase
        .from("admin_notification_reads")
        .upsert({
            admin_id: user.id,
            resource_type: resourceType,
            resource_id: resourceId,
            read_at: new Date().toISOString()
        }, { onConflict: "admin_id,resource_id" });

    if (error) return { error: error.message };

    revalidatePath("/admin/applications");
    revalidatePath("/admin/corporate-inquiries");
    return { success: true };
}

// Get Chat Inbox (Users contacted)
export async function getChatInbox() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    // Use Service Role client to bypass RLS if key is available, otherwise fall back to standard client (which will fail if RLS is strict)
    // Note: In strict RLS setup, standard client only sees own messages.
    // We assume SUPABASE_SERVICE_ROLE_KEY is set in env for this to work fully.
    let supabase;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceRoleKey) {
        const { createClient } = await import("@supabase/supabase-js");
        supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
        );
    } else {
        supabase = createSupabaseClient();
    }

    try {
        // Fetch unique user_ids from chat_messages
        const { data: messages, error } = await supabase
            .from("chat_messages")
            .select("user_id, created_at, content, is_read, sender_id, is_admin_message")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Chat messages fetch error:", error.message);
            // If service role missing and RLS blocks, we might get error or empty
            return [];
        }

        if (!messages || messages.length === 0) return [];

        // Group by user_id
        const chatsMap = new Map();
        const userIds = new Set();

        messages.forEach(msg => {
            if (!chatsMap.has(msg.user_id)) {
                chatsMap.set(msg.user_id, msg);
                userIds.add(msg.user_id);
            }
        });

        if (userIds.size === 0) return [];

        // Get User Profiles (Need to use same client or ensure public read access)
        // Profiles are usually public read, so standard client is fine, but service role is safer if policies change.
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url")
            .in("id", Array.from(userIds));

        if (!profiles) return [];

        // Combine
        const inbox = profiles.map(profile => {
            const lastMsg = chatsMap.get(profile.id);

            // Determine status
            let status = "read";
            if (lastMsg.is_admin_message) {
                status = "replied"; // Last message was from admin
            } else if (!lastMsg.is_read) {
                status = "action_required"; // Last message from user AND not read
            }

            return {
                user: profile,
                lastMessage: lastMsg,
                status // "action_required", "replied", "read"
            };
        }).sort((a, b) => {
            // Sort: Action Required first, then by date
            if (a.status === 'action_required' && b.status !== 'action_required') return -1;
            if (a.status !== 'action_required' && b.status === 'action_required') return 1;
            return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
        });

        return inbox;
    } catch (err) {
        console.error("getChatInbox error:", err);
        return [];
    }
}

// Delete all chat messages for a specific user (Admin only)
export async function deleteChatConversation(userId: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("user_id", userId);

    if (error) return { error: error.message };

    revalidatePath("/admin/chat");
    return { success: true };
}

// ==========================================
// AI Job Extraction (Gemini Flash)
// ==========================================

import { GoogleGenerativeAI } from "@google/generative-ai";

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
    requirements?: string[];
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
    welcome_requirements?: string[];
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
    requirements: ["応募資格", "条件", "応募条件", "資格", "要件"],
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
    const requirementsMatch = extractedData.requirements
        ? await matchTagsWithOptions(extractedData.requirements, 'requirements')
        : [];
    const welcomeRequirementsMatch = extractedData.welcome_requirements
        ? await matchTagsWithOptions(extractedData.welcome_requirements, 'requirements')
        : [];
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
            requirements: "応募資格・条件",
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
        const requirementsList = optionsByCategory['requirements']?.join(', ') || '';
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

【応募資格 (requirements)】
${requirementsList}

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

配列フィールド（requirements, holidays, benefits, tags）は配列形式で出力してください。
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
            requirements: "応募資格・条件",
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
        const requirementsList = optionsByCategory['requirements']?.join(', ') || '';
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
- requirements: 応募資格、条件、応募条件

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

【応募資格 (requirements)】
${requirementsList}

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

// ==========================================
// Batch Job Import (Bulk Import with 3-Stage Approval)
// ==========================================

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
