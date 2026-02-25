"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "./auth";
import { createPerfTimer } from "@/lib/perf";

function parseStringArray(raw: FormDataEntryValue | null): string[] {
    if (typeof raw !== "string" || !raw.trim()) return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map((v) => String(v).trim()).filter(Boolean);
        }
    } catch {
        // fall through to legacy text parsing
    }
    return raw.split(/[,\s\u3000]+/).map((v) => v.trim()).filter(Boolean);
}

function parseNullableInt(raw: FormDataEntryValue | null): number | null {
    if (typeof raw !== "string" || !raw.trim()) return null;
    const value = Number.parseInt(raw, 10);
    return Number.isNaN(value) ? null : value;
}

function parseBoolean(raw: FormDataEntryValue | null, fallback = false): boolean {
    if (typeof raw !== "string") return fallback;
    const normalized = raw.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;
    return fallback;
}

function normalizeUploadedFileName(fileName: string): string {
    return Buffer.from(fileName, "latin1").toString("utf8");
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
    const perf = createPerfTimer("admin_create_job");
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const title = formData.get("title") as string;

    const area = formData.get("area") as string;
    const type = formData.get("type") as string;
    const salary = formData.get("salary") as string;
    const category = formData.get("category") as string;

    const search_areas = parseStringArray(formData.get("search_areas"));

    // Parse tags: Handle both JSON string (from TagSelector) and legacy space-separated string
    const tags = parseStringArray(formData.get("tags"));

    const client_id = formData.get("client_id") as string || null;

    const description = formData.get("description") as string;
    const requirements = formData.get("requirements") as string;
    const working_hours = formData.get("working_hours") as string;
    const holidays = formData.get("holidays") as string;
    const benefits = formData.get("benefits") as string;
    const selection_process = formData.get("selection_process") as string;

    // New fields
    const hourly_wage = parseNullableInt(formData.get("hourly_wage"));
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
    const nearest_station_is_estimated = parseBoolean(formData.get("nearest_station_is_estimated"), false);
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
    const annual_salary_min = parseNullableInt(formData.get("annual_salary_min"));
    const annual_salary_max = parseNullableInt(formData.get("annual_salary_max"));
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
    const salary_breakdown = formData.get("salary_breakdown") as string;
    const published_at = formData.get("published_at") as string || null;
    const expires_at = formData.get("expires_at") as string || null;

    const jobPayload = {
        title,
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
    };

    const dispatchPayload = {
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
    };

    const fulltimePayload = {
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
        salary_breakdown,
        shift_notes,
    };

    try {
        const { data: createdJobId, error: createError } = await supabase.rpc("create_job_with_details", {
            p_job: jobPayload,
            p_dispatch: dispatchPayload,
            p_fulltime: fulltimePayload,
        });

        if (createError || !createdJobId) {
            perf.end({ success: false, phase: "rpc_create" });
            return { error: createError?.message || "求人作成に失敗しました" };
        }

        const jobId = String(createdJobId);
        const { error: stationFlagError } = await supabase
            .from("jobs")
            .update({ nearest_station_is_estimated })
            .eq("id", jobId);

        if (stationFlagError) {
            perf.end({ success: false, phase: "station_flag_update" });
            return { error: stationFlagError.message };
        }

        // Handle Pre-registered (Draft) Files
        const draftFileIds = formData.getAll("draft_file_ids") as string[];
        if (draftFileIds.length > 0) {
            const { data: drafts, error: fetchError } = await supabase
                .from("job_draft_files")
                .select("*")
                .in("id", draftFileIds);

            if (fetchError) {
                perf.end({ success: false, phase: "draft_fetch" });
                return { error: fetchError.message };
            }

            if (drafts) {
                for (const draft of drafts) {
                    // Insert into job_attachments
                    const { error: attachError } = await supabase.from("job_attachments").insert({
                        job_id: jobId,
                        file_name: draft.file_name,
                        file_url: draft.file_url,
                        file_type: draft.file_type,
                        file_size: draft.file_size,
                    });
                    if (attachError) {
                        perf.end({ success: false, phase: "draft_attach_insert" });
                        return { error: attachError.message };
                    }

                    // Remove from job_draft_files (now linked to a job)
                    const { error: deleteDraftError } = await supabase.from("job_draft_files").delete().eq("id", draft.id);
                    if (deleteDraftError) {
                        perf.end({ success: false, phase: "draft_delete" });
                        return { error: deleteDraftError.message };
                    }
                }
            }
        }

        // Handle Multiple PDF Uploads (Direct uploads from form)
        const files = formData.getAll("pdf_files") as File[];
        if (files.length > 0) {
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

                    const originalName = normalizeUploadedFileName(file.name);

                    const { error: insertError } = await supabase.from("job_attachments").insert({
                        job_id: jobId,
                        file_name: originalName,
                        file_url: publicUrl,
                        file_type: file.type,
                        file_size: file.size,
                    });

                    if (insertError) {
                        console.error("DB Insert error:", insertError);
                        await supabase.storage.from("job-documents").remove([fileName]);
                        uploadErrors.push(`Failed to save record for ${file.name}: ${insertError.message}`);
                    }
                }
            }
            if (uploadErrors.length > 0) {
                perf.end({ success: false, phase: "file_upload" });
                return { error: uploadErrors.join(", ") };
            }
        }

        revalidatePath("/jobs");
        revalidatePath("/admin/jobs");
        revalidatePath("/admin/jobs/pre-registration");
        perf.end({ success: true });
        return { success: true };
    } catch (error) {
        perf.end({ success: false, phase: "unexpected" });
        throw error;
    }
}

