"use server";

import { getPublicJobsList } from "@/app/jobs/actions";
import { isBot } from "@/lib/bot-detector";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";
import { cookies, headers } from "next/headers";

export type ConsultationRouteSlug = "dispatch" | "fulltime" | "undecided";
export type ConsultationMode = "visit" | "online";
export type ConsultationDateStatus = "available" | "unavailable";
export type ConsultationEmploymentKey = "dispatch" | "fulltime";

export type ConsultationBookingSlotView = {
  label: string;
  url: string;
};

export type ConsultationJobCard = {
  id: string;
  title: string;
  type: string;
  imageUrl: string | null;
  areaText: string | null;
  salaryText: string | null;
  workingHours: string | null;
  tags: string[];
  detailUrl: string;
  highlightLabel: string | null;
  isFeatured: boolean;
};

export type ConsultationEmploymentJobGroup = {
  key: ConsultationEmploymentKey;
  label: "派遣" | "正社員";
  typeQuery: "派遣" | "正社員";
  total: number;
  listUrl: string;
  jobs: ConsultationJobCard[];
};

export type ConsultationEmploymentJobSummary = {
  dispatch: ConsultationEmploymentJobGroup;
  fulltime: ConsultationEmploymentJobGroup;
};

export type ConsultationAvailableDateView = {
  id: string;
  date: string;
  status: ConsultationDateStatus;
  note: string | null;
  bookingUrl: string | null;
  slotLabel: string | null;
  slotTitle: string | null;
  slotDescription: string | null;
  slotBadge: string | null;
  slots: ConsultationBookingSlotView[];
  jobs: ConsultationJobCard[];
};

export type ConsultationBookingOptionView = {
  id: string;
  mode: ConsultationMode;
  label: string;
  bookingUrl: string;
  chips: string[];
  isDefault: boolean;
  availableDates: ConsultationAvailableDateView[];
};

export type ConsultationRouteView = {
  id: string;
  slug: ConsultationRouteSlug;
  title: string;
  subtitle: string | null;
  description: string | null;
  targetEmploymentType: "dispatch" | "fulltime" | "mixed";
  options: ConsultationBookingOptionView[];
};

type ConsultationRouteRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  target_employment_type: string;
  display_order: number | null;
  consultation_booking_options?: ConsultationBookingOptionRow[] | null;
};

type ConsultationBookingOptionRow = {
  id: string;
  mode: string;
  label: string;
  booking_url: string;
  chips: string[] | null;
  is_default: boolean | null;
  is_active: boolean | null;
  display_order: number | null;
  consultation_available_dates?: ConsultationAvailableDateRow[] | null;
};

type ConsultationAvailableDateRow = {
  id: string;
  available_date: string;
  status: string;
  note: string | null;
  booking_url: string | null;
  slot_label: string | null;
  slot_title: string | null;
  slot_description: string | null;
  slot_badge: string | null;
  slots: unknown | null;
  display_order: number | null;
  consultation_date_jobs?: ConsultationDateJobRow[] | null;
};

type ConsultationDateJobRow = {
  display_order: number | null;
  highlight_label: string | null;
  is_featured: boolean | null;
  jobs?: ConsultationJobRow | ConsultationJobRow[] | null;
};

type ConsultationJobRow = {
  id: string;
  title: string | null;
  type: string | null;
  area: string | null;
  search_areas: string[] | null;
  salary: string | null;
  hourly_wage: number | null;
  working_hours: string | null;
  category: string | string[] | null;
  tags: string[] | null;
  job_attachments?: ConsultationJobAttachmentRow[] | null;
  fulltime_job_details?: ConsultationFulltimeDetailsRow | ConsultationFulltimeDetailsRow[] | null;
};

type ConsultationJobAttachmentRow = {
  file_url: string | null;
};

type ConsultationFulltimeDetailsRow = {
  annual_salary_min: number | null;
  annual_salary_max: number | null;
};

type ConsultationSalarySource = {
  type: string | null;
  salary: string | null;
  hourly_wage: number | null;
  fulltime_job_details?: ConsultationFulltimeDetailsRow | ConsultationFulltimeDetailsRow[] | null;
};

type PublicJobPreviewRow = {
  id?: string | null;
  title?: string | null;
  type?: string | null;
  area?: string | null;
  search_areas?: string[] | null;
  salary?: string | null;
  hourly_wage?: number | null;
  working_hours?: string | null;
  category?: string | string[] | null;
  tags?: string[] | null;
  fulltime_job_details?: ConsultationFulltimeDetailsRow | ConsultationFulltimeDetailsRow[] | null;
};

