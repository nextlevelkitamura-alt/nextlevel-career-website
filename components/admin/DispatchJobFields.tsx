"use client";

/**
 * 派遣求人専用のフォームフィールド
 * dispatch_job_details テーブルに対応
 */

interface DispatchJobFieldsProps {
    // 派遣専用フィールド
    clientCompanyName: string;
    workplaceAddress: string;
    setWorkplaceAddress: (value: string) => void;
    workplaceAccess: string;
    setWorkplaceAccess: (value: string) => void;
    trainingSalary: string;
    setTrainingSalary: (value: string) => void;
    trainingPeriod: string;
    setTrainingPeriod: (value: string) => void;
    endDate: string;
    setEndDate: (value: string) => void;
    actualWorkHours: string;
    setActualWorkHours: (value: string) => void;
    workDaysPerWeek: string;
    setWorkDaysPerWeek: (value: string) => void;
    nailPolicy: string;
    setNailPolicy: (value: string) => void;
    shiftNotes: string;
    setShiftNotes: (value: string) => void;
    generalNotes: string;
    setGeneralNotes: (value: string) => void;
}

export default function DispatchJobFields({
    clientCompanyName,
    workplaceAddress,
    setWorkplaceAddress,
    workplaceAccess,
    setWorkplaceAccess,
    trainingSalary,
    setTrainingSalary,
    trainingPeriod,
    setTrainingPeriod,
    endDate,
    setEndDate,
    actualWorkHours,
    setActualWorkHours,
    workDaysPerWeek,
    setWorkDaysPerWeek,
    nailPolicy,
    setNailPolicy,
    shiftNotes,
    setShiftNotes,
    generalNotes,
    setGeneralNotes,
}: DispatchJobFieldsProps) {
    return (
        <div className="space-y-6 pt-6 border-t border-slate-100">
            <h4 className="font-bold text-md text-slate-800">派遣求人専用情報</h4>

            {/* 派遣は企業名を非公開で管理 */}
            <input type="hidden" name="client_company_name" value={clientCompanyName} />
            <input type="hidden" name="is_client_company_public" value="false" />

            {/* 勤務地情報（派遣は住所とアクセスのみ） */}
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">勤務地住所</label>
                    <input
                        name="workplace_address"
                        value={workplaceAddress}
                        onChange={(e) => setWorkplaceAddress(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：東京都港区六本木1-1-1"
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
            </div>

            {/* 研修情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">研修期間・内容</label>
                    <input
                        name="training_period"
                        value={trainingPeriod}
                        onChange={(e) => setTrainingPeriod(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：1週間の座学研修"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">研修中の給与</label>
                    <input
                        name="training_salary"
                        value={trainingSalary}
                        onChange={(e) => setTrainingSalary(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：時給1200円"
                    />
                </div>
            </div>

            {/* 勤務条件 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">契約終了日</label>
                    <input
                        name="end_date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：2026年12月31日"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">1日の実働時間</label>
                    <input
                        name="actual_work_hours"
                        value={actualWorkHours}
                        onChange={(e) => setActualWorkHours(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：8時間"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">週の出勤日数</label>
                    <input
                        name="work_days_per_week"
                        value={workDaysPerWeek}
                        onChange={(e) => setWorkDaysPerWeek(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：週5日"
                    />
                </div>
            </div>

            {/* 身だしなみ・シフト */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">ネイル規定</label>
                    <input
                        name="nail_policy"
                        value={nailPolicy}
                        onChange={(e) => setNailPolicy(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：ベージュ・薄ピンクのみOK"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">シフト備考</label>
                    <input
                        name="shift_notes"
                        value={shiftNotes}
                        onChange={(e) => setShiftNotes(e.target.value)}
                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：週3日〜相談可"
                    />
                </div>
            </div>

            {/* 備考 */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">その他備考</label>
                <textarea
                    name="general_notes"
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="派遣求人に関する追加情報があれば記入してください"
                />
            </div>
        </div>
    );
}