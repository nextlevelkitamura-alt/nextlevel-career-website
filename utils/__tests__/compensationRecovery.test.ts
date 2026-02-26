import { describe, expect, it } from "@jest/globals";
import { recoverCompensationFields } from "@/utils/compensationRecovery";

describe("recoverCompensationFields", () => {
  it("fills salary breakdown and allowances from salary detail text", () => {
    const input = {
      type: "正社員",
      salary_detail: `想定年収:260万円~300万円
【月給内訳】
・基本給:158,612円〜170,600円
・地域手当:40,000円
・みなし残業手当:月15時間分、22,988円〜24,400円 ※超過分支給あり
昇給:年2回(4月、10月)
通勤手当:別途支給(上限3万円)`,
      salary_breakdown: "",
      raise_info: "",
      bonus_info: "",
      commute_allowance: "",
      annual_salary_min: 0,
      annual_salary_max: 0,
    };

    const result = recoverCompensationFields(input);
    expect(result.salary_breakdown).toContain("基本給");
    expect(result.raise_info).toContain("昇給");
    expect(result.commute_allowance).toContain("通勤手当");
    expect(result.annual_salary_min).toBe(260);
    expect(result.annual_salary_max).toBe(300);
  });

  it("fills bonus and salary example from annual income notes", () => {
    const input = {
      type: "正社員",
      salary_example: "",
      bonus_info: "",
      salary_description: `年収幅は残業代を含めたものであり、スタート年収は252万円からスタートとなります。
キャリアステップアップ制度あり（最短3年で年収500万円以上も可！）
賞与あり（年2回）`,
    };

    const result = recoverCompensationFields(input);
    expect(result.bonus_info).toContain("賞与");
    expect(result.salary_example).toContain("年収");
  });
});