type RecordConsultationLpClickInput = {
  routeSlug: string;
  mode: string;
  selectedDate?: string | null;
  jobId?: string | null;
  clickType: "booking" | "job_detail";
};

const ROUTE_SLUGS: ConsultationRouteSlug[] = ["dispatch", "fulltime", "undecided"];
const MODES: ConsultationMode[] = ["visit", "online"];
const CONSULTATION_VISITOR_COOKIE = "nl_consult_visitor";
const CONSULTATION_VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const CONSULTATION_EMPLOYMENT_JOB_LIMIT = 6;
const CONSULTATION_EMPLOYMENT_JOB_TOKYO_LEAD_LIMIT = 4;
const CONSULTATION_EMPLOYMENT_JOB_RANDOM_TAIL_LIMIT = 2;
const CONSULTATION_EMPLOYMENT_JOB_POOL_SIZE = 50;
const TOKYO_AREA_FETCH_KEYWORDS = [
  "東京",
  "港区",
  "新宿区",
  "渋谷区",
  "千代田区",
  "中央区",
  "品川区",
  "江東区",
  "豊島区",
  "世田谷区",
  "大田区",
  "立川市",
  "八王子市",
  "町田市",
] as const;
const TOKYO_AREA_MATCH_KEYWORDS = [
  "東京都",
  "東京",
  "東京23区",
  "23区",
  "千代田区",
  "中央区",
  "港区",
  "新宿区",
  "文京区",
  "台東区",
  "墨田区",
  "江東区",
  "品川区",
  "目黒区",
  "大田区",
  "世田谷区",
  "渋谷区",
  "中野区",
  "杉並区",
  "豊島区",
  "北区",
  "荒川区",
  "板橋区",
  "練馬区",
  "足立区",
  "葛飾区",
  "江戸川区",
  "八王子市",
  "立川市",
  "武蔵野市",
  "三鷹市",
  "青梅市",
  "府中市",
  "昭島市",
  "調布市",
  "町田市",
  "小金井市",
  "小平市",
  "日野市",
  "東村山市",
  "国分寺市",
  "国立市",
  "福生市",
  "狛江市",
  "東大和市",
  "清瀬市",
  "東久留米市",
  "武蔵村山市",
  "多摩市",
  "稲城市",
  "羽村市",
  "あきる野市",
  "西東京市",
] as const;
const EMPLOYMENT_JOB_GROUPS = {
  dispatch: {
    key: "dispatch",
    label: "派遣",
    typeQuery: "派遣",
    listUrl: "/jobs?type=派遣",
  },
  fulltime: {
    key: "fulltime",
    label: "正社員",
    typeQuery: "正社員",
    listUrl: "/jobs?type=正社員",
  },
} as const satisfies Record<
  ConsultationEmploymentKey,
  Pick<ConsultationEmploymentJobGroup, "key" | "label" | "typeQuery" | "listUrl">
>;
type EmploymentJobGroupConfig = (typeof EMPLOYMENT_JOB_GROUPS)[ConsultationEmploymentKey];

function isRouteSlug(value: string): value is ConsultationRouteSlug {
  return ROUTE_SLUGS.includes(value as ConsultationRouteSlug);
}

function isMode(value: string): value is ConsultationMode {
  return MODES.includes(value as ConsultationMode);
}

function isDateStatus(value: string): value is ConsultationDateStatus {
  return value === "available" || value === "unavailable";
}

function isTargetEmploymentType(value: string): value is ConsultationRouteView["targetEmploymentType"] {
  return value === "dispatch" || value === "fulltime" || value === "mixed";
}

function normalizeStringArray(value: string | string[] | null | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
    }
  } catch {
    return [value];
  }

  return [value];
}

function normalizeBookingSlots(
  value: unknown,
  fallbackUrl: string | null | undefined,
  fallbackLabel: string | null | undefined,
): ConsultationBookingSlotView[] {
  let rawSlots: unknown = value;

  if (typeof rawSlots === "string" && rawSlots.trim().length > 0) {
    try {
      rawSlots = JSON.parse(rawSlots);
    } catch {
      rawSlots = [];
    }
  }

  if (Array.isArray(rawSlots)) {
    const slots = rawSlots
      .map((slot) => {
        if (!slot || typeof slot !== "object") return null;
        const record = slot as Record<string, unknown>;
        const label = typeof record.label === "string" ? record.label.trim() : "";
        const url = typeof record.url === "string" ? record.url.trim() : "";
        if (!label || !url) return null;
        return { label, url };
      })
      .filter((slot): slot is ConsultationBookingSlotView => Boolean(slot));

    if (slots.length > 0) return slots;
  }

  const url = fallbackUrl?.trim();
  if (!url) return [];

  return [
    {
      label: fallbackLabel?.trim() || "予約する",
      url,
    },
  ];
}

