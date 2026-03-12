const MULTILINE_JOB_FIELDS = new Set([
    "description",
    "requirements",
    "welcome_requirements",
    "working_hours",
    "selection_process",
    "salary_description",
    "period",
    "start_date",
    "workplace_access",
    "nearest_station",
    "location_notes",
    "training_salary",
    "training_period",
    "actual_work_hours",
    "work_days_per_week",
    "nail_policy",
    "shift_notes",
    "general_notes",
    "company_overview",
    "business_overview",
    "overtime_hours",
    "probation_period",
    "probation_details",
    "appeal_points",
    "recruitment_background",
    "education_training",
    "department_details",
    "work_location_detail",
    "salary_detail",
    "salary_example",
    "onboarding_process",
    "interview_location",
    "salary_breakdown",
]);

function coerceText(value: unknown): string {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return "";
}

export function normalizeGeneratedJobText(value: unknown): string {
    const text = coerceText(value).trim();
    if (!text) return "";

    return text
        .replace(/\\r\\n|\\n|\\r/g, "\n")
        .replace(/\\t/g, " ")
        .replace(/\r\n?/g, "\n")
        .replace(/([^\n])\s*[■◆●○□◇▪▫▶▸►]\s*/g, "$1\n・ ")
        .replace(/(^|\n)\s*[■◆●○□◇▪▫▶▸►]\s*/g, "$1・ ")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n[ \t]+/g, "\n")
        .trim();
}

export function normalizeGeneratedJobField(field: string, value: unknown): string {
    const text = coerceText(value);
    if (!text) return "";

    if (MULTILINE_JOB_FIELDS.has(field)) {
        return normalizeGeneratedJobText(text);
    }

    return text.trim();
}
