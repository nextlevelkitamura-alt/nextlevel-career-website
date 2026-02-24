import { describe, expect, it } from "@jest/globals";
import {
  buildHeaderSummary,
  normalizeExtractionHeaderFields,
  parseListField,
  pickCoreBenefits,
} from "@/utils/jobHeaderSummary";

describe("parseListField", () => {
  it("JSON配列文字列を配列として展開する", () => {
    expect(parseListField('["土日祝休み","有給休暇"]')).toEqual(["土日祝休み", "有給休暇"]);
  });

  it("プレーン文字列も区切り文字で分割する", () => {
    expect(parseListField("交通費全額支給、研修制度あり\n資格取得支援")).toEqual([
      "交通費全額支給",
      "研修制度あり",
      "資格取得支援",
    ]);
  });
});

describe("pickCoreBenefits", () => {
  it("優先順位に基づいて2〜3件を抽出する", () => {
    const result = pickCoreBenefits([
      "資格取得支援制度",
      "交通費全額支給",
      "社割制度あり",
      "研修制度あり",
    ]);

    expect(result).toEqual(["交通費全額支給", "社割制度あり", "研修制度あり"]);
  });
});

describe("buildHeaderSummary", () => {
  it("休日休暇と福利厚生のヘッダー要約を生成する", () => {
    const summary = buildHeaderSummary({
      holidays: '["完全週休2日制（土日）","有給休暇","夏季休暇"]',
      benefits: '["交通費全額支給","住宅手当あり","研修制度あり"]',
      annualHolidays: "125",
      salary: "月給28万円以上",
      overtimeHours: "月10時間",
      displayAreaText: "東京都 / 神奈川県 / 埼玉県",
      workingHours: "10:00〜19:00（実働8時間）",
    });

    expect(summary.holiday.annualHolidaysLabel).toBe("年間休日125日");
    expect(summary.holiday.holidayPattern).toBe("完全週休2日制（土日）");
    expect(summary.holiday.holidayNotes).toContain("有給休暇");
    expect(summary.benefits.coreLabels).toEqual(["交通費全額支給", "住宅手当あり", "研修制度あり"]);
    expect(summary.meta.monthlySalaryLabel).toBe("月給28万円以上");
    expect(summary.meta.overtimeLabel).toBe("残業 月10時間");
  });
});

describe("normalizeExtractionHeaderFields", () => {
  it("holiday_pattern/holiday_notesを補完しつつ配列を正規化する", () => {
    const normalized = normalizeExtractionHeaderFields({
      holidays: ["週休2日制", "有給休暇"],
      benefits: ["交通費全額支給", "交通費全額支給"],
      holiday_pattern: "",
      holiday_notes: "",
    });

    expect(normalized.holidays).toEqual(["週休2日制", "有給休暇"]);
    expect(normalized.benefits).toEqual(["交通費全額支給"]);
    expect(normalized.holidayPattern).toBe("週休2日制");
    expect(normalized.holidayNotes).toBe("有給休暇");
  });
});
