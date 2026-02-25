"use server";

import { createClient } from "@/utils/supabase/server";
import { checkAdmin } from "@/app/admin/actions";

export type Period = "7d" | "30d" | "90d" | "all";
export type EmploymentSegment = "all" | "fulltime" | "dispatch";

type JobTypeRow = {
  id: string;
  type: string | null;
};

function normalizeType(type: string | null | undefined): string {
  return (type ?? "").replace(/\s+/g, "");
}

function detectSegmentByType(type: string | null | undefined): EmploymentSegment | null {
  const normalized = normalizeType(type);
  if (!normalized) return null;
  if (normalized.includes("派遣")) return "dispatch";
  if (normalized.includes("正社員")) return "fulltime";
  return null;
}

function isTargetSegment(
  segment: EmploymentSegment,
  jobId: string | null | undefined,
  jobSegmentMap: Map<string, EmploymentSegment | null>,
): boolean {
  if (!jobId) return false;
  const detected = jobSegmentMap.get(jobId) ?? null;
  if (!detected) return false;
  return segment === "all" ? true : detected === segment;
}

async function getJobSegmentMap() {
  const supabase = createClient();
  const { data: jobs } = await supabase.from("jobs").select("id, type");
  const jobSegmentMap = new Map<string, EmploymentSegment | null>();
  (jobs as JobTypeRow[] | null)?.forEach((job) => {
    jobSegmentMap.set(job.id, detectSegmentByType(job.type));
  });
  return jobSegmentMap;
}

function getDateSince(period: Period): string | null {
  if (period === "all") return null;
  const now = new Date();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  now.setDate(now.getDate() - days);
  return now.toISOString();
}

export async function getAnalyticsSummary(
  period: Period = "30d",
  segment: EmploymentSegment = "all",
) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const supabase = createClient();
  const since = getDateSince(period);
  const jobSegmentMap = await getJobSegmentMap();

  // 総閲覧数（bot除外）
  let viewsQuery = supabase
    .from("job_views")
    .select("job_id")
    .eq("is_bot", false);
  if (since) viewsQuery = viewsQuery.gte("viewed_at", since);
  const { data: views } = await viewsQuery;
  const totalViews =
    views?.reduce((count, row) => (
      isTargetSegment(segment, row.job_id, jobSegmentMap) ? count + 1 : count
    ), 0) || 0;

  // 総応募数
  let appsQuery = supabase
    .from("applications")
    .select("job_id");
  if (since) appsQuery = appsQuery.gte("created_at", since);
  const { data: applications } = await appsQuery;
  const totalApplications =
    applications?.reduce((count, row) => (
      isTargetSegment(segment, row.job_id, jobSegmentMap) ? count + 1 : count
    ), 0) || 0;

  // アクティブ求人数
  const now = new Date().toISOString();
  const { data: activeJobRows } = await supabase
    .from("jobs")
    .select("id, type")
    .or(`expires_at.is.null,expires_at.gt.${now}`);
  const activeJobs =
    activeJobRows?.reduce((count, job) => {
      const detected = detectSegmentByType(job.type);
      if (segment === "all") return count + 1;
      return detected === segment ? count + 1 : count;
    }, 0) || 0;

  // 応募クリック数
  let applyClicksQuery = supabase
    .from("booking_clicks")
    .select("job_id")
    .eq("click_type", "apply");
  if (since) applyClicksQuery = applyClicksQuery.gte("clicked_at", since);
  const { data: applyClickRows } = await applyClicksQuery;
  const applyClicks =
    applyClickRows?.reduce((count, row) => (
      isTargetSegment(segment, row.job_id, jobSegmentMap) ? count + 1 : count
    ), 0) || 0;

  // 相談クリック数
  let consultClicksQuery = supabase
    .from("booking_clicks")
    .select("job_id")
    .eq("click_type", "consult");
  if (since) consultClicksQuery = consultClicksQuery.gte("clicked_at", since);
  const { data: consultClickRows } = await consultClicksQuery;
  const consultClicks =
    consultClickRows?.reduce((count, row) => (
      isTargetSegment(segment, row.job_id, jobSegmentMap) ? count + 1 : count
    ), 0) || 0;

  const cvr =
    totalViews > 0
      ? ((totalApplications / totalViews) * 100).toFixed(2)
      : "0.00";

  return {
    totalViews,
    totalApplications,
    activeJobs,
    cvr: parseFloat(cvr),
    applyClicks,
    consultClicks,
  };
}

