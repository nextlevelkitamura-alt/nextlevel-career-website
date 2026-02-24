const BENEFIT_PRIORITY_RULES: { label: string; pattern: RegExp }[] = [
  { label: "交通費", pattern: /(交通費|通勤手当|通勤費)/ },
  { label: "住宅", pattern: /(住宅手当|社宅|寮|家賃補助)/ },
  { label: "社割", pattern: /(社割|社員割引|従業員割引)/ },
  { label: "研修", pattern: /(研修|教育制度|OJT|トレーニング)/ },
  { label: "産育休", pattern: /(産休|育休|産前|産後|育児休暇|育児支援)/ },
  { label: "資格支援", pattern: /(資格取得|資格支援|受験費用補助)/ },
  { label: "社会保険", pattern: /(社会保険|各種保険|厚生年金|雇用保険|労災保険)/ },
];

const HOLIDAY_PATTERN_PRIORITY: RegExp[] = [
  /土日祝休み?/,
  /完全週休2日制?/,
  /週休2日制?/,
  /シフト制?/,
  /4週8休/,
];

const HOLIDAY_NOTE_PATTERNS: RegExp[] = [
  /有給/,
  /夏季/,
  /年末年始/,
  /GW/,
  /慶弔/,
  /産前|産後|育児|介護/,
];

export interface HeaderSummaryInput {
  holidays?: string | null;
  benefits?: string | null;
  annualHolidays?: string | number | null;
  holidayPattern?: string | null;
  holidayNotes?: string | null;
  workingHours?: string | null;
  overtimeHours?: string | null;
  salary?: string | null;
  annualSalaryMin?: number | null;
  annualSalaryMax?: number | null;
  displayAreaText?: string | null;
}

function splitByDelimiters(value: string): string[] {
  return value
    .split(/[\n\r]+|[、,，]|\s{2,}|[・●]/)
    .map((item) => item.replace(/^[・●■\-\*]+\s*/, "").trim())
    .filter(Boolean);
}

export function parseListField(value: string | null | undefined): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // ignore
  }

  return splitByDelimiters(value);
}

export function normalizeStringArray(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));
}

export function pickCoreBenefits(benefits: string[], max = 3): string[] {
  const normalized = normalizeStringArray(benefits);
  if (normalized.length === 0) return [];

  const selected: string[] = [];
  const used = new Set<string>();

  for (const rule of BENEFIT_PRIORITY_RULES) {
    const matched = normalized.find((benefit) => !used.has(benefit) && rule.pattern.test(benefit));
    if (matched) {
      selected.push(matched);
      used.add(matched);
    }
    if (selected.length >= max) return selected;
  }

  for (const benefit of normalized) {
    if (used.has(benefit)) continue;
    selected.push(benefit);
    if (selected.length >= max) break;
  }

  return selected;
}

export function inferHolidayPattern(holidays: string[]): string {
  for (const pattern of HOLIDAY_PATTERN_PRIORITY) {
    const matched = holidays.find((holiday) => pattern.test(holiday));
    if (matched) return matched;
  }
  return holidays[0] || "";
}

export function inferHolidayNotes(holidays: string[], max = 2): string {
  const notes = holidays.filter((holiday) => HOLIDAY_NOTE_PATTERNS.some((pattern) => pattern.test(holiday)));
  const unique = normalizeStringArray(notes).slice(0, max);
  return unique.join(" / ");
}

export function getMonthlySalaryLabel(input: Pick<HeaderSummaryInput, "salary" | "annualSalaryMin" | "annualSalaryMax">): string {
  if (input.salary && /月給/.test(input.salary)) {
    return input.salary;
  }

  const { annualSalaryMin, annualSalaryMax } = input;
  if (!annualSalaryMin && !annualSalaryMax) return "";

  const minMonthly = annualSalaryMin ? Math.floor((annualSalaryMin / 12) * 10) / 10 : null;
  const maxMonthly = annualSalaryMax ? Math.floor((annualSalaryMax / 12) * 10) / 10 : null;

  if (minMonthly && maxMonthly) return `月給目安 ${minMonthly}万〜${maxMonthly}万円`;
  if (minMonthly) return `月給目安 ${minMonthly}万円〜`;
  if (maxMonthly) return `月給目安 〜${maxMonthly}万円`;
  return "";
}

export function buildHeaderSummary(input: HeaderSummaryInput) {
  const holidaysList = parseListField(input.holidays || "");
  const benefitsList = parseListField(input.benefits || "");

  const holidayPattern = (input.holidayPattern || "").trim() || inferHolidayPattern(holidaysList);
  const holidayNotes = (input.holidayNotes || "").trim() || inferHolidayNotes(holidaysList);

  const annualHolidaysText = input.annualHolidays ? String(input.annualHolidays).trim() : "";
  const annualHolidaysLabel = annualHolidaysText
    ? `年間休日${/日/.test(annualHolidaysText) ? annualHolidaysText : `${annualHolidaysText}日`}`
    : "";

  const overtimeLabel = input.overtimeHours?.trim()
    ? `残業 ${input.overtimeHours?.trim().includes("時間") ? input.overtimeHours?.trim() : `${input.overtimeHours?.trim()}時間`}`
    : "";

  const monthlySalaryLabel = getMonthlySalaryLabel(input);

  return {
    holiday: {
      annualHolidaysLabel,
      holidayPattern,
      holidayNotes,
    },
    benefits: {
      coreLabels: pickCoreBenefits(benefitsList, 3),
    },
    meta: {
      displayAreaText: (input.displayAreaText || "").trim(),
      workingHours: (input.workingHours || "").trim(),
      overtimeLabel,
      monthlySalaryLabel,
    },
  };
}

export function normalizeExtractionHeaderFields(data: {
  holidays?: string[];
  benefits?: string[];
  holiday_pattern?: string;
  holiday_notes?: string;
}) {
  const holidays = normalizeStringArray(data.holidays || []);
  const benefits = normalizeStringArray(data.benefits || []);

  const holidayPattern = (data.holiday_pattern || "").trim() || inferHolidayPattern(holidays);
  const holidayNotes = (data.holiday_notes || "").trim() || inferHolidayNotes(holidays);

  return {
    holidays,
    benefits,
    holidayPattern,
    holidayNotes,
  };
}
