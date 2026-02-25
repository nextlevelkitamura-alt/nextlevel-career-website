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
    .select("clicked_at, click_type, job_id")
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

export type LeadPeriod = Period;

export type LeadSummary = {
  applyClicks: number;
  consultClicks: number;
  applications: number;
  bookedConsultations: number;
  completedConsultations: number;
  applyToBookedRate: number;
};

export type LeadEvent = {
  id: string;
  kind: "apply_click" | "consult_click" | "application" | "consultation";
  at: string;
  status: string;
  title: string;
  note?: string | null;
};

export type LeadRow = {
  id: string;
  userId: string | null;
  displayName: string;
  email: string | null;
  phone: string | null;
  prefecture: string | null;
  age: number | null;
  accountType: "registered" | "guest";
  jobTitle: string | null;
  jobType: string | null;
  latestApplicationStatus: string | null;
  latestConsultationStatus: string | null;
  nextConsultationAt: string | null;
  meetingUrl: string | null;
  applyClicks: number;
  consultClicks: number;
  applications: number;
  consultations: number;
  events: LeadEvent[];
};

export type ConsultationBookingRow = {
  id: string;
  user_id: string | null;
  job_id: string | null;
  click_type: "apply" | "consult" | null;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  meeting_url: string | null;
  attendee_name: string | null;
  attendee_email: string | null;
  attendee_phone: string | null;
  admin_note: string | null;
  created_at: string;
  jobs?: {
    id: string;
    title: string | null;
    type: string | null;
  } | null;
};

type RelatedJob = {
  id: string;
  title: string | null;
  type: string | null;
};

function resolveRelatedJob(job: RelatedJob | RelatedJob[] | null | undefined): RelatedJob | null {
  if (!job) return null;
  return Array.isArray(job) ? (job[0] || null) : job;
}

export type LeadManagementData = {
  summary: LeadSummary;
  leads: LeadRow[];
  consultations: ConsultationBookingRow[];
};

