"use server";

import { createClient } from "@/utils/supabase/server";

export type ConsultationRouteSlug = "dispatch" | "fulltime" | "undecided";
export type ConsultationMode = "visit" | "online";
export type ConsultationDateStatus = "available" | "unavailable";

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

export type ConsultationAvailableDateView = {
  id: string;
  date: string;
  status: ConsultationDateStatus;
  note: string | null;
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

type RecordConsultationLpClickInput = {
  routeSlug: string;
  mode: string;
  selectedDate?: string | null;
  jobId?: string | null;
  clickType: "booking" | "job_detail";
};

const ROUTE_SLUGS: ConsultationRouteSlug[] = ["dispatch", "fulltime", "undecided"];
const MODES: ConsultationMode[] = ["visit", "online"];

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

function formatSalaryText(job: ConsultationJobRow): string | null {
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

  return imageAttachment?.file_url ?? attachments[0]?.file_url ?? null;
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

export async function recordConsultationLpClick(input: RecordConsultationLpClickInput) {
  if (!isRouteSlug(input.routeSlug) || !isMode(input.mode)) {
    return { success: false, error: "Invalid route or mode" };
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("consultation_lp_clicks").insert({
      route_slug: input.routeSlug,
      mode: input.mode,
      selected_date: isValidDate(input.selectedDate) ? input.selectedDate : null,
      job_id: isValidUuid(input.jobId) ? input.jobId : null,
      click_type: input.clickType,
      user_id: user?.id ?? null,
    });

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