function getFulltimeDetails(
  value: ConsultationFulltimeDetailsRow | ConsultationFulltimeDetailsRow[] | null | undefined,
): ConsultationFulltimeDetailsRow | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function getJobRow(value: ConsultationJobRow | ConsultationJobRow[] | null | undefined): ConsultationJobRow | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatSalaryText(job: ConsultationSalarySource): string | null {
  const fulltimeDetails = getFulltimeDetails(job.fulltime_job_details);
  const annualSalaryMin = fulltimeDetails?.annual_salary_min;
  const annualSalaryMax = fulltimeDetails?.annual_salary_max;

  if ((job.type?.includes("正社員") || job.type?.includes("正職員")) && (annualSalaryMin || annualSalaryMax)) {
    if (annualSalaryMin && annualSalaryMax) {
      return `年収${annualSalaryMin}〜${annualSalaryMax}万円`;
    }
    return `年収${annualSalaryMin ?? annualSalaryMax}万円〜`;
  }

  if (job.type?.includes("派遣") && job.hourly_wage) {
    return `時給${job.hourly_wage.toLocaleString()}円`;
  }

  return job.salary;
}

function getImageUrl(attachments: ConsultationJobAttachmentRow[] | null | undefined): string | null {
  if (!attachments || attachments.length === 0) return null;

  const imageAttachment = attachments.find((attachment) => {
    const url = attachment.file_url?.toLowerCase();
    return Boolean(url && /\.(jpg|jpeg|png|webp|gif)(\?|$)/.test(url));
  });

  return imageAttachment?.file_url ?? null;
}

function mapJobCard(dateJob: ConsultationDateJobRow): ConsultationJobCard | null {
  const job = getJobRow(dateJob.jobs);
  if (!job?.id) return null;

  const tags = [
    ...normalizeStringArray(job.tags),
    ...normalizeStringArray(job.category).slice(0, 1),
  ].filter((tag, index, values) => values.indexOf(tag) === index);

  return {
    id: job.id,
    title: job.title ?? "タイトル未設定",
    type: job.type ?? "求人",
    imageUrl: getImageUrl(job.job_attachments),
    areaText: job.search_areas?.length ? job.search_areas.join(" / ") : job.area,
    salaryText: formatSalaryText(job),
    workingHours: job.working_hours,
    tags,
    detailUrl: `/jobs/${job.id}`,
    highlightLabel: dateJob.highlight_label,
    isFeatured: Boolean(dateJob.is_featured),
  };
}

function mapEmploymentJobCard(job: PublicJobPreviewRow): ConsultationJobCard | null {
  if (!job.id) return null;

  const tags = [
    ...normalizeStringArray(job.tags),
    ...normalizeStringArray(job.category),
  ].filter((tag, index, values) => values.indexOf(tag) === index);

  return {
    id: job.id,
    title: job.title ?? "タイトル未設定",
    type: job.type ?? "求人",
    imageUrl: null,
    areaText: job.search_areas?.length ? job.search_areas.join(" / ") : job.area ?? null,
    salaryText: formatSalaryText({
      type: job.type ?? null,
      salary: job.salary ?? null,
      hourly_wage: job.hourly_wage ?? null,
      fulltime_job_details: job.fulltime_job_details ?? null,
    }),
    workingHours: job.working_hours ?? null,
    tags,
    detailUrl: `/jobs/${job.id}`,
    highlightLabel: null,
    isFeatured: false,
  };
}

function dedupeJobCards(jobs: ConsultationJobCard[]): ConsultationJobCard[] {
  const seen = new Set<string>();
  return jobs.filter((job) => {
    if (seen.has(job.id)) return false;
    seen.add(job.id);
    return true;
  });
}

function isTokyoRelatedJob(job: ConsultationJobCard): boolean {
  const searchText = [job.areaText, job.title].filter(Boolean).join(" ");
  return TOKYO_AREA_MATCH_KEYWORDS.some((keyword) => searchText.includes(keyword));
}

function takeRandomJobs(
  jobs: ConsultationJobCard[],
  limit: number,
  excludedIds: Set<string>,
): ConsultationJobCard[] {
  const pool = jobs.filter((job) => !excludedIds.has(job.id));

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
  }

  return pool.slice(0, limit);
}

