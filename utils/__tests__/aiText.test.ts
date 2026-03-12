import { describe, expect, it } from "@jest/globals";
import { normalizeGeneratedJobField, normalizeGeneratedJobText } from "@/utils/aiText";

describe("normalizeGeneratedJobText", () => {
    it("converts escaped newlines into real line breaks", () => {
        expect(normalizeGeneratedJobText("電話受付\\n・保険金お支払い対応\\n・事務処理"))
            .toBe("電話受付\n・保険金お支払い対応\n・事務処理");
    });

    it("places square bullets on their own lines", () => {
        expect(normalizeGeneratedJobText("お任せします。 ■主な業務内容 ■電話受付"))
            .toBe("お任せします。\n・ 主な業務内容\n・ 電話受付");
    });
});

describe("normalizeGeneratedJobField", () => {
    it("normalizes multiline job fields", () => {
        expect(normalizeGeneratedJobField("description", "業務内容\\n・問い合わせ対応"))
            .toBe("業務内容\n・問い合わせ対応");
    });

    it("keeps single-line fields trimmed only", () => {
        expect(normalizeGeneratedJobField("title", "  テスト求人  "))
            .toBe("テスト求人");
    });
});
