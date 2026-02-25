export const CANONICAL_JOB_CATEGORIES = [
    "事務",
    "営業",
    "コールセンター",
    "IT・エンジニア",
    "クリエイティブ",
    "販売・接客",
    "製造・軽作業",
    "医療・介護",
    "リモート",
    "その他",
] as const;

export type CanonicalJobCategory = typeof CANONICAL_JOB_CATEGORIES[number];

const CATEGORY_ALIAS_MAP: Record<string, CanonicalJobCategory> = {
    "事務職": "事務",
    "バックオフィス": "事務",
    "営業職": "営業",
    "セールス": "営業",
    "コールセンター職": "コールセンター",
    "it": "IT・エンジニア",
    "itエンジニア": "IT・エンジニア",
    "エンジニア": "IT・エンジニア",
    "販売": "販売・接客",
    "接客": "販売・接客",
    "サービス": "販売・接客",
    "製造": "製造・軽作業",
    "軽作業": "製造・軽作業",
    "医療": "医療・介護",
    "介護": "医療・介護",
    "在宅": "リモート",
};

const CATEGORY_KEYWORDS: Record<CanonicalJobCategory, string[]> = {
    "事務": ["事務", "営業事務", "一般事務", "経理", "総務", "人事", "労務", "データ入力", "バックオフィス", "秘書", "受付"],
    "営業": ["営業", "法人営業", "個人営業", "ルート営業", "インサイドセールス", "フィールドセールス", "アカウント", "セールス"],
    "コールセンター": ["コールセンター", "テレオペ", "受電", "発信", "問い合わせ対応", "コンタクトセンター", "カスタマーサポート"],
    "IT・エンジニア": ["it", "エンジニア", "プログラマ", "プログラマー", "システム", "開発", "インフラ", "ネットワーク", "社内se", "se", "sre", "ヘルプデスク"],
    "クリエイティブ": ["クリエイティブ", "デザイナー", "webデザイナー", "ui", "ux", "動画編集", "ライター", "ディレクター", "illustrator", "photoshop"],
    "販売・接客": ["販売", "接客", "店舗", "ショップ", "アパレル", "レジ", "ホール", "サービススタッフ", "カウンセラー"],
    "製造・軽作業": ["製造", "軽作業", "工場", "ライン", "倉庫", "検品", "梱包", "仕分け", "ピッキング", "物流", "フォークリフト"],
    "医療・介護": ["医療", "介護", "看護", "看護師", "准看護師", "クリニック", "病院", "ケア", "ヘルパー", "医療事務", "歯科", "薬局"],
    "リモート": ["リモート", "在宅", "テレワーク", "フルリモート"],
    "その他": [],
};

function normalizeText(input: string): string {
    return input.trim().toLowerCase().replace(/\s+/g, " ");
}

function canonicalFromRaw(raw?: string | null): CanonicalJobCategory | null {
    if (!raw) return null;
    const normalized = normalizeText(raw);
    const direct = CANONICAL_JOB_CATEGORIES.find((c) => normalizeText(c) === normalized);
    if (direct) return direct;
    return CATEGORY_ALIAS_MAP[normalized] ?? null;
}

export function inferJobCategoryCandidates(input: {
    category?: string | null;
    jobCategoryDetail?: string | null;
    title?: string | null;
    description?: string | null;
    tags?: string[] | null;
}): CanonicalJobCategory[] {
    const candidates: CanonicalJobCategory[] = [];
    const rawCategory = canonicalFromRaw(input.category);
    if (rawCategory && rawCategory !== "その他") {
        candidates.push(rawCategory);
    }

    const sourceText = normalizeText([
        input.jobCategoryDetail ?? "",
        input.title ?? "",
        input.description ?? "",
        ...(input.tags ?? []),
    ].join(" "));

    for (const category of CANONICAL_JOB_CATEGORIES) {
        if (category === "その他") continue;
        const keywords = CATEGORY_KEYWORDS[category];
        if (keywords.some((keyword) => sourceText.includes(normalizeText(keyword)))) {
            if (!candidates.includes(category)) {
                candidates.push(category);
            }
        }
    }

    if (candidates.length === 0) {
        return [rawCategory ?? "その他"];
    }
    return candidates;
}

export function derivePrimaryJobCategory(input: {
    category?: string | null;
    jobCategoryDetail?: string | null;
    title?: string | null;
    description?: string | null;
    tags?: string[] | null;
}): CanonicalJobCategory {
    const rawCategory = canonicalFromRaw(input.category);
    if (rawCategory && rawCategory !== "その他") {
        return rawCategory;
    }

    const candidates = inferJobCategoryCandidates(input);
    if (candidates.length === 1) {
        return candidates[0];
    }

    const sourceText = normalizeText([
        input.jobCategoryDetail ?? "",
        input.title ?? "",
        input.description ?? "",
        ...(input.tags ?? []),
    ].join(" "));

    let best: CanonicalJobCategory = candidates[0] ?? "その他";
    let bestScore = -1;
    for (const category of candidates) {
        const keywords = CATEGORY_KEYWORDS[category];
        const score = keywords.reduce((sum, keyword) => (
            sourceText.includes(normalizeText(keyword)) ? sum + 1 : sum
        ), 0);
        if (score > bestScore) {
            best = category;
            bestScore = score;
        }
    }
    return best;
}
