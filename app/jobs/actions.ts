"use server";

import { createClient } from "@/utils/supabase/server";
import { sendApplicationNotification } from "@/lib/mail";
import { createPerfTimer } from "@/lib/perf";

type GetPublicJobsListParams = {
    area?: string;
    type?: string;
    category?: string;
    page?: number;
    pageSize?: number;
};

const JOB_DETAIL_SELECT = "*, clients(name), job_attachments(*), dispatch_job_details(*), fulltime_job_details(*)";

export async function getPublicJobsList({
    area = "",
    type = "",
    category = "",
    page = 1,
    pageSize = 24,
}: GetPublicJobsListParams = {}) {
    const perf = createPerfTimer("jobs_list_query", { has_area: Boolean(area), has_type: Boolean(type), has_category: Boolean(category) });
    const supabase = createClient();
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.min(Math.floor(pageSize), 60) : 24;
    const offset = (safePage - 1) * safePageSize;

    const { data, error } = await supabase.rpc("get_public_jobs_list_rpc", {
        p_area: area || null,
        p_type: type || null,
        p_category: category || null,
        p_limit: safePageSize,
        p_offset: offset,
    });

    if (error) {
        console.error("Error fetching jobs:", error);
        perf.end({ success: false });
        return { jobs: [], total: 0, page: safePage, pageSize: safePageSize, totalPages: 1 };
    }

    const rows = data || [];
    const total = rows.length > 0 ? Number(rows[0].total_count ?? 0) : 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobs = rows.map((row: any) => {
        const {
            annual_salary_min,
            annual_salary_max,
            annual_holidays,
            company_name,
            total_count,
            ...job
        } = row;
        void total_count;

        const hasFulltimeDetails =
            annual_salary_min !== null ||
            annual_salary_max !== null ||
            annual_holidays !== null ||
            company_name !== null;

        return {
            ...job,
            fulltime_job_details: hasFulltimeDetails
                ? { annual_salary_min, annual_salary_max, annual_holidays, company_name }
                : null,
        };
    });

    const result = {
        jobs,
        total,
        page: safePage,
        pageSize: safePageSize,
        totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    };
    perf.end({ success: true, count: jobs.length, total });
    return result;
}

export async function getPublicJobs() {
    const result = await getPublicJobsList({ page: 1, pageSize: 200 });
    return result.jobs;
}

export async function getPublicJobDetail(id: string) {
    const perf = createPerfTimer("job_detail_query");
    const supabase = createClient();
    const { data, error } = await supabase
        .from("jobs")
        .select(JOB_DETAIL_SELECT)
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching job:", error);
        perf.end({ success: false });
        return null;
    }
    perf.end({ success: true });
    return data;
}

export async function getJob(id: string) {
    return getPublicJobDetail(id);
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
        .select("id, title, area, search_areas, salary, type, category, tags, hourly_wage, job_code, nearest_station, working_hours, holidays, job_category_detail, fulltime_job_details(annual_salary_min, annual_salary_max, annual_holidays, company_name)")
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
    const perf = createPerfTimer("jobs_area_search", { has_area: Boolean(area), has_type: Boolean(type) });
    const supabase = createClient();
    const { data, error } = await supabase.rpc("search_jobs_by_area_rpc", {
        p_area: area || null,
        p_type: type || null,
        p_current_job_id: currentJobId || null,
        p_limit: Math.min(limit, 60),
    });

    if (error) {
        console.error("Error searching jobs by area:", error);
        perf.end({ success: false });
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        area: row.area,
        salary: row.salary,
        type: row.type,
        category: row.category,
        hourly_wage: row.hourly_wage,
        fulltime_job_details:
            row.annual_salary_min !== null || row.annual_salary_max !== null
                ? [{ annual_salary_min: row.annual_salary_min, annual_salary_max: row.annual_salary_max }]
                : null,
    }));
    perf.end({ success: true, count: mapped.length });
    return mapped;
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
