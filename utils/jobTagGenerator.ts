import { Job } from "@/app/jobs/jobsData";

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
    const holidays = job.fulltime_job_details?.annual_holidays;
    if (holidays && holidays >= 120) {
        tags.push("年間休日120日以上");
    }

    // 週4日OK（派遣）
    if (job.dispatch_job_details?.work_days_per_week?.includes("週4")) {
        tags.push("週4日OK");
    }

    // 駅チカ
    if (job.nearest_station?.includes("徒歩") && /徒歩[1-5]分/.test(job.nearest_station)) {
        tags.push("駅チカ");
    }

    return tags;
}

/**
 * 既存タグと自動生成タグを統合（重複除去）
 */
export function mergeJobTags(job: Job): string[] {
    const existingTags = job.tags || [];
    const autoTags = generateAutoTags(job);

    const merged = [...existingTags];
    for (const tag of autoTags) {
        if (!merged.includes(tag)) {
            merged.push(tag);
        }
    }
    return merged;
}
