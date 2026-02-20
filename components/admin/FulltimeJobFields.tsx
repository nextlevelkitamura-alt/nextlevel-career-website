"use client";


/**
 * 正社員求人専用のフォームフィールド
 * fulltime_job_details テーブルに対応
 * グループ: 募集内容 → 勤務地詳細 → 給与・年収 → 勤務時間・休日 → 待遇・職場環境 → 会社概要
 */

interface FulltimeJobFieldsProps {
    // 正社員専用フィールド
    companyName: string;
    setCompanyName: (value: string) => void;
    companyAddress: string;
    setCompanyAddress: (value: string) => void;
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
    departmentDetails: string;
    setDepartmentDetails: (value: string) => void;
    recruitmentBackground: string;
    setRecruitmentBackground: (value: string) => void;
    companyUrl: string;
    setCompanyUrl: (value: string) => void;
    isCompanyNamePublic: boolean;
    setIsCompanyNamePublic: (value: boolean) => void;
    educationTraining: string;
    setEducationTraining: (value: string) => void;
    representative: string;
    setRepresentative: (value: string) => void;
    capital: string;
    setCapital: (value: string) => void;
    workLocationDetail: string;
    setWorkLocationDetail: (value: string) => void;
    salaryDetail: string;
    setSalaryDetail: (value: string) => void;
    transferPolicy: string;
    setTransferPolicy: (value: string) => void;
    // エン転職対応追加フィールド
    salaryExample: string;
    setSalaryExample: (value: string) => void;
    bonus: string;
    setBonus: (value: string) => void;
    raise: string;
    setRaise: (value: string) => void;
    annualRevenue: string;
    setAnnualRevenue: (value: string) => void;
    onboardingProcess: string;
    setOnboardingProcess: (value: string) => void;
    interviewLocation: string;
    setInterviewLocation: (value: string) => void;
    salaryBreakdown: string;
    setSalaryBreakdown: (value: string) => void;
    // 勤務地情報（共通jobsテーブル）
    workplaceName: string;
    setWorkplaceName: (value: string) => void;
    workplaceAddress: string;
    setWorkplaceAddress: (value: string) => void;
    workplaceAccess: string;
    setWorkplaceAccess: (value: string) => void;
    children?: React.ReactNode;
}

