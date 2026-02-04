// Standardized Master Data for Job Inputs (Version 2 - Hierarchical Structure)
// Used by AI extraction and Manual Input to ensure consistency
//
// Migration Notes:
// - This is a reorganization of the original flat structure into 5 main categories
// - Each main category has sub-categories for better organization
// - Original categories are preserved in legacy_category for backward compatibility

export const JOB_MASTERS_V2 = {
    // ==========================================
    // 1. work_conditions: 勤務条件（働き方に関する条件）
    // ==========================================
    work_conditions: {
        // 元: tags
        勤務地: [
            "駅チカ・駅ナカ",
            "車通勤OK",
            "転勤なし"
        ],
        // 元: tags + benefits (リモートワーク可)
        勤務時間: [
            "残業なし",
            "残業少なめ",
            "週3日からOK",
            "週4日からOK"
        ],
        // 元: tags + benefits
        働き方: [
            "リモートワーク可",  // 元: benefits
            "服装自由",  // 元: benefits
            "シフト制",  // 元: holidays
            "完全シフト制",  // 元: holidays
            "平日休み",  // 元: holidays
            "土日祝のみOK"  // 元: tags
        ]
    },

    // ==========================================
    // 2. holidays: 休日・休暇
    // ==========================================
    holidays: {
        // 元: holidays
        週休制度: [
            "完全週休2日制",
            "週休2日制",
            "土日祝休み"
        ],
        // 元: holidays
        年間休日: [
            "年間休日120日以上"
        ],
        // 元: holidays + tags (長期休暇あり)
        長期休暇: [
            "長期休暇あり",  // 元: tags
            "夏季休暇",
            "年末年始休暇",
            "GW休暇"
        ],
        // 元: holidays
        その他休暇: [
            "有給休暇",
            "慶弔休暇",
            "産前産後休暇",
            "育児休暇"
        ]
    },

    // ==========================================
    // 3. compensation: 給与・待遇
    // ==========================================
    compensation: {
        // 元: benefits
        給与体系: [
            "賞与あり",
            "昇給あり"
        ],
        // 元: benefits
        手当: [
            "交通費全額支給",
            "交通費規定支給",
            "残業代全額支給",
            "住宅手当",
            "家族手当"
        ],
        // 元: benefits
        福利厚生: [
            "社会保険完備",
            "退職金制度",
            "寮・社宅あり",
            "PC貸与"
        ],
        // 元: benefits
        キャリア: [
            "研修制度あり",
            "資格取得支援",
            "社員登用あり"
        ]
    },

    // ==========================================
    // 4. requirements: 応募条件
    // ==========================================
    requirements: {
        // 元: requirements
        経験: [
            "未経験OK",
            "経験者優遇",
            "ブランクOK"
        ],
        // 元: requirements
        学歴: [
            "学歴不問",
            "大卒以上"
        ],
        // 元: requirements
        対象者: [
            "第二新卒歓迎",
            "フリーター歓迎",
            "主婦(夫)活躍中",
            "20代活躍中",
            "30代活躍中"
        ],
        // 元: requirements
        スキル: [
            "PCスキル（基本操作）",
            "Excelスキル",
            "英語力不問"
        ]
    },

    // ==========================================
    // 5. recruitment_info: 募集情報
    // ==========================================
    recruitment_info: {
        // 元: tags
        緊急度: [
            "急募",
            "大量募集"
        ],
        // 元: tags
        企業タイプ: [
            "外資系企業",
            "大手企業",
            "ベンチャー企業"
        ],
        // 元: tags
        その他: [
            "オープニングスタッフ"
        ]
    }
} as const;

// ==========================================
// Type Definitions
// ==========================================

export type MainCategory = keyof typeof JOB_MASTERS_V2;

export type SubCategory<T extends MainCategory> = keyof typeof JOB_MASTERS_V2[T];

export type MasterCategory = {
    main: MainCategory;
    sub?: string;
};

// ==========================================
// Helper Functions
// ==========================================

/**
 * Get flat list of labels for a main category
 * @param mainCategory - Main category (e.g., 'work_conditions')
 * @param subCategory - Optional sub category (e.g., '勤務地')
 * @returns Array of label strings
 */
export function getFlatMasterList(
    mainCategory: MainCategory,
    subCategory?: string
): string[] {
    const category = JOB_MASTERS_V2[mainCategory];

    if (!category || typeof category !== 'object') {
        return [];
    }

    if (subCategory && subCategory in category) {
        return category[subCategory as keyof typeof category] || [];
    }

    // No sub category specified - return all labels in this main category
    return Object.values(category).flat();
}

/**
 * Get all master options as a flat array with metadata
 * @returns Array of { mainCategory, subCategory, label }
 */
export function getAllMasterOptions() {
    const result: {
        mainCategory: MainCategory;
        subCategory: string;
        label: string;
    }[] = [];

    for (const [mainCat, subCats] of Object.entries(JOB_MASTERS_V2)) {
        for (const [subCat, labels] of Object.entries(subCats)) {
            for (const label of labels) {
                result.push({
                    mainCategory: mainCat as MainCategory,
                    subCategory: subCat,
                    label
                });
            }
        }
    }

    return result;
}

/**
 * Get legacy category mapping for backward compatibility
 * @param mainCategory - New main category
 * @returns Legacy category name
 */
export function getLegacyCategory(mainCategory: MainCategory): string {
    const mapping: Record<MainCategory, string> = {
        work_conditions: 'tags',  // Mixed from tags and benefits
        holidays: 'holidays',
        compensation: 'benefits',
        requirements: 'requirements',
        recruitment_info: 'tags'
    };

    return mapping[mainCategory] || 'tags';
}