function calculateAgeFromBirthDate(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function safeKeyEmail(email: string | null | undefined) {
  return (email || "").trim().toLowerCase();
}

function getLeadKey(userId: string | null | undefined, email: string | null | undefined, fallback: string) {
  if (userId) return `u:${userId}`;
  const normalizedEmail = safeKeyEmail(email);
  if (normalizedEmail) return `e:${normalizedEmail}`;
  return fallback;
}

export async function getLeadManagementData(period: LeadPeriod = "30d"): Promise<LeadManagementData> {
  const isAdmin = await checkAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const supabase = createClient();
  const since = getDateSince(period);

  let applicationsQuery = supabase
    .from("applications")
    .select("id, user_id, job_id, status, created_at, admin_memo, jobs(id, title, type)")
    .order("created_at", { ascending: false });
  if (since) applicationsQuery = applicationsQuery.gte("created_at", since);
  const { data: applications } = await applicationsQuery;

  let clicksQuery = supabase
    .from("booking_clicks")
    .select("id, user_id, job_id, click_type, clicked_at, jobs(id, title, type)")
    .order("clicked_at", { ascending: false });
  if (since) clicksQuery = clicksQuery.gte("clicked_at", since);
  const { data: clicks } = await clicksQuery;

  let consultationsQuery = supabase
    .from("consultation_bookings")
    .select("id, user_id, job_id, click_type, status, starts_at, ends_at, meeting_url, attendee_name, attendee_email, attendee_phone, admin_note, created_at, jobs(id, title, type)")
    .order("created_at", { ascending: false });
  if (since) consultationsQuery = consultationsQuery.gte("created_at", since);
  const { data: consultations, error: consultError } = await consultationsQuery;

  // migration未適用の環境でも画面を表示できるようにする
  const consultationRows: ConsultationBookingRow[] =
    consultError?.code === "42P01" ? [] : ((consultations as ConsultationBookingRow[] | null) || []);

  const userIds = new Set<string>();
  const emails = new Set<string>();

  (applications || []).forEach((row) => {
    if (row.user_id) userIds.add(row.user_id);
  });
  (clicks || []).forEach((row) => {
    if (row.user_id) userIds.add(row.user_id);
  });
  consultationRows.forEach((row) => {
    if (row.user_id) userIds.add(row.user_id);
    if (row.attendee_email) emails.add(safeKeyEmail(row.attendee_email));
  });

  const profilesById = new Map<string, {
    id: string;
    email: string | null;
    last_name: string | null;
    first_name: string | null;
    last_name_kana: string | null;
    first_name_kana: string | null;
    phone_number: string | null;
    prefecture: string | null;
    birth_date: string | null;
  }>();
  const profilesByEmail = new Map<string, {
    id: string;
    email: string | null;
    last_name: string | null;
    first_name: string | null;
    last_name_kana: string | null;
    first_name_kana: string | null;
    phone_number: string | null;
    prefecture: string | null;
    birth_date: string | null;
  }>();

  if (userIds.size > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, last_name, first_name, last_name_kana, first_name_kana, phone_number, prefecture, birth_date")
      .in("id", Array.from(userIds));
    (profiles || []).forEach((profile) => {
      profilesById.set(profile.id, profile);
      const emailKey = safeKeyEmail(profile.email);
      if (emailKey) profilesByEmail.set(emailKey, profile);
    });
  }

  if (emails.size > 0) {
    const { data: byEmailProfiles } = await supabase
      .from("profiles")
      .select("id, email, last_name, first_name, last_name_kana, first_name_kana, phone_number, prefecture, birth_date")
      .in("email", Array.from(emails));
    (byEmailProfiles || []).forEach((profile) => {
      profilesById.set(profile.id, profile);
      const emailKey = safeKeyEmail(profile.email);
      if (emailKey) profilesByEmail.set(emailKey, profile);
    });
  }

  const leadMap = new Map<string, LeadRow>();
  const ensureLead = (
    userId: string | null | undefined,
    email: string | null | undefined,
    fallback: string,
    jobTitle: string | null,
    jobType: string | null,
    attendeeName?: string | null,
    attendeePhone?: string | null,
  ): LeadRow => {
    const key = getLeadKey(userId, email, fallback);
    const existing = leadMap.get(key);
    if (existing) return existing;

    const profile = userId ? profilesById.get(userId) : profilesByEmail.get(safeKeyEmail(email));
    const profileName = profile
      ? `${profile.last_name || ""} ${profile.first_name || ""}`.trim()
      : "";
    const displayName = profileName || attendeeName || "ゲストユーザー";
    const lead: LeadRow = {
      id: key,
      userId: profile?.id || userId || null,
      displayName,
      email: profile?.email || email || null,
      phone: profile?.phone_number || attendeePhone || null,
      prefecture: profile?.prefecture || null,
      age: calculateAgeFromBirthDate(profile?.birth_date),
      accountType: profile ? "registered" : "guest",
      jobTitle: jobTitle || null,
      jobType: jobType || null,
      latestApplicationStatus: null,
      latestConsultationStatus: null,
      nextConsultationAt: null,
      meetingUrl: null,
      applyClicks: 0,
      consultClicks: 0,
      applications: 0,
      consultations: 0,
      events: [],
    };
    leadMap.set(key, lead);
    return lead;
  };

  (clicks || []).forEach((row) => {
    const relatedJob = resolveRelatedJob(row.jobs as RelatedJob | RelatedJob[] | null | undefined);
    const lead = ensureLead(
      row.user_id,
      null,
      `click:${row.id}`,
      relatedJob?.title || null,
      relatedJob?.type || null,
    );
    if (row.click_type === "apply") lead.applyClicks += 1;
    if (row.click_type === "consult") lead.consultClicks += 1;
    lead.events.push({
      id: `click-${row.id}`,
      kind: row.click_type === "apply" ? "apply_click" : "consult_click",
      at: row.clicked_at,
      status: row.click_type === "apply" ? "応募クリック" : "相談クリック",
      title: relatedJob?.title || "求人未特定",
    });
  });

  (applications || []).forEach((row) => {
    const relatedJob = resolveRelatedJob(row.jobs as RelatedJob | RelatedJob[] | null | undefined);
    const lead = ensureLead(
      row.user_id,
      null,
      `app:${row.id}`,
      relatedJob?.title || null,
      relatedJob?.type || null,
    );
    lead.applications += 1;
    lead.latestApplicationStatus = row.status;
    lead.events.push({
      id: `application-${row.id}`,
      kind: "application",
      at: row.created_at,
      status: row.status,
      title: relatedJob?.title || "求人未特定",
      note: row.admin_memo || null,
    });
  });

  consultationRows.forEach((row) => {
    const relatedJob = resolveRelatedJob(row.jobs as RelatedJob | RelatedJob[] | null | undefined);
    const lead = ensureLead(
      row.user_id,
      row.attendee_email,
      `consult:${row.id}`,
      relatedJob?.title || null,
      relatedJob?.type || null,
      row.attendee_name,
      row.attendee_phone,
    );
    lead.consultations += 1;
    lead.latestConsultationStatus = row.status;
    if (row.meeting_url) lead.meetingUrl = row.meeting_url;
    if (row.starts_at) {
      const startsAtTime = new Date(row.starts_at).getTime();
      const currentNext = lead.nextConsultationAt ? new Date(lead.nextConsultationAt).getTime() : 0;
      if (startsAtTime > Date.now() && (currentNext === 0 || startsAtTime < currentNext)) {
        lead.nextConsultationAt = row.starts_at;
      }
    }
    lead.events.push({
      id: `consultation-${row.id}`,
      kind: "consultation",
      at: row.starts_at || row.created_at,
      status: row.status,
      title: relatedJob?.title || "求人未特定",
      note: row.admin_note || null,
    });
  });

  const leads = Array.from(leadMap.values())
    .map((lead) => ({
      ...lead,
      events: lead.events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 12),
    }))
    .sort((a, b) => {
      const aTime = a.events[0] ? new Date(a.events[0].at).getTime() : 0;
      const bTime = b.events[0] ? new Date(b.events[0].at).getTime() : 0;
      return bTime - aTime;
    });

  const applyClicks = (clicks || []).filter((row) => row.click_type === "apply").length;
  const consultClicks = (clicks || []).filter((row) => row.click_type === "consult").length;
  const applicationsCount = (applications || []).length;
  const bookedConsultations = consultationRows.filter((row) =>
    ["booked", "rescheduled", "confirmed"].includes(row.status),
  ).length;
  const completedConsultations = consultationRows.filter((row) => row.status === "completed").length;

  return {
    summary: {
      applyClicks,
      consultClicks,
      applications: applicationsCount,
      bookedConsultations,
      completedConsultations,
      applyToBookedRate: applyClicks > 0 ? Number(((bookedConsultations / applyClicks) * 100).toFixed(1)) : 0,
    },
    leads,
    consultations: consultationRows,
  };
}

export async function updateConsultationBooking(
  id: string,
  updates: { status?: string; meetingUrl?: string; adminNote?: string },
) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  const supabase = createClient();
  const payload: Record<string, string> = {};
  if (typeof updates.status === "string") payload.status = updates.status;
  if (typeof updates.meetingUrl === "string") payload.meeting_url = updates.meetingUrl.trim();
  if (typeof updates.adminNote === "string") payload.admin_note = updates.adminNote;

  if (Object.keys(payload).length === 0) return { success: true };

  const { error } = await supabase
    .from("consultation_bookings")
    .update(payload)
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}