function selectEmploymentPreviewJobs(
  allJobs: ConsultationJobCard[],
  tokyoPreferredJobs: ConsultationJobCard[],
): ConsultationJobCard[] {
  const uniqueAllJobs = dedupeJobCards(allJobs);
  const tokyoJobs = dedupeJobCards([
    ...tokyoPreferredJobs,
    ...uniqueAllJobs.filter(isTokyoRelatedJob),
  ]).filter(isTokyoRelatedJob);

  const leadLimit = CONSULTATION_EMPLOYMENT_JOB_LIMIT - CONSULTATION_EMPLOYMENT_JOB_RANDOM_TAIL_LIMIT;
  const leadJobs = tokyoJobs.slice(0, leadLimit);
  const selectedLeadIds = new Set(leadJobs.map((job) => job.id));

  // 東京系求人が不足した場合だけ、公開求人候補で先頭枠を補完する。
  if (leadJobs.length < leadLimit) {
    uniqueAllJobs.forEach((job) => {
      if (leadJobs.length >= leadLimit || selectedLeadIds.has(job.id)) return;
      leadJobs.push(job);
      selectedLeadIds.add(job.id);
    });
  }

  const randomTailJobs = takeRandomJobs(
    uniqueAllJobs,
    CONSULTATION_EMPLOYMENT_JOB_RANDOM_TAIL_LIMIT,
    selectedLeadIds,
  );

  return [...leadJobs, ...randomTailJobs].slice(0, CONSULTATION_EMPLOYMENT_JOB_LIMIT);
}

async function getTokyoPreferredEmploymentJobs(
  config: EmploymentJobGroupConfig,
): Promise<ConsultationJobCard[]> {
  const jobs: ConsultationJobCard[] = [];
  const seen = new Set<string>();

  for (const area of TOKYO_AREA_FETCH_KEYWORDS) {
    const tokyoJobCount = jobs.filter(isTokyoRelatedJob).length;
    if (tokyoJobCount >= CONSULTATION_EMPLOYMENT_JOB_TOKYO_LEAD_LIMIT) break;

    const result = await getPublicJobsList({
      area,
      type: config.typeQuery,
      page: 1,
      pageSize: CONSULTATION_EMPLOYMENT_JOB_POOL_SIZE,
      sort: "newest",
    });

    (result.jobs as PublicJobPreviewRow[])
      .map(mapEmploymentJobCard)
      .filter((job): job is ConsultationJobCard => Boolean(job))
      .filter(isTokyoRelatedJob)
      .forEach((job) => {
        if (seen.has(job.id)) return;
        seen.add(job.id);
        jobs.push(job);
      });
  }

  return jobs;
}

async function getEmploymentJobGroup(
  key: ConsultationEmploymentKey,
): Promise<ConsultationEmploymentJobGroup> {
  const config = EMPLOYMENT_JOB_GROUPS[key];
  const [result, tokyoPreferredJobs] = await Promise.all([
    getPublicJobsList({
      type: config.typeQuery,
      page: 1,
      pageSize: CONSULTATION_EMPLOYMENT_JOB_POOL_SIZE,
      sort: "newest",
    }),
    getTokyoPreferredEmploymentJobs(config),
  ]);
  const allJobs = (result.jobs as PublicJobPreviewRow[])
    .map(mapEmploymentJobCard)
    .filter((job): job is ConsultationJobCard => Boolean(job));

  return {
    ...config,
    total: result.total,
    jobs: selectEmploymentPreviewJobs(allJobs, tokyoPreferredJobs),
  };
}

