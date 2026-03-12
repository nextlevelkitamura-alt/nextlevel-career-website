export interface HolidayConflict {
    existing: string;
    incoming: string;
    reason: string;
}

interface ConflictRule {
    left: RegExp[];
    right: RegExp[];
    reason: string;
}

const HOLIDAY_CONFLICT_RULES: ConflictRule[] = [
    {
        left: [/土日祝休み/, /土日休み/],
        right: [/シフト制/],
        reason: "固定休みとシフト制は同時に成立しにくい組み合わせです",
    },
    {
        left: [/土日祝休み/, /土日休み/],
        right: [/平日休み/],
        reason: "土日固定休みと平日休みは同時に成立しにくい組み合わせです",
    },
];

function matchesAnyPattern(value: string, patterns: RegExp[]): boolean {
    return patterns.some((pattern) => pattern.test(value));
}

function getConflictPair(a: string, b: string): HolidayConflict | null {
    for (const rule of HOLIDAY_CONFLICT_RULES) {
        const aIsLeft = matchesAnyPattern(a, rule.left);
        const aIsRight = matchesAnyPattern(a, rule.right);
        const bIsLeft = matchesAnyPattern(b, rule.left);
        const bIsRight = matchesAnyPattern(b, rule.right);

        if ((aIsLeft && bIsRight) || (aIsRight && bIsLeft)) {
            return {
                existing: a,
                incoming: b,
                reason: rule.reason,
            };
        }
    }

    return null;
}

export function findHolidayConflicts(tags: string[]): HolidayConflict[] {
    const normalized = tags.map((tag) => tag.trim()).filter(Boolean);
    const conflicts: HolidayConflict[] = [];

    for (let i = 0; i < normalized.length; i += 1) {
        for (let j = i + 1; j < normalized.length; j += 1) {
            const conflict = getConflictPair(normalized[i], normalized[j]);
            if (conflict) conflicts.push(conflict);
        }
    }

    return conflicts;
}

export function sanitizeHolidayTags(tags: string[]): {
    sanitized: string[];
    conflicts: HolidayConflict[];
} {
    const sanitized: string[] = [];
    const conflicts: HolidayConflict[] = [];

    for (const tag of tags.map((item) => item.trim()).filter(Boolean)) {
        const duplicate = sanitized.includes(tag);
        if (duplicate) continue;

        const conflict = sanitized
            .map((existing) => getConflictPair(existing, tag))
            .find((result): result is HolidayConflict => Boolean(result));

        if (conflict) {
            conflicts.push(conflict);
            continue;
        }

        sanitized.push(tag);
    }

    return { sanitized, conflicts };
}
