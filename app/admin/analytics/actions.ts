"use server";

import { createClient } from "@/utils/supabase/server";
import { checkAdmin } from "@/app/admin/actions";

export type Period = "7d" | "30d" | "90d" | "all";

function getDateSince(period: Period): string | null {
  if (period === "all") return null;
  const now = new Date();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  now.setDate(now.getDate() - days);
  return now.toISOString();
}

export async function getAnalyticsSummary(period: Period = "30d") {
  const isAdmin = await checkAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const supabase = createClient();
  const since = getDateSince(period);

  // 総閲覧数（bot除外）
  let viewsQuery = supabase
    .from("job_views")
    .select("id", { count: "exact", head: true })
    .eq("is_bot", false);
  if (since) viewsQuery = viewsQuery.gte("viewed_at", since);
  const { count: totalViews } = await viewsQuery;

  // 総応募数
  let appsQuery = supabase
    .from("applications")
    .select("id", { count: "exact", head: true });
  if (since) appsQuery = appsQuery.gte("created_at", since);
  const { count: totalApplications } = await appsQuery;

  // アクティブ求人数
  const now = new Date().toISOString();
  const { count: activeJobs } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  const cvr =
    totalViews && totalViews > 0
      ? (((totalApplications || 0) / totalViews) * 100).toFixed(2)
      : "0.00";

  return {
    totalViews: totalViews || 0,
    totalApplications: totalApplications || 0,
    activeJobs: activeJobs || 0,
    cvr: parseFloat(cvr),
  };
}

export async function getDailyViews(period: Period = "30d") {
  const isAdmin = await checkAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const supabase = createClient();
  const since = getDateSince(period);

  let query = supabase
    .from("job_views")
    .select("viewed_at")
    .eq("is_bot", false)
    .order("viewed_at", { ascending: true });
  if (since) query = query.gte("viewed_at", since);
  const { data } = await query;

  const dailyMap = new Map<string, number>();
  data?.forEach((row) => {
    const date = new Date(row.viewed_at).toISOString().split("T")[0];
    dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
  });

  // 応募数も日別取得
  let appsQuery = supabase
    .from("applications")
    .select("created_at")
    .order("created_at", { ascending: true });
  if (since) appsQuery = appsQuery.gte("created_at", since);
  const { data: appsData } = await appsQuery;

  const appsMap = new Map<string, number>();
  appsData?.forEach((row) => {
    const date = new Date(row.created_at).toISOString().split("T")[0];
    appsMap.set(date, (appsMap.get(date) || 0) + 1);
  });

  const allDates = Array.from(new Set([...Array.from(dailyMap.keys()), ...Array.from(appsMap.keys())]));
  return allDates
    .sort()
    .map((date) => ({
      date,
      views: dailyMap.get(date) || 0,
      applications: appsMap.get(date) || 0,
    }));
}

export async function getJobRanking(period: Period = "30d", limit = 20) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const supabase = createClient();
  const since = getDateSince(period);

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, title, area, type, category");

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

  const ranking = (jobs || []).map((job) => {
    const jobViews = viewCountMap.get(job.id) || 0;
    const jobApps = appCountMap.get(job.id) || 0;
    return {
      ...job,
      views: jobViews,
      applications: jobApps,
      cvr: jobViews > 0 ? (jobApps / jobViews) * 100 : 0,
    };
  });

  return ranking.sort((a, b) => b.views - a.views).slice(0, limit);
}

export async function getApplicationStatusBreakdown(period: Period = "30d") {
  const isAdmin = await checkAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const supabase = createClient();
  const since = getDateSince(period);

  let query = supabase.from("applications").select("status");
  if (since) query = query.gte("created_at", since);
  const { data } = await query;

  const statusMap = new Map<string, number>();
  data?.forEach((row) => {
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
