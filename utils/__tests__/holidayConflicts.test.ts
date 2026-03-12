import { describe, expect, it } from "@jest/globals";
import { findHolidayConflicts, sanitizeHolidayTags } from "@/utils/holidayConflicts";

describe("holidayConflicts", () => {
    it("detects conflicts between fixed holidays and shift work", () => {
        const conflicts = findHolidayConflicts(["土日祝休み", "シフト制"]);

        expect(conflicts).toHaveLength(1);
        expect(conflicts[0]?.reason).toContain("固定休み");
    });

    it("keeps the first holiday tag and removes later conflicting ones", () => {
        const result = sanitizeHolidayTags(["土日祝休み", "シフト制", "夏季休暇"]);

        expect(result.sanitized).toEqual(["土日祝休み", "夏季休暇"]);
        expect(result.conflicts).toHaveLength(1);
    });

    it("allows non-conflicting combinations", () => {
        const result = sanitizeHolidayTags(["土日祝休み", "夏季休暇", "有給休暇"]);

        expect(result.sanitized).toEqual(["土日祝休み", "夏季休暇", "有給休暇"]);
        expect(result.conflicts).toHaveLength(0);
    });
});