export default function FulltimeJobFields({
    companyName,
    setCompanyName,
    companyAddress,
    setCompanyAddress,
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
    departmentDetails,
    setDepartmentDetails,
    recruitmentBackground,
    setRecruitmentBackground,
    companyUrl,
    setCompanyUrl,
    isCompanyNamePublic,
    setIsCompanyNamePublic,
    educationTraining,
    setEducationTraining,
    representative,
    setRepresentative,
    capital,
    setCapital,
    workLocationDetail,
    setWorkLocationDetail,
    salaryDetail,
    setSalaryDetail,
    transferPolicy,
    setTransferPolicy,
    salaryExample,
    setSalaryExample,
    bonus,
    setBonus,
    raise,
    setRaise,
    annualRevenue,
    setAnnualRevenue,
    onboardingProcess,
    setOnboardingProcess,
    interviewLocation,
    setInterviewLocation,
    salaryBreakdown,
    setSalaryBreakdown,
    workplaceName,
    setWorkplaceName,
    workplaceAddress,
    setWorkplaceAddress,
    workplaceAccess,
    setWorkplaceAccess,
    children,
}: FulltimeJobFieldsProps) {
    return (
        <div className="space-y-8 pt-8 border-t-2 border-blue-100 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">正社員</span>
                <h3 className="font-bold text-lg text-slate-800">正社員入力フォーム</h3>
            </div>

            {children}

            {/* ========== 募集内容 ========== */}
            <div className="space-y-6">
                <h5 className="text-sm font-bold text-blue-700 border-b border-blue-100 pb-2">募集内容</h5>

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
                    <label className="text-sm font-bold text-slate-700">募集背景</label>
                    <textarea
                        name="recruitment_background"
                        value={recruitmentBackground}
                        onChange={(e) => setRecruitmentBackground(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：事業拡大に伴い、新規メンバーを募集します"
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

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">入社後の流れ</label>
                    <textarea
                        name="onboarding_process"
                        value={onboardingProcess}
                        onChange={(e) => setOnboardingProcess(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={"例：\n入社後1ヶ月：座学研修（ビジネスマナー、商品知識）\n2〜3ヶ月：OJTで先輩に同行\n4ヶ月目：独り立ち"}
                    />
                </div>
            </div>

            {/* ========== 勤務地・アクセス ========== */}
            <div className="space-y-6">
                <h5 className="text-sm font-bold text-blue-700 border-b border-blue-100 pb-2">勤務地・アクセス</h5>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">勤務先名称（表示用）</label>
                    <input
                        name="workplace_name"
                        value={workplaceName}
                        onChange={(e) => setWorkplaceName(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：株式会社○○ 本社"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">勤務住所</label>
                    <input
                        name="workplace_address"
                        value={workplaceAddress}
                        onChange={(e) => setWorkplaceAddress(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：東京都港区六本木1-1-1（本社と異なる場合）"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">アクセス</label>
                    <input
                        name="workplace_access"
                        value={workplaceAccess}
                        onChange={(e) => setWorkplaceAccess(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：六本木一丁目駅直結 徒歩1分"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">勤務地エリア詳細</label>
                    <textarea
                        name="work_location_detail"
                        value={workLocationDetail}
                        onChange={(e) => setWorkLocationDetail(e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={"◆首都圏エリア\n東京都、神奈川県、埼玉県、千葉県\n\n◆東海エリア\n愛知県、岐阜県、静岡県、三重県"}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">転勤の有無</label>
                    <input
                        name="transfer_policy"
                        value={transferPolicy}
                        onChange={(e) => setTransferPolicy(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：転居を伴う転勤なし"
                    />
                </div>
            </div>

            {/* ========== 給与・年収 ========== */}
            <div className="space-y-6">
                <h5 className="text-sm font-bold text-blue-700 border-b border-blue-100 pb-2">給与・年収</h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">年収・最低（万円）</label>
                        <input
                            type="number"
                            name="annual_salary_min"
                            value={annualSalaryMin}
                            onChange={(e) => setAnnualSalaryMin(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="例：300"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">年収・最高（万円）</label>
                        <input
                            type="number"
                            name="annual_salary_max"
                            value={annualSalaryMax}
                            onChange={(e) => setAnnualSalaryMax(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="例：500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">給与内訳</label>
                    <textarea
                        name="salary_breakdown"
                        value={salaryBreakdown}
                        onChange={(e) => setSalaryBreakdown(e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={"例：\n基本給 22万円\n固定残業代 3万円（20時間分、超過分は別途支給）\n一律手当 1万円\n※月給26万円の内訳"}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">給与エリア詳細</label>
                    <textarea
                        name="salary_detail"
                        value={salaryDetail}
                        onChange={(e) => setSalaryDetail(e.target.value)}
                        rows={4}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={"■首都圏\n月給25万円〜35万円（月収例30万円〜40万円）\n\n■関西\n月給22万円〜30万円（月収例27万円〜35万円）"}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">月平均残業時間</label>
                    <input
                        name="overtime_hours"
                        value={overtimeHours}
                        onChange={(e) => setOvertimeHours(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：月平均20時間"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">年収例</label>
                    <textarea
                        name="salary_example"
                        value={salaryExample}
                        onChange={(e) => setSalaryExample(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={"例：\n450万円/入社2年目（月給28万円+賞与）\n600万円/入社5年目・リーダー（月給35万円+賞与）"}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">賞与</label>
                        <input
                            name="bonus"
                            value={bonus}
                            onChange={(e) => setBonus(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="例：年2回（昨年度実績3ヶ月分）"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">昇給</label>
                        <input
                            name="raise"
                            value={raise}
                            onChange={(e) => setRaise(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="例：年1回（4月）"
                        />
                    </div>
                </div>
            </div>

            {/* ========== 勤務時間・休日 ========== */}
            <div className="space-y-6">
                <h5 className="text-sm font-bold text-blue-700 border-b border-blue-100 pb-2">勤務時間・休日</h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">年間休日</label>
                        <input
                            name="annual_holidays"
                            value={annualHolidays}
                            onChange={(e) => setAnnualHolidays(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="例：120 / 120日（配属先により変更あり）"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">喫煙情報</label>
                        <input
                            name="smoking_policy"
                            value={smokingPolicy}
                            onChange={(e) => setSmokingPolicy(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="例：屋内禁煙 / 屋内原則禁煙（喫煙室あり） / 分煙"
                            list="smoking_policy_options"
                        />
                        <datalist id="smoking_policy_options">
                            <option value="完全禁煙" />
                            <option value="屋内禁煙" />
                            <option value="屋内原則禁煙（喫煙室あり）" />
                            <option value="分煙" />
                            <option value="敷地内禁煙" />
                            <option value="喫煙可" />
                        </datalist>
                    </div>
                </div>
            </div>

            {/* ========== 待遇・職場環境 ========== */}
            <div className="space-y-6">
                <h5 className="text-sm font-bold text-blue-700 border-b border-blue-100 pb-2">待遇・職場環境</h5>

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

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">教育制度・研修</label>
                    <textarea
                        name="education_training"
                        value={educationTraining}
                        onChange={(e) => setEducationTraining(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={"例：\nOJT研修あり\n無料eラーニング（ビジネスマナー・Excel等）\n資格取得支援制度"}
                    />
                </div>
            </div>

            {/* ========== 会社概要 ========== */}
            <div className="space-y-6">
                <h5 className="text-sm font-bold text-blue-700 border-b border-blue-100 pb-2">会社概要</h5>

                {/* 企業名 + 公開設定 */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">企業名</label>
                    <input
                        name="company_name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：株式会社○○"
                    />
                    <div className="flex items-center gap-2 mt-1">
                        <input
                            type="checkbox"
                            id="is_company_name_public"
                            checked={isCompanyNamePublic}
                            onChange={(e) => setIsCompanyNamePublic(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="is_company_name_public" className="text-sm text-slate-600">
                            企業名を求人ページで公開する
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">設立年月</label>
                        <input
                            name="established_date"
                            value={establishedDate}
                            onChange={(e) => setEstablishedDate(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="例：2000年4月"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">会社住所</label>
                    <input
                        name="company_address"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：東京都港区六本木1-1-1"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">代表者</label>
                        <input
                            name="representative"
                            value={representative}
                            onChange={(e) => setRepresentative(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="例：代表取締役社長 山田太郎"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">資本金</label>
                        <input
                            name="capital"
                            value={capital}
                            onChange={(e) => setCapital(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="例：1億円"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">売上高</label>
                    <input
                        name="annual_revenue"
                        value={annualRevenue}
                        onChange={(e) => setAnnualRevenue(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：100億円（2024年度）"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">企業ホームページ</label>
                    <input
                        type="url"
                        name="company_url"
                        value={companyUrl}
                        onChange={(e) => setCompanyUrl(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：https://www.example.co.jp"
                    />
                </div>

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
            </div>

            {/* ========== 選考情報 ========== */}
            <div className="space-y-6">
                <h5 className="text-sm font-bold text-blue-700 border-b border-blue-100 pb-2">選考情報</h5>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">面接地</label>
                    <input
                        name="interview_location"
                        value={interviewLocation}
                        onChange={(e) => setInterviewLocation(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：東京本社（東京都港区六本木1-1-1）/ Web面接可"
                    />
                </div>
            </div>
        </div>
    );
}
