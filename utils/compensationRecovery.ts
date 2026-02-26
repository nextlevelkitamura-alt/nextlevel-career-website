export interface CompensationRecoverableData {
  type?: string;
  salary?: string;
  salary_description?: string;
  salary_detail?: string;
  salary_breakdown?: string;
  salary_example?: string;
  raise_info?: string;
  bonus_info?: string;
  commute_allowance?: string;
  annual_salary_min?: number;
  annual_salary_max?: number;
  benefits?: string[];
  description?: string;
  work_location_detail?: string;
}

const SECTION_BREAK_REGEX = /(年間休日|休日|休日・休暇|福利厚生|選考|勤務時間|試用期間|就業時間)/;

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toHalfWidthDigits(input: string): string {
  return input.replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0));
}

function normalizeSpaces(input: string): string {
  return input.replace(/\u3000/g, " ").replace(/\r/g, "").trim();
}

function normalizeMoneyText(input: string): string {
  return toHalfWidthDigits(input).replace(/,/g, "").trim();
}

function collectCompensationSourceText(data: CompensationRecoverableData): string {
  const blocks: string[] = [];
  const candidates = [
    data.salary,
    data.salary_description,
    data.salary_detail,
    data.salary_breakdown,
    data.salary_example,
    data.raise_info,
    data.bonus_info,
    data.commute_allowance,
    data.description,
    data.work_location_detail,
  ];

  for (const value of candidates) {
    if (hasText(value)) blocks.push(normalizeSpaces(value));
  }

  if (Array.isArray(data.benefits) && data.benefits.length > 0) {
    blocks.push(data.benefits.join("\n"));
  }

  return blocks.join("\n");
}

function splitMeaningfulLines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => normalizeSpaces(line))
    .map((line) => line.replace(/^[・\-*■◆\s]+/, "").trim())
    .filter((line) => line.length > 0);
}

function uniqueLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    if (!seen.has(line)) {
      seen.add(line);
      result.push(line);
    }
  }
  return result;
}

function pickFirstLine(lines: string[], regex: RegExp): string {
  return lines.find((line) => regex.test(line)) ?? "";
}

function pickSalaryBreakdown(lines: string[]): string {
  const direct = lines.filter((line) =>
    /(基本給|月給内訳|給与内訳|固定残業|みなし残業|残業手当|地域手当|各種手当|手当:|手当：)/.test(line)
  );
  if (direct.length > 0) return uniqueLines(direct).slice(0, 6).join("\n");

  const startIndex = lines.findIndex((line) =>
    /(月給内訳|給与内訳|賃金等|給与備考|支払われる手当)/.test(line)
  );
  if (startIndex < 0) return "";

  const captured: string[] = [];
  for (let i = startIndex + 1; i < lines.length && captured.length < 6; i += 1) {
    const line = lines[i];
    if (SECTION_BREAK_REGEX.test(line)) break;
    if (/(円|万円|手当|残業|基本給|内訳|支給)/.test(line)) captured.push(line);
  }
  return uniqueLines(captured).join("\n");
}

function pickSalaryDetail(lines: string[]): string {
  const detailLines = lines.filter((line) =>
    /(想定年収|年収備考|月収例|年収幅|首都圏|関西|月給|年収|賃金)/.test(line)
  );
  return uniqueLines(detailLines).slice(0, 8).join("\n");
}

function pickSalaryExample(lines: string[]): string {
  const modelLines = lines.filter((line) =>
    /(想定年収|年収幅|年収[0-9０-９]|[0-9０-９]{2,4}万円.*(入社|年目|リーダー|主任|マネージャー))/.test(line)
  );
  return uniqueLines(modelLines).slice(0, 4).join("\n");
}

function parseAnnualSalaryRange(text: string): { min?: number; max?: number } {
  const normalized = normalizeMoneyText(text);

  const manRange = normalized.match(
    /(?:想定)?年収[:：]?\s*([0-9]{2,4})\s*万(?:円)?\s*[~〜\-－]\s*([0-9]{2,4})\s*万/
  );
  if (manRange) {
    return { min: Number(manRange[1]), max: Number(manRange[2]) };
  }

  const yenRange = normalized.match(
    /(?:想定)?年収[:：]?\s*([0-9]{6,8})\s*円?\s*[~〜\-－]\s*([0-9]{6,8})\s*円/
  );
  if (yenRange) {
    return {
      min: Math.round(Number(yenRange[1]) / 10000),
      max: Math.round(Number(yenRange[2]) / 10000),
    };
  }

  const minOnly = normalized.match(/(?:想定)?年収[:：]?\s*([0-9]{2,4})\s*万(?:円)?\s*(?:以上|〜|~)?/);
  if (minOnly) {
    return { min: Number(minOnly[1]) };
  }

  return {};
}

export function recoverCompensationFields<T extends CompensationRecoverableData>(data: T): T {
  const sourceText = collectCompensationSourceText(data);
  if (!sourceText) return data;

  const lines = splitMeaningfulLines(sourceText);
  if (lines.length === 0) return data;

  const next: T = { ...data };

  if (!hasText(next.raise_info)) {
    const raise = pickFirstLine(lines, /(昇給|給与アップ)/);
    if (raise) next.raise_info = raise;
  }

  if (!hasText(next.bonus_info)) {
    const bonus = pickFirstLine(lines, /(賞与|ボーナス)/);
    if (bonus) next.bonus_info = bonus;
  }

  if (!hasText(next.commute_allowance)) {
    const commute = pickFirstLine(lines, /(通勤手当|交通費)/);
    if (commute) next.commute_allowance = commute;
  }

  if (!hasText(next.salary_breakdown)) {
    const breakdown = pickSalaryBreakdown(lines);
    if (breakdown) next.salary_breakdown = breakdown;
  }

  if (!hasText(next.salary_detail)) {
    const detail = pickSalaryDetail(lines);
    if (detail) next.salary_detail = detail;
  }

  if (!hasText(next.salary_example)) {
    const example = pickSalaryExample(lines);
    if (example) next.salary_example = example;
  }

  if (!(typeof next.annual_salary_min === "number" && next.annual_salary_min > 0) ||
    !(typeof next.annual_salary_max === "number" && next.annual_salary_max > 0)) {
    const parsed = parseAnnualSalaryRange(sourceText);
    if (!(typeof next.annual_salary_min === "number" && next.annual_salary_min > 0) && parsed.min) {
      next.annual_salary_min = parsed.min;
    }
    if (!(typeof next.annual_salary_max === "number" && next.annual_salary_max > 0) && parsed.max) {
      next.annual_salary_max = parsed.max;
    }
  }

  return next;
}