export async function getDailyViews(
  period: Period = "30d",
  segment: EmploymentSegment = "all",
) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const supabase = createClient();
  const since = getDateSince(period);
  const jobSegmentMap = await getJobSegmentMap();

  let query = supabase
    .from("job_views")
    .select("viewed_at, job_id")
    .eq("is_bot", false)
    .order("viewed_at", { ascending: true });
  if (since) query = query.gte("viewed_at", since);
  const { data } = await query;

  const dailyMap = new Map<string, number>();
  data?.forEach((row) => {
    if (!isTargetSegment(segment, row.job_id, jobSegmentMap)) return;
    const date = new Date(row.viewed_at).toISOString().split("T")[0];
    dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
  });

  // 応募数も日別取得
  let appsQuery = supabase
    .from("applications")
    .select("created_at, job_id")
    .order("created_at", { ascending: true });
  if (since) appsQuery = appsQuery.gte("created_at", since);
  const { data: appsData } = await appsQuery;

  const appsMap = new Map<string, number>();
  appsData?.forEach((row) => {
    if (!isTargetSegment(segment, row.job_id, jobSegmentMap)) return;
    const date = new Date(row.created_at).toISOString().split("T")[0];
    appsMap.set(date, (appsMap.get(date) || 0) + 1);
  });

  // クリック数も日別取得
  let clicksQuery = supabase
    .from("booking_clicks")
    .select("clicked_at, click_type")
    .order("clicked_at", { ascending: true });
  if (since) clicksQuery = clicksQuery.gte("clicked_at", since);
  const { data: clicksData } = await clicksQuery;

  const applyClicksMap = new Map<string, number>();
  const consultClicksMap = new Map<string, number>();
  clicksData?.forEach((row) => {
    if (!isTargetSegment(segment, row.job_id, jobSegmentMap)) return;
    const date = new Date(row.clicked_at).toISOString().split("T")[0];
    if (row.click_type === "apply") {
      applyClicksMap.set(date, (applyClicksMap.get(date) || 0) + 1);
    } else {
      consultClicksMap.set(date, (consultClicksMap.get(date) || 0) + 1);
    }
  });

  const allDates = Array.from(new Set([
    ...Array.from(dailyMap.keys()),
    ...Array.from(appsMap.keys()),
    ...Array.from(applyClicksMap.keys()),
    ...Array.from(consultClicksMap.keys()),
  ]));
  return allDates
    .sort()
    .map((date) => ({
      date,
      views: dailyMap.get(date) || 0,
      applications: appsMap.get(date) || 0,
      applyClicks: applyClicksMap.get(date) || 0,
      consultClicks: consultClicksMap.get(date) || 0,
    }));
}

export async function getJobRanking(
  period: Period = "30d",
  limit = 20,
  segment: EmploymentSegment = "all",
) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const supabase = createClient();
  const since = getDateSince(period);
  const jobSegmentMap = await getJobSegmentMap();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, area, type, category");
  const filteredJobs = (jobs || []).filter((job) =>
    isTargetSegment(segment, job.id, jobSegmentMap),
  );

  let viewsQuery = supabase
    .from("job_views")
    .select("job_id")
    .eq("is_bot", false);
  if (since) viewsQuery = viewsQuery.gte("viewed_at", since);
  const { data: views } = await viewsQuery;

  const viewCountMap = new Map<string, number>();
  views?.forEach((v) => {
    viewCountMap.set(v.job_id, (viewCountMap.get(v.job_id) || 0) + 1);
  });

  let appsQuery = supabase.from("applications").select("job_id");
  if (since) appsQuery = appsQuery.gte("created_at", since);
  const { data: apps } = await appsQuery;

  const appCountMap = new Map<string, number>();
  apps?.forEach((a) => {
    appCountMap.set(a.job_id, (appCountMap.get(a.job_id) || 0) + 1);
  });

  // booking_clicks（応募・相談）
  let clicksQuery = supabase.from("booking_clicks").select("job_id, click_type");
  if (since) clicksQuery = clicksQuery.gte("clicked_at", since);
  const { data: clicks } = await clicksQuery;

  const applyClickMap = new Map<string, number>();
  const consultClickMap = new Map<string, number>();
  clicks?.forEach((c) => {
    if (c.click_type === "apply") {
      applyClickMap.set(c.job_id, (applyClickMap.get(c.job_id) || 0) + 1);
    } else {
      consultClickMap.set(c.job_id, (consultClickMap.get(c.job_id) || 0) + 1);
    }
  });

  const ranking = filteredJobs.map((job) => {
    const jobViews = viewCountMap.get(job.id) || 0;
    const jobApps = appCountMap.get(job.id) || 0;
    return {
      ...job,
      views: jobViews,
      applications: jobApps,
      cvr: jobViews > 0 ? (jobApps / jobViews) * 100 : 0,
      applyClicks: applyClickMap.get(job.id) || 0,
      consultClicks: consultClickMap.get(job.id) || 0,
    };
  });

  return ranking.sort((a, b) => b.views - a.views).slice(0, limit);
}

export async function getApplicationStatusBreakdown(
  period: Period = "30d",
  segment: EmploymentSegment = "all",
) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const supabase = createClient();
  const since = getDateSince(period);
  const jobSegmentMap = await getJobSegmentMap();

  let query = supabase.from("applications").select("status, job_id");
  if (since) query = query.gte("created_at", since);
  const { data } = await query;

  const statusMap = new Map<string, number>();
  data?.forEach((row) => {
    if (!isTargetSegment(segment, row.job_id, jobSegmentMap)) return;
    statusMap.set(row.status, (statusMap.get(row.status) || 0) + 1);
  });

  return {
    pending: statusMap.get("pending") || 0,
    reviewed: statusMap.get("reviewed") || 0,
    interview: statusMap.get("interview") || 0,
    hired: statusMap.get("hired") || 0,
    rejected: statusMap.get("rejected") || 0,
  };
}
