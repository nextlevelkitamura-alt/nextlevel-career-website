"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "./auth";

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
