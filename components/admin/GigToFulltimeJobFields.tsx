"use client";

/**
 * スキマバイトから正社員 求人専用のフォームフィールド
 * gig_to_fulltime_job_details テーブルに対応
 */

interface GigToFulltimeJobFieldsProps {
    trialPeriod: string;
    setTrialPeriod: (value: string) => void;
    gigJobUrl: string;
    setGigJobUrl: (value: string) => void;
    annualSalaryMin: string;
    setAnnualSalaryMin: (value: string) => void;
    annualSalaryMax: string;
    setAnnualSalaryMax: (value: string) => void;
    annualHolidays: string;
    setAnnualHolidays: (value: string) => void;
    probationPeriod: string;
    setProbationPeriod: (value: string) => void;
    probationDetails: string;
    setProbationDetails: (value: string) => void;
    overtimeHours: string;
    setOvertimeHours: (value: string) => void;
    smokingPolicy: string;
    setSmokingPolicy: (value: string) => void;
    appealPoints: string;
    setAppealPoints: (value: string) => void;
    welcomeRequirements: string;
    setWelcomeRequirements: (value: string) => void;
}

export default function GigToFulltimeJobFields({
    trialPeriod,
    setTrialPeriod,
    gigJobUrl,
    setGigJobUrl,
    annualSalaryMin,
    setAnnualSalaryMin,
    annualSalaryMax,
    setAnnualSalaryMax,
    annualHolidays,
    setAnnualHolidays,
    probationPeriod,
    setProbationPeriod,
    probationDetails,
    setProbationDetails,
    overtimeHours,
    setOvertimeHours,
    smokingPolicy,
    setSmokingPolicy,
    appealPoints,
    setAppealPoints,
    welcomeRequirements,
    setWelcomeRequirements,
}: GigToFulltimeJobFieldsProps) {
    const labelClass = "block text-sm font-bold text-slate-700 mb-1";
    const inputClass = "w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400";
    const textareaClass = `${inputClass} min-h-[80px] resize-y`;
    const sectionClass = "bg-white border border-slate-200 rounded-lg p-4 space-y-4";
    const sectionTitleClass = "text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3";

    return (
        <div className="space-y-4">
            {/* スキマバイト期間・リンク */}
            <div className={sectionClass}>
                <p className={sectionTitleClass}>スキマバイト情報</p>

                {/* 隠しフィールド */}
                <input type="hidden" name="gig_trial_period" value={trialPeriod} />
                <input type="hidden" name="gig_job_url" value={gigJobUrl} />
                <input type="hidden" name="gig_annual_salary_min" value={annualSalaryMin} />
                <input type="hidden" name="gig_annual_salary_max" value={annualSalaryMax} />
                <input type="hidden" name="gig_annual_holidays" value={annualHolidays} />
                <input type="hidden" name="gig_probation_period" value={probationPeriod} />
                <input type="hidden" name="gig_probation_details" value={probationDetails} />
                <input type="hidden" name="gig_overtime_hours" value={overtimeHours} />
                <input type="hidden" name="gig_smoking_policy" value={smokingPolicy} />
                <input type="hidden" name="gig_appeal_points" value={appealPoints} />
                <input type="hidden" name="gig_welcome_requirements" value={welcomeRequirements} />

                <div>
                    <label className={labelClass}>試用期間</label>
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="例: 1〜2週間"
                        value={trialPeriod}
                        onChange={(e) => setTrialPeriod(e.target.value)}
                    />
                    <p className="text-xs text-slate-400 mt-1">スキマバイトとして働く期間（正社員転換前のお試し期間）</p>
                </div>

                <div>
                    <label className={labelClass}>
                        スキマバイト求人URL <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="url"
                        className={inputClass}
                        placeholder="https://..."
                        value={gigJobUrl}
                        onChange={(e) => setGigJobUrl(e.target.value)}
                    />
                    <p className="text-xs text-slate-400 mt-1">「応募する」ボタンがこのURLに遷移します</p>
                </div>
            </div>

            {/* 転換後の給与・待遇 */}
            <div className={sectionClass}>
                <p className={sectionTitleClass}>正社員転換後の条件</p>

                <div>
                    <label className={labelClass}>年収（転換後）</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            className="w-32 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                            placeholder="300"
                            value={annualSalaryMin}
                            onChange={(e) => setAnnualSalaryMin(e.target.value)}
                        />
                        <span className="text-slate-500 text-sm">〜</span>
                        <input
                            type="number"
                            className="w-32 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                            placeholder="500"
                            value={annualSalaryMax}
                            onChange={(e) => setAnnualSalaryMax(e.target.value)}
                        />
                        <span className="text-slate-500 text-sm">万円</span>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>年間休日（転換後）</label>
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="例: 120日"
                        value={annualHolidays}
                        onChange={(e) => setAnnualHolidays(e.target.value)}
                    />
                </div>

                <div>
                    <label className={labelClass}>残業時間（転換後）</label>
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="例: 月平均20時間"
                        value={overtimeHours}
                        onChange={(e) => setOvertimeHours(e.target.value)}
                    />
                </div>

                <div>
                    <label className={labelClass}>転換後の試用期間</label>
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="例: 3ヶ月"
                        value={probationPeriod}
                        onChange={(e) => setProbationPeriod(e.target.value)}
                    />
                </div>

                <div>
                    <label className={labelClass}>試用期間の詳細</label>
                    <textarea
                        className={textareaClass}
                        placeholder="例: 試用期間中も給与・待遇に変更はありません"
                        value={probationDetails}
                        onChange={(e) => setProbationDetails(e.target.value)}
                    />
                </div>

                <div>
                    <label className={labelClass}>受動喫煙対策</label>
                    <input
                        type="text"
                        className={inputClass}
                        placeholder="例: 屋内原則禁煙"
                        value={smokingPolicy}
                        onChange={(e) => setSmokingPolicy(e.target.value)}
                    />
                </div>
            </div>

            {/* 訴求ポイント */}
            <div className={sectionClass}>
                <p className={sectionTitleClass}>訴求ポイント</p>

                <div>
                    <label className={labelClass}>仕事の魅力・やりがい</label>
                    <textarea
                        className={textareaClass}
                        placeholder="このポジションの魅力を記入してください"
                        value={appealPoints}
                        onChange={(e) => setAppealPoints(e.target.value)}
                    />
                </div>

                <div>
                    <label className={labelClass}>歓迎要件</label>
                    <textarea
                        className={textareaClass}
                        placeholder="歓迎するスキル・経験を記入してください"
                        value={welcomeRequirements}
                        onChange={(e) => setWelcomeRequirements(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
