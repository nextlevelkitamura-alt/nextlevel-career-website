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

// Get Job Options
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

// Create Job Option
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

// Delete Job Option
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
        .select("*, clients(name), job_attachments(id)")
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

import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

// Super Admin Email - Immune to role changes
const SUPER_ADMIN_EMAIL = "nextlevel.kitamura@gmail.com";

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

    // 1. Verify Current ID and Email matches Super Admin
    if (!currentUser || currentUser.email !== SUPER_ADMIN_EMAIL) {
        throw new Error("Unauthorized: Only Owner can delete users.");
    }

    // 2. Prevent self-deletion (Just in case)
    if (currentUser.id === targetUserId) {
        return { error: "自分自身（オーナー）を削除することはできません。" };
    }

    // 3. Initialize Admin Client
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
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
        return { error: "ファイルが選択されていないか、空のファイルです。" };
    }

    const extension = file.name.split('.').pop();
    const fileName = `drafts/${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

    const { error: uploadError } = await supabase.storage
        .from("job-documents")
        .upload(fileName, file);

    if (uploadError) {
        return { error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
        .from("job-documents")
        .getPublicUrl(fileName);

    // Fix for Japanese filenames
    const originalName = Buffer.from(file.name, "latin1").toString("utf8");

    const { data, error: insertError } = await supabase.from("job_draft_files").insert({
        file_name: originalName,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
    }).select().single();

    if (insertError) {
        return { error: insertError.message };
    }

    revalidatePath("/admin/jobs/pre-registration");
    return { success: true, data };
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
    commute_method?: string;
    start_date?: string;
    training_info?: string;
    dress_code?: string;
    work_days?: string;
    contact_person?: string;
    notes?: string;
}

// Type for tag matching result
export interface TagMatchResult {
    match: 'exact' | 'similar' | 'new';
    option?: { id: string; label: string; value: string };
    original: string;
    suggestion?: string;
}

// Extract job data from file URL using Gemini Flash
export async function extractJobDataFromFile(fileUrl: string): Promise<{ data?: ExtractedJobData; error?: string }> {
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

        // Initialize Gemini (using 2.0-flash - latest available Flash model)
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `あなたは求人情報を抽出・最適化するプロの求人コンサルタントAIです。
以下のPDFまたは画像から求人情報を抽出し、求職者に魅力的に見えるよう最適化してください。

## 重要な指示

### 求人タイトル（title）について
- PDFの「お仕事名」や「職種」をそのまま使わず、**求職者が魅力を感じるタイトル**を作成してください
- 以下の要素を含めると効果的です：
  - 【】で囲んだアピールポイント（例：【未経験OK】【高時給】【駅チカ】【土日祝休み】）
  - 具体的な仕事内容のキーワード
  - 業界や企業の特徴
- 例：「【未経験OK・高時給1500円】大手企業でのコールセンター/土日祝休み」

### 給与（salary）について
- 給与レンジがある場合は「時給1500〜1800円」のように「〜」で範囲を表記
- 交通費支給がある場合は「+交通費全額支給」などを付記
- 例：「時給1500〜1800円+交通費全額支給」

### タグ（tags）について
- **その求人のメリット・魅力を2〜3個**選んでください
- 求職者が検索しそうなキーワードを優先
- 例：「未経験OK」「駅チカ」「土日祝休み」「高時給」「大手企業」「残業少なめ」「服装自由」「研修充実」

## 出力フォーマット（JSON形式で出力）

{
  "title": "【アピールポイント】魅力的な求人タイトル",
  "area": "勤務地（都道府県 + 市区町村 + 詳細住所）",
  "type": "雇用形態（派遣/正社員/紹介予定派遣/契約社員/アルバイト・パートのいずれか）",
  "salary": "時給○○〜○○円+交通費など（レンジ表記）",
  "category": "職種カテゴリ（事務/コールセンター/営業/IT・エンジニア/クリエイティブ/販売・接客/その他のいずれか）",
  "tags": ["メリットタグ1", "メリットタグ2", "メリットタグ3"],
  "description": "仕事内容・業務内容の詳細",
  "requirements": ["応募資格1", "応募資格2"],
  "working_hours": "勤務時間（例: 9:00-18:00）",
  "holidays": ["休日1", "休日2"],
  "benefits": ["福利厚生1", "福利厚生2"],
  "selection_process": "選考プロセス（今後の流れ）",
  "company_name": "就業先企業名",
  "nearest_station": "最寄り駅",
  "commute_method": "通勤方法",
  "start_date": "お仕事開始日",
  "training_info": "研修について",
  "dress_code": "服装",
  "work_days": "出勤日数",
  "contact_person": "お仕事担当者",
  "notes": "備考"
}

## 注意事項
- JSONのみを出力し、説明文やマークダウンは含めないでください
- 値がない場合はnullとしてください
- 配列フィールドは必ず配列形式で出力してください`;

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType,
                    data: base64Data,
                },
            },
            prompt,
        ]);

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
        return { data: extractedData };

    } catch (error) {
        console.error("AI extraction error:", error);

        // User-friendly error messages
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("Too Many Requests")) {
            return {
                error: "レート制限に達しました。少し待ってから再度お試しください（15秒程度）。無料枠の制限によるものです。"
            };
        }

        if (errorMessage.includes("API_KEY") || errorMessage.includes("unauthorized") || errorMessage.includes("invalid")) {
            return { error: "APIキーが無効です。.env.localのGEMINI_API_KEYを確認してください。" };
        }

        return { error: `AI抽出エラー: ${errorMessage.slice(0, 200)}` };
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
            holidays: holidaysMatch,
            benefits: benefitsMatch,
        },
    };
}