function sortByDisplayOrder<T extends { display_order: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

function isValidDate(value: string | null | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function isValidUuid(value: string | null | undefined): value is string {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
  );
}

function getOrCreateConsultationVisitorId(): string {
  const cookieStore = cookies();
  const existing = cookieStore.get(CONSULTATION_VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const visitorId = crypto.randomUUID();
  cookieStore.set(CONSULTATION_VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    maxAge: CONSULTATION_VISITOR_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return visitorId;
}

function hashConsultationVisitorId(visitorId: string): string {
  return crypto.createHash("sha256").update(visitorId).digest("hex");
}

function isMissingTrackingColumnError(error: { code?: string; message?: string } | null): boolean {
  return Boolean(
    error &&
      (error.code === "42703" ||
        error.code === "PGRST204" ||
        /column.*(visitor_hash|is_bot|user_agent)|Could not find.*(visitor_hash|is_bot|user_agent)/i.test(
          error.message ?? "",
        )),
  );
}

export async function getConsultationRoutesView(): Promise<ConsultationRouteView[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("consultation_routes")
    .select(`
      id,
      slug,
      title,
      subtitle,
      description,
      target_employment_type,
      display_order,
      consultation_booking_options (
        id,
        mode,
        label,
        booking_url,
        chips,
        is_default,
        is_active,
        display_order,
        consultation_available_dates (
          id,
          available_date,
          status,
          note,
          booking_url,
          slot_label,
          slot_title,
          slot_description,
          slot_badge,
          slots,
          display_order,
          consultation_date_jobs (
            display_order,
            highlight_label,
            is_featured,
            jobs (
              id,
              title,
              type,
              area,
              search_areas,
              salary,
              hourly_wage,
              working_hours,
              category,
              tags,
              job_attachments (
                file_url
              ),
              fulltime_job_details (
                annual_salary_min,
                annual_salary_max
              )
            )
          )
        )
      )
    `)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching consultation routes:", error);
    return [];
  }

  const rows = (data ?? []) as ConsultationRouteRow[];

  return sortByDisplayOrder(rows)
    .map((route) => {
      if (!isRouteSlug(route.slug) || !isTargetEmploymentType(route.target_employment_type)) {
        return null;
      }

      const options = sortByDisplayOrder(route.consultation_booking_options ?? [])
        .filter((option) => option.is_active !== false && isMode(option.mode))
        .map((option) => {
          const availableDates = sortByDisplayOrder(option.consultation_available_dates ?? [])
            .filter((date) => isValidDate(date.available_date) && isDateStatus(date.status))
            .map((date) => {
              const jobs = sortByDisplayOrder(date.consultation_date_jobs ?? [])
                .map(mapJobCard)
                .filter((job): job is ConsultationJobCard => Boolean(job));

              return {
                id: date.id,
                date: date.available_date,
                status: date.status as ConsultationDateStatus,
                note: date.note,
                bookingUrl: date.booking_url,
                slotLabel: date.slot_label,
                slotTitle: date.slot_title,
                slotDescription: date.slot_description,
                slotBadge: date.slot_badge,
                slots: normalizeBookingSlots(date.slots, date.booking_url, date.slot_label),
                jobs,
              };
            })
            .sort((a, b) => a.date.localeCompare(b.date));

          return {
            id: option.id,
            mode: option.mode as ConsultationMode,
            label: option.label,
            bookingUrl: option.booking_url,
            chips: option.chips ?? [],
            isDefault: Boolean(option.is_default),
            availableDates,
          };
        });

      return {
        id: route.id,
        slug: route.slug,
        title: route.title,
        subtitle: route.subtitle,
        description: route.description,
        targetEmploymentType: route.target_employment_type,
        options,
      };
    })
    .filter((route): route is ConsultationRouteView => Boolean(route));
}

export async function getConsultationEmploymentJobSummary(): Promise<ConsultationEmploymentJobSummary> {
  const [dispatch, fulltime] = await Promise.all([
    getEmploymentJobGroup("dispatch"),
    getEmploymentJobGroup("fulltime"),
  ]);

  return { dispatch, fulltime };
}

export async function recordConsultationLpClick(input: RecordConsultationLpClickInput) {
  if (!isRouteSlug(input.routeSlug) || !isMode(input.mode)) {
    return { success: false, error: "Invalid route or mode" };
  }

  try {
    const supabase = createClient();
    const headersList = headers();
    const userAgent = headersList.get("user-agent");
    const visitorHash = hashConsultationVisitorId(getOrCreateConsultationVisitorId());
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const basePayload = {
      route_slug: input.routeSlug,
      mode: input.mode,
      selected_date: isValidDate(input.selectedDate) ? input.selectedDate : null,
      job_id: isValidUuid(input.jobId) ? input.jobId : null,
      click_type: input.clickType,
      user_id: user?.id ?? null,
    };

    let { error } = await supabase.from("consultation_lp_clicks").insert({
      ...basePayload,
      visitor_hash: visitorHash,
      is_bot: isBot(userAgent),
      user_agent: userAgent?.substring(0, 500) ?? null,
    });

    if (isMissingTrackingColumnError(error)) {
      const retry = await supabase.from("consultation_lp_clicks").insert(basePayload);
      error = retry.error;
    }

    if (error) {
      console.error("Error recording consultation LP click:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error recording consultation LP click:", error);
    return { success: false, error: "Unexpected error" };
  }
}