/**
 * Find which main/sub category a label belongs to
 * @param label - Label to search for
 * @returns Category info or null if not found
 */
export function findCategoryByLabel(label: string): MasterCategory | null {
    for (const [mainCat, subCats] of Object.entries(JOB_MASTERS_V2)) {
        for (const [subCat, labels] of Object.entries(subCats)) {
            if (labels.includes(label)) {
                return {
                    main: mainCat as MainCategory,
                    sub: subCat
                };
            }
        }
    }

    return null;
}

// ==========================================
// Migration Mapping (for database migration)
// ==========================================

/**
 * Mapping for migrating existing job_options data to new structure
 * This maps legacy category + label to new main_category + sub_category
 */
export const MIGRATION_MAPPING: Record<
    string,  // legacy category
    Record<string, { main: string; sub: string }>  // label -> { main, sub }
> = {
    holidays: {
        "完全週休2日制": { main: "holidays", sub: "週休制度" },
        "週休2日制": { main: "holidays", sub: "週休制度" },
        "土日祝休み": { main: "holidays", sub: "週休制度" },
        "シフト制": { main: "work_conditions", sub: "働き方" },
        "完全シフト制": { main: "work_conditions", sub: "働き方" },
        "平日休み": { main: "work_conditions", sub: "働き方" },
        "年間休日120日以上": { main: "holidays", sub: "年間休日" },
        "夏季休暇": { main: "holidays", sub: "長期休暇" },
        "年末年始休暇": { main: "holidays", sub: "長期休暇" },
        "GW休暇": { main: "holidays", sub: "長期休暇" },
        "有給休暇": { main: "holidays", sub: "その他休暇" },
        "慶弔休暇": { main: "holidays", sub: "その他休暇" },
        "産前産後休暇": { main: "holidays", sub: "その他休暇" },
        "育児休暇": { main: "holidays", sub: "その他休暇" }
    },
    benefits: {
        "社会保険完備": { main: "compensation", sub: "福利厚生" },
        "交通費全額支給": { main: "compensation", sub: "手当" },
        "交通費規定支給": { main: "compensation", sub: "手当" },
        "残業代全額支給": { main: "compensation", sub: "手当" },
        "賞与あり": { main: "compensation", sub: "給与体系" },
        "昇給あり": { main: "compensation", sub: "給与体系" },
        "研修制度あり": { main: "compensation", sub: "キャリア" },
        "資格取得支援": { main: "compensation", sub: "キャリア" },
        "寮・社宅あり": { main: "compensation", sub: "福利厚生" },
        "住宅手当": { main: "compensation", sub: "手当" },
        "家族手当": { main: "compensation", sub: "手当" },
        "退職金制度": { main: "compensation", sub: "福利厚生" },
        "PC貸与": { main: "compensation", sub: "福利厚生" },
        "社員登用あり": { main: "compensation", sub: "キャリア" },
        "服装自由": { main: "work_conditions", sub: "働き方" },
        "リモートワーク可": { main: "work_conditions", sub: "働き方" }
    },
    requirements: {
        "未経験OK": { main: "requirements", sub: "経験" },
        "経験者優遇": { main: "requirements", sub: "経験" },
        "学歴不問": { main: "requirements", sub: "学歴" },
        "大卒以上": { main: "requirements", sub: "学歴" },
        "第二新卒歓迎": { main: "requirements", sub: "対象者" },
        "ブランクOK": { main: "requirements", sub: "経験" },
        "フリーター歓迎": { main: "requirements", sub: "対象者" },
        "主婦(夫)活躍中": { main: "requirements", sub: "対象者" },
        "20代活躍中": { main: "requirements", sub: "対象者" },
        "30代活躍中": { main: "requirements", sub: "対象者" },
        "PCスキル（基本操作）": { main: "requirements", sub: "スキル" },
        "Excelスキル": { main: "requirements", sub: "スキル" },
        "英語力不問": { main: "requirements", sub: "スキル" }
    },
    tags: {
        "急募": { main: "recruitment_info", sub: "緊急度" },
        "大量募集": { main: "recruitment_info", sub: "緊急度" },
        "駅チカ・駅ナカ": { main: "work_conditions", sub: "勤務地" },
        "車通勤OK": { main: "work_conditions", sub: "勤務地" },
        "転勤なし": { main: "work_conditions", sub: "勤務地" },
        "残業なし": { main: "work_conditions", sub: "勤務時間" },
        "残業少なめ": { main: "work_conditions", sub: "勤務時間" },
        "長期休暇あり": { main: "holidays", sub: "長期休暇" },
        "オープニングスタッフ": { main: "recruitment_info", sub: "その他" },
        "外資系企業": { main: "recruitment_info", sub: "企業タイプ" },
        "大手企業": { main: "recruitment_info", sub: "企業タイプ" },
        "ベンチャー企業": { main: "recruitment_info", sub: "企業タイプ" },
        "週3日からOK": { main: "work_conditions", sub: "勤務時間" },
        "週4日からOK": { main: "work_conditions", sub: "勤務時間" },
        "土日祝のみOK": { main: "work_conditions", sub: "働き方" }
    }
};

// Export original flat structure for backward compatibility
export const JOB_MASTERS_FLAT = {
    holidays: getFlatMasterList('holidays'),
    benefits: getFlatMasterList('compensation'),
    requirements: getFlatMasterList('requirements'),
    tags: [
        ...getFlatMasterList('work_conditions'),
        ...getFlatMasterList('recruitment_info')
    ]
} as const;
