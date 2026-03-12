import { Job } from "@/app/jobs/jobsData";
import { JOB_MASTERS } from "@/app/constants/jobMasters";

/**
 * 求人データから自動的に訴求タグを生成する
 */
export function generateAutoTags(job: Job): string[] {
    const tags: string[] = [];

    // 交通費
    if (job.commute_allowance?.includes("全額")) {
        tags.push("交通費全額支給");
    } else if (job.commute_allowance && job.commute_allowance !== "なし") {
        tags.push("交通費支給");
    }

    // 残業
    const overtime = job.fulltime_job_details?.overtime_hours;
    if (overtime && (overtime.includes("なし") || overtime === "0")) {
        tags.push("残業なし");
    }

    // 即日スタート
    if (job.start_date?.includes("即日")) {
        tags.push("即日スタート");
    }

    // 服装
    if (job.attire?.includes("自由") || job.attire_type?.includes("自由")) {
        tags.push("服装自由");
    }

    // 髪型
    if (job.hair_style?.includes("自由")) {
        tags.push("髪型自由");
    }

    // ネイル（派遣）
    if (job.dispatch_job_details?.nail_policy?.includes("OK")) {
        tags.push("ネイルOK");
    }

    // 未経験OK
    if (job.requirements?.includes("未経験")) {
        tags.push("未経験OK");
    }

    // 年間休日（正社員）
    const holidaysRaw = job.fulltime_job_details?.annual_holidays;
    const holidaysNum = holidaysRaw ? parseInt(String(holidaysRaw), 10) : NaN;
    if (!isNaN(holidaysNum) && holidaysNum >= 120) {
        tags.push("年間休日120日以上");
    }

    // 週4日OK（派遣）
    if (job.dispatch_job_details?.work_days_per_week?.includes("週4")) {
        tags.push("週4日OK");
    }

    // 駅チカ（推定駅の場合は付与しない）
    if (
        job.nearest_station?.includes("徒歩") &&
        /徒歩[1-5]分/.test(job.nearest_station) &&
        !job.nearest_station_is_estimated
    ) {
        tags.push("駅チカ");
    }

    return tags;
}

// 類似タグの正規化マップ
// 注意: 意味が変わる変換は禁止（「残業なし」→「残業少なめ」等は虚偽になる）
const TAG_NORMALIZE_MAP: Record<string, string> = {
    "未経験歓迎": "未経験OK",
    "経験不問": "未経験OK",
    "未経験者歓迎": "未経験OK",
    "駅チカ": "駅近",
    "駅徒歩5分以内": "駅近",
    "土日休み": "土日祝休み",
    "土日祝日休み": "土日祝休み",
    "残業ほぼなし": "残業少なめ",
    "在宅勤務": "リモートワーク",
    "テレワーク": "リモートワーク",
    "フルリモート": "リモートワーク",
    "在宅OK": "リモートワーク",
    "服装自由": "私服OK",
    "正社員登用": "正社員登用あり",
};

function normalizeTag(tag: string): string {
    return TAG_NORMALIZE_MAP[tag] || tag;
}

// 訴求タグとして表示を許可するホワイトリスト
// JOB_MASTERS.tags + TAG_NORMALIZE_MAPの値 + generateAutoTagsが生成するタグ
const DISPLAY_TAGS_WHITELIST = new Set<string>([
    ...JOB_MASTERS.tags,
    ...Object.values(TAG_NORMALIZE_MAP),
    // generateAutoTagsが生成するタグ
    "交通費全額支給", "交通費支給", "即日スタート", "服装自由",
    "髪型自由", "ネイルOK", "未経験OK", "年間休日120日以上",
    "週4日OK", "駅チカ", "残業なし",
]);

/**
 * 既存タグと自動生成タグを統合（正規化＋重複除去）
 * - DB保存タグがある場合: フォームで管理者がキュレート済み → そのまま使用
 * - DB保存タグが空の場合: 従来互換で自動生成タグを付与
 */
export function mergeJobTags(job: Job): string[] {
    const existingTags = job.tags || [];

    // DB にタグが保存されている場合はキュレート済み → 正規化+重複除去のみ
    if (existingTags.length > 0) {
        const seen = new Set<string>();
        const result: string[] = [];
        for (const tag of existingTags) {
            const normalized = normalizeTag(tag);
            if (!seen.has(normalized)) {
                seen.add(normalized);
                result.push(normalized);
            }
        }
        return result;
    }

    // DB タグが空の場合は従来通り自動生成（既存データ互換）
    const autoTags = generateAutoTags(job);
    return autoTags.filter(tag => {
        const normalized = normalizeTag(tag);
        return DISPLAY_TAGS_WHITELIST.has(normalized);
    });
}
