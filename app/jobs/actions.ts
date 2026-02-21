"use server";

import { createClient } from "@/utils/supabase/server";
import { sendApplicationNotification } from "@/lib/mail";

export async function getPublicJobs() {
    const supabase = createClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from("jobs")
        .select("*, job_attachments(*), dispatch_job_details(*), fulltime_job_details(*)")
        .or(`expires_at.is.null,expires_at.gt.${now}`)
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
        .select("*, clients(name), job_attachments(*), dispatch_job_details(*), fulltime_job_details(*)")
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

export async function recordBookingClick(jobId: string, clickType: 'apply' | 'consult') {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("booking_clicks").insert({
        job_id: jobId,
        click_type: clickType,
        user_id: user?.id ?? null,
    });

    return { success: true };
}

export async function getRecommendedJobs(currentJobId: string, area: string, category: string, type: string, limit = 6) {
    const supabase = createClient();
    const now = new Date().toISOString();

    // 同エリア + 同カテゴリの求人を取得（現在の求人は除外、期限切れも除外）
    const { data, error } = await supabase
        .from("jobs")
        .select("id, title, area, search_areas, salary, type, category, tags, hourly_wage, dispatch_job_details(*), fulltime_job_details(annual_salary_min, annual_salary_max, annual_holidays)")
        .neq("id", currentJobId)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order("created_at", { ascending: false })
        .limit(30);

    if (error || !data) return [];

    // スコアリング: エリア一致 > カテゴリ一致 > 雇用形態一致
    const scored = data.map(job => {
        let score = 0;
        const currentAreaPrefix = (area || "").split(" ")[0];
        // search_areas も含めてエリアマッチング
        const allAreas = [job.area, ...(job.search_areas || [])].filter(Boolean);
        const matchesArea = allAreas.some((a: string) => {
            const prefix = a.split(" ")[0];
            return prefix && currentAreaPrefix && prefix === currentAreaPrefix;
        });
        if (matchesArea) score += 3;
        if (job.category === category) score += 2;
        if (job.type === type) score += 1;
        return { ...job, score };
    });

    // スコア順にソートして上位を返す
    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

export async function searchJobsByArea(area: string, type: string, currentJobId?: string, limit = 10) {
    const supabase = createClient();
    const now = new Date().toISOString();

    // search_areas配列の部分一致はPostgRESTのcsオペレータでは対応できないため、
    // サーバーサイドで取得後にフィルタリングする
    let query = supabase
        .from("jobs")
        .select("id, title, area, search_areas, salary, type, category, tags, hourly_wage, dispatch_job_details(*), fulltime_job_details(annual_salary_min, annual_salary_max)")
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order("created_at", { ascending: false });

    if (type) {
        query = query.ilike("type", `%${type}%`);
    }
    if (currentJobId) {
        query = query.neq("id", currentJobId);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error searching jobs by area:", error);
        return [];
    }

    // areaとsearch_areas両方を部分一致で検索
    const filtered = (data || []).filter(job => {
        if (job.area && job.area.includes(area)) return true;
        if (job.search_areas?.some((a: string) => a.includes(area))) return true;
        return false;
    });

    return filtered.slice(0, limit);
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
