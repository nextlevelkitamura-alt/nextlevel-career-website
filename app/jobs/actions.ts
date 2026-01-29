"use server";

import { createClient } from "@/utils/supabase/server";
import { sendApplicationNotification } from "@/lib/mail";

export async function getPublicJobs() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("jobs")
        .select("*, job_attachments(*)")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching jobs:", error);
        return [];
    }
    return data;
}

export async function getJob(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("jobs")
        .select("*, clients(name), job_attachments(*)")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching job:", error);
        return null;
    }
    return data;
}

export async function checkApplicationStatus(jobId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data, error } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", jobId)
        .eq("user_id", user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found" (0 results)
        console.error("Error checking application status:", error);
    }

    return !!data;
}

export async function applyForJob(jobId: string) {
    const supabase = createClient();

    // Check Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "Login required", code: "UNAUTHORIZED" };
    }

    // Check if already applied
    const hasApplied = await checkApplicationStatus(jobId);
    if (hasApplied) {
        return { error: "Already applied", code: "ALREADY_APPLIED" };
    }

    // Insert Application
    const { error } = await supabase
        .from("applications")
        .insert({
            job_id: jobId,
            user_id: user.id,
            status: "pending"
        });

    if (error) {
        console.error("Error applying for job:", error);
        return { error: error.message };
    }

    // Send Notification (Fire and forget, don't block response)
    // Fetch profile and job details for the email
    const { data: profile } = await supabase.from("profiles").select("last_name, first_name").eq("id", user.id).single();
    const { data: job } = await supabase.from("jobs").select("title").eq("id", jobId).single();

    if (profile && job) {
        const applicantName = `${profile.last_name || ""} ${profile.first_name || ""}`.trim() || user.email || "Unknown User";
        // Call notification (async, no await to return fast, or await if critical)
        // Usually safe to not await for email if we want speed, but Vercel functions might kill it. 
        // Better to await or use background job. validating "await" for now.
        await sendApplicationNotification(job.title, applicantName);
    }

    return { success: true };
}

// Get all unique tags from job_options (Master)
export async function getAllUniqueTags() {
    const supabase = createClient();

    // Fetch distinct tags from job_options
    const { data: options, error } = await supabase
        .from("job_options")
        .select("label")
        .eq("category", "tags")
        .order("label", { ascending: true });

    if (error) {
        // Fallback or error handling
        console.error("Error fetching tags from master:", error);
        return [];
    }

    if (!options || options.length === 0) {
        // Fallback: If master is empty, maybe scan jobs (migration phase)?
        // Or just return empty to encourage sync.
        // Let's stick to master source as planned.
        return [];
    }

    return options.map(o => o.label);
}