// Update job
export async function updateJob(id: string, formData: FormData) {
    const perf = createPerfTimer("admin_update_job");
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const title = formData.get("title") as string;
    const area = formData.get("area") as string;
    const type = formData.get("type") as string;
    const salary = formData.get("salary") as string;
    const category = formData.get("category") as string;

    // Parse search_areas
    const search_areas = parseStringArray(formData.get("search_areas"));

    // Parse tags: Handle both JSON string (from TagSelector) and legacy space-separated string
    const tags = parseStringArray(formData.get("tags"));

    const client_id = formData.get("client_id") as string || null;

    const description = formData.get("description") as string;
    const requirements = formData.get("requirements") as string;
    const working_hours = formData.get("working_hours") as string;
    const holidays = formData.get("holidays") as string;
    const benefits = formData.get("benefits") as string;
    const selection_process = formData.get("selection_process") as string;

    // New fields
    const hourly_wage = parseNullableInt(formData.get("hourly_wage"));
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
    const nearest_station_is_estimated = parseBoolean(formData.get("nearest_station_is_estimated"), false);
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
    const annual_salary_min = parseNullableInt(formData.get("annual_salary_min"));
    const annual_salary_max = parseNullableInt(formData.get("annual_salary_max"));
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
    const salary_breakdown = formData.get("salary_breakdown") as string;
    const published_at = formData.get("published_at") as string || null;
    const expires_at = formData.get("expires_at") as string || null;

    const jobPayload = {
        title,
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

    const dispatchPayload = {
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
    };

    const fulltimePayload = {
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
        salary_breakdown,
        shift_notes,
    };

    const { error: updateError } = await supabase.rpc("update_job_with_details", {
        p_job_id: id,
        p_job: jobPayload,
        p_dispatch: dispatchPayload,
        p_fulltime: fulltimePayload,
    });

    if (updateError) {
        perf.end({ success: false, phase: "rpc_update" });
        return { error: updateError.message };
    }

    const { error: stationFlagError } = await supabase
        .from("jobs")
        .update({ nearest_station_is_estimated })
        .eq("id", id);
    if (stationFlagError) {
        perf.end({ success: false, phase: "station_flag_update" });
        return { error: stationFlagError.message };
    }

    // Handle New File Uploads
    const files = formData.getAll("pdf_files") as File[];
    if (files.length > 0) {
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
                // FormData sometimes encodes non-ASCII filenames as Latin-1
                const originalName = normalizeUploadedFileName(file.name);

                const { error: insertError } = await supabase.from("job_attachments").insert({
                    job_id: id,
                    file_name: originalName,
                    file_url: publicUrl,
                    file_type: file.type,
                    file_size: file.size,
                });

                if (insertError) {
                    console.error("DB Insert error:", insertError);
                    await supabase.storage.from("job-documents").remove([fileName]);
                    uploadErrors.push(`Failed to save record for ${file.name}: ${insertError.message}`);
                }
            }
        }
        if (uploadErrors.length > 0) {
            perf.end({ success: false, phase: "file_upload" });
            return { error: uploadErrors.join(", ") };
        }
    }

    revalidatePath("/jobs");
    revalidatePath("/admin/jobs");
    perf.end({ success: true });
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
