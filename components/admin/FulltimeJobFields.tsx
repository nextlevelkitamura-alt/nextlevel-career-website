"use client";

/**
 * 正社員求人専用のフォームフィールド
 * fulltime_job_details テーブルに対応
 */

interface FulltimeJobFieldsProps {
    // 正社員専用フィールド
    companyName: string;
    setCompanyName: (value: string) => void;
    isCompanyNamePublic: boolean;
    setIsCompanyNamePublic: (value: boolean) => void;
    companyAddress: string;
    setCompanyAddress: (value: string) => void;
    industry: string;
    setIndustry: (value: string) => void;
    companySize: string;
    setCompanySize: (value: string) => void;
    establishedDate: string;
    setEstablishedDate: (value: string) => void;
    companyOverview: string;
    setCompanyOverview: (value: string) => void;
    businessOverview: string;
    setBusinessOverview: (value: string) => void;
    annualSalaryMin: string;
    setAnnualSalaryMin: (value: string) => void;
    annualSalaryMax: string;
    setAnnualSalaryMax: (value: string) => void;
    overtimeHours: string;
    setOvertimeHours: (value: string) => void;
    annualHolidays: string;
    setAnnualHolidays: (value: string) => void;
    probationPeriod: string;
    setProbationPeriod: (value: string) => void;
    probationDetails: string;
    setProbationDetails: (value: string) => void;
    partTimeAvailable: boolean;
    setPartTimeAvailable: (value: boolean) => void;
    smokingPolicy: string;
    setSmokingPolicy: (value: string) => void;
    appealPoints: string;
    setAppealPoints: (value: string) => void;
    welcomeRequirements: string;
    setWelcomeRequirements: (value: string) => void;
    departmentDetails: string;
    setDepartmentDetails: (value: string) => void;
}

export default function FulltimeJobFields({
    companyName,
    setCompanyName,
    isCompanyNamePublic,
    setIsCompanyNamePublic,
    companyAddress,
    setCompanyAddress,
    industry,
    setIndustry,
    companySize,
    setCompanySize,
    establishedDate,
    setEstablishedDate,
    companyOverview,
    setCompanyOverview,
    businessOverview,
    setBusinessOverview,
    annualSalaryMin,
    setAnnualSalaryMin,
    annualSalaryMax,
    setAnnualSalaryMax,
    overtimeHours,
    setOvertimeHours,
    annualHolidays,
    setAnnualHolidays,
    probationPeriod,
    setProbationPeriod,
    probationDetails,
    setProbationDetails,
    partTimeAvailable,
    setPartTimeAvailable,
    smokingPolicy,
    setSmokingPolicy,
    appealPoints,
    setAppealPoints,
    welcomeRequirements,
    setWelcomeRequirements,
    departmentDetails,
    setDepartmentDetails,
}: FulltimeJobFieldsProps) {
    return (
        <div className="space-y-6 pt-6 border-t border-slate-100">
            <h4 className="font-bold text-md text-slate-800">正社員求人専用情報</h4>

            {/* 企業名 */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">企業名</label>
                <input
                    name="company_name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="例：株式会社○○"
                />
                <div className="flex items-center gap-2 mt-2">
                    <input
                        type="checkbox"
                        id="is_company_name_public"
                        name="is_company_name_public"
                        checked={isCompanyNamePublic}
                        onChange={(e) => setIsCompanyNamePublic(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="is_company_name_public" className="text-sm text-slate-600">
                        企業名を求職者に公開する
                    </label>
                </div>
                <p className="text-xs text-slate-500">
                    ※チェックを外すと「大手メーカー」等の表現で代替表示されます
                </p>
            </div>

            {/* 企業基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">業界</label>
                    <input
                        name="industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：IT・情報通信"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">従業員数</label>
                    <input
                        name="company_size"
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：300名"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">設立年月日</label>
                    <input
                        name="established_date"
                        value={establishedDate}
                        onChange={(e) => setEstablishedDate(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：2000年4月"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">企業所在地</label>
                    <input
                        name="company_address"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：東京都港区六本木1-1-1"
                    />
                </div>
            </div>

            {/* 企業概要 */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">企業概要</label>
                <textarea
                    name="company_overview"
                    value={companyOverview}
                    onChange={(e) => setCompanyOverview(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="企業の特徴や強みを記入してください"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">事業内容</label>
                <textarea
                    name="business_overview"
                    value={businessOverview}
                    onChange={(e) => setBusinessOverview(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="主な事業内容を記入してください"
                />
            </div>

            {/* 給与・勤務条件 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">年収（最低）</label>
                    <input
                        type="number"
                        name="annual_salary_min"
                        value={annualSalaryMin}
                        onChange={(e) => setAnnualSalaryMin(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：3000000"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">年収（最高）</label>
                    <input
                        type="number"
                        name="annual_salary_max"
                        value={annualSalaryMax}
                        onChange={(e) => setAnnualSalaryMax(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：5000000"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">残業時間</label>
                    <input
                        name="overtime_hours"
                        value={overtimeHours}
                        onChange={(e) => setOvertimeHours(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：月平均20時間"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">年間休日日数</label>
                    <input
                        type="number"
                        name="annual_holidays"
                        value={annualHolidays}
                        onChange={(e) => setAnnualHolidays(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：120"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">喫煙環境</label>
                    <select
                        name="smoking_policy"
                        value={smokingPolicy}
                        onChange={(e) => setSmokingPolicy(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                        <option value="">選択してください</option>
                        <option value="完全禁煙">完全禁煙</option>
                        <option value="分煙">分煙</option>
                        <option value="喫煙可">喫煙可</option>
                    </select>
                </div>
            </div>

            {/* 試用期間 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">試用期間</label>
                    <input
                        name="probation_period"
                        value={probationPeriod}
                        onChange={(e) => setProbationPeriod(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：3ヶ月"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">試用期間詳細</label>
                    <input
                        name="probation_details"
                        value={probationDetails}
                        onChange={(e) => setProbationDetails(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：待遇・給与は本採用時と同じ"
                    />
                </div>
            </div>

            {/* その他 */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="part_time_available"
                    name="part_time_available"
                    checked={partTimeAvailable}
                    onChange={(e) => setPartTimeAvailable(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="part_time_available" className="text-sm font-bold text-slate-700">
                    パート・アルバイト勤務可能
                </label>
            </div>

            {/* 訴求ポイント・歓迎要件 */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">仕事の醍醐味・やりがい</label>
                <textarea
                    name="appeal_points"
                    value={appealPoints}
                    onChange={(e) => setAppealPoints(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="この仕事の魅力やメリットを記入してください"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">歓迎する人材像・要件</label>
                <textarea
                    name="welcome_requirements"
                    value={welcomeRequirements}
                    onChange={(e) => setWelcomeRequirements(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="例：マネジメント経験がある方歓迎"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">配属部署詳細</label>
                <input
                    name="department_details"
                    value={departmentDetails}
                    onChange={(e) => setDepartmentDetails(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="例：営業部 第一営業課（5名）"
                />
            </div>
        </div>
    );
}