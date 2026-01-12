"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";

import { revalidatePath } from "next/cache";

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

// Get all jobs (with client name)
export async function getJobs(query?: string) {
    const supabase = createSupabaseClient();
    let builder = supabase
        .from("jobs")
        .select("*, clients(name), job_attachments(id)")
        .order("created_at", { ascending: false });

    if (query) {
        builder = builder.or(`title.ilike.%${query}%,job_code.ilike.%${query}%`);
    }

    const { data, error } = await builder;

    if (error) throw new Error(error.message);
    return data;
}

// Get single job with attachments
export async function getJob(id: string) {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("jobs")
        .select("*, clients(name), job_attachments(*)")
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
    const tags = (formData.get("tags") as string).split(/[,\s\u3000]+/).map(t => t.trim()).filter(Boolean);
    const client_id = formData.get("client_id") as string || null;

    const description = formData.get("description") as string;
    const requirements = formData.get("requirements") as string;
    const working_hours = formData.get("working_hours") as string;
    const holidays = formData.get("holidays") as string;
    const benefits = formData.get("benefits") as string;
    const selection_process = formData.get("selection_process") as string;

    const { data: jobData, error } = await supabase.from("jobs").insert({
        title,
        job_code,
        area,
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
        selection_process
    }).select().single();

    if (error) return { error: error.message };

    // Handle Multiple PDF Uploads
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
    const tags = (formData.get("tags") as string).split(/[,\s\u3000]+/).map(t => t.trim()).filter(Boolean);

    const client_id = formData.get("client_id") as string || null;

    const description = formData.get("description") as string;
    const requirements = formData.get("requirements") as string;
    const working_hours = formData.get("working_hours") as string;
    const holidays = formData.get("holidays") as string;
    const benefits = formData.get("benefits") as string;
    const selection_process = formData.get("selection_process") as string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
        title,
        // job_code is not updatable
        area,
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
        selection_process
    };

    const { error } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", id);

    if (error) return { error: error.message };

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
