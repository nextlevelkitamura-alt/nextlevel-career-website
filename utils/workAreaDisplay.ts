const PRIORITY_PREFECTURES = ["東京都", "大阪府", "神奈川県", "埼玉県", "千葉県"] as const;

const ALL_PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
] as const;

const PREFECTURE_ALIAS_MAP: Record<string, string> = {
  東京: "東京都",
  東京都: "東京都",
  大阪: "大阪府",
  大阪府: "大阪府",
  神奈川: "神奈川県",
  神奈川県: "神奈川県",
  埼玉: "埼玉県",
  埼玉県: "埼玉県",
  千葉: "千葉県",
  千葉県: "千葉県",
  北海道: "北海道",
  京都: "京都府",
  京都府: "京都府",
  兵庫: "兵庫県",
  兵庫県: "兵庫県",
  愛知: "愛知県",
  愛知県: "愛知県",
  福岡: "福岡県",
  福岡県: "福岡県",
  沖縄: "沖縄県",
  沖縄県: "沖縄県",
};

const JAPANESE_COLLATOR = new Intl.Collator("ja");

export type WorkAreaItem =
  | string
  | {
      prefecture?: string | null;
      city?: string | null;
      station?: string | null;
      area?: string | null;
    }
  | null
  | undefined;

function sanitizeText(value: string): string {
  return value
    .replace(/\u3000/g, " ")
    .replace(/都道府県\s*[:：]/g, "")
    .replace(/エリア/g, "")
    .trim();
}

function normalizeFromCandidate(value: string): string | null {
  const candidate = sanitizeText(value);
  if (!candidate) return null;

  if (PREFECTURE_ALIAS_MAP[candidate]) {
    return PREFECTURE_ALIAS_MAP[candidate];
  }

  if (/^[^\s]+[都道府県]$/.test(candidate) && ALL_PREFECTURES.includes(candidate as (typeof ALL_PREFECTURES)[number])) {
    return candidate;
  }

  return null;
}

export function normalizePrefecture(value: string | null | undefined): string | null {
  if (!value) return null;
  const text = sanitizeText(value);
  if (!text) return null;

  const direct = normalizeFromCandidate(text);
  if (direct) return direct;

  for (const pref of ALL_PREFECTURES) {
    if (text.startsWith(pref)) return pref;
  }

  const aliasEntries = Object.entries(PREFECTURE_ALIAS_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [alias, canonical] of aliasEntries) {
    if (text.startsWith(alias)) return canonical;
  }

  const tokens = text.split(/[\s/／|｜,、・＞>→\-]+/).filter(Boolean);
  for (const token of tokens) {
    const normalized = normalizeFromCandidate(token);
    if (normalized) return normalized;
  }

  return null;
}

function extractPrefectureFromWorkArea(item: WorkAreaItem): string | null {
  if (!item) return null;

  if (typeof item === "string") {
    return normalizePrefecture(item);
  }

  return (
    normalizePrefecture(item.prefecture) ||
    normalizePrefecture(item.area) ||
    normalizePrefecture(item.city) ||
    normalizePrefecture(item.station)
  );
}

export function getDisplayAreaPrefectures(workAreas: WorkAreaItem[]): string[] {
  if (!Array.isArray(workAreas) || workAreas.length === 0) return [];
  
  const uniquePrefectures = Array.from(
    new Set(
      workAreas
        .map(extractPrefectureFromWorkArea)
        .filter((prefecture): prefecture is string => Boolean(prefecture))
    )
  );

  if (uniquePrefectures.length === 0) return [];

  const priorityIndex = new Map(PRIORITY_PREFECTURES.map((prefecture, index) => [prefecture, index]));

  return [...uniquePrefectures].sort((a, b) => {
    const aPriority = priorityIndex.get(a);
    const bPriority = priorityIndex.get(b);

    if (aPriority !== undefined && bPriority !== undefined) return aPriority - bPriority;
    if (aPriority !== undefined) return -1;
    if (bPriority !== undefined) return 1;

    return JAPANESE_COLLATOR.compare(a, b);
  });
}

export function buildDisplayAreaText(workAreas: WorkAreaItem[], maxDisplayCount = 3): string {
  if (!Array.isArray(workAreas) || workAreas.length === 0) return "";

  const sortedPrefectures = getDisplayAreaPrefectures(workAreas);
  if (sortedPrefectures.length === 0) return "";

  const safeMaxDisplayCount = Math.max(1, Math.floor(maxDisplayCount));
  const displayPrefectures = sortedPrefectures.slice(0, safeMaxDisplayCount);
  const hiddenCount = sortedPrefectures.length - displayPrefectures.length;
  const baseText = displayPrefectures.join(" / ");

  return hiddenCount > 0 ? `${baseText} 他${hiddenCount}` : baseText;
}
