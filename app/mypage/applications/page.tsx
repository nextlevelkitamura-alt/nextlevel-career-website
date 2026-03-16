import { getUserApplications } from "../actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    pending:   { label: "書類選考中", className: "bg-amber-100 text-amber-700" },
    reviewed:  { label: "書類通過",   className: "bg-blue-100 text-blue-700" },
    interview: { label: "面接調整中", className: "bg-purple-100 text-purple-700" },
    hired:     { label: "採用",       className: "bg-green-100 text-green-700" },
    rejected:  { label: "不採用",     className: "bg-red-100 text-red-700" },
    converted: { label: "転換済み",   className: "bg-teal-100 text-teal-700" },
};

const STEPS = ["応募済み", "書類選考", "面接", "結果"];

// 0始まりのアクティブステップインデックスを返す（完了済みは含まない）
function getActiveStep(status: string): number {
    if (status === "pending")   return 1; // 書類選考中
    if (status === "reviewed")  return 2; // 面接フェーズ手前
    if (status === "interview") return 2; // 面接中
    return 3;                             // hired / rejected / converted → 結果
}

function getStatusDisplay(status: string) {
    return STATUS_LABELS[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
}

function getRelativeDays(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "今日";
    if (days === 1) return "昨日";
    return `${days}日前`;
}

export default async function ApplicationsPage() {
    const applications = await getUserApplications();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/mypage" className="md:hidden p-2 -ml-2 text-slate-500">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">応募履歴</h1>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {applications.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {applications.map((app: any) => {
                            const statusDisplay = getStatusDisplay(app.status);
                            const activeStep = getActiveStep(app.status);
                            const isFinished = app.status === "hired" || app.status === "rejected" || app.status === "converted";

                            return (
                                <div key={app.id} className="p-6 hover:bg-slate-50 transition-colors">
                                    <Link href={`/jobs/${app.jobs?.id}`} className="block group">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${statusDisplay.className}`}>
                                                        {statusDisplay.label}
                                                    </span>
                                                    <span className="text-xs text-slate-400">{getRelativeDays(app.created_at)}に応募</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-1">
                                                    {app.jobs?.title || "求人情報が見つかりません"}
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    {app.jobs?.category} / {app.jobs?.area} / {app.jobs?.salary}
                                                </p>
                                            </div>
                                            <Button size="sm" variant="outline" className="text-xs h-8 flex-shrink-0">
                                                詳細を見る
                                            </Button>
                                        </div>
                                    </Link>

                                    {/* 選考ステップ進捗バー */}
                                    {!isFinished ? (
                                        <div className="flex items-center gap-0 mt-2">
                                            {STEPS.map((step, i) => {
                                                const isCompleted = i < activeStep;
                                                const isCurrent = i === activeStep;
                                                return (
                                                    <div key={step} className="flex items-center flex-1 last:flex-none">
                                                        <div className="flex flex-col items-center">
                                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                                                                isCompleted ? "bg-orange-500 border-orange-500 text-white" :
                                                                isCurrent   ? "bg-white border-orange-500 text-orange-500" :
                                                                              "bg-white border-slate-200 text-slate-400"
                                                            }`}>
                                                                {isCompleted ? "✓" : i + 1}
                                                            </div>
                                                            <span className={`text-[10px] mt-1 whitespace-nowrap ${
                                                                isCompleted || isCurrent ? "text-orange-600 font-bold" : "text-slate-400"
                                                            }`}>
                                                                {step}
                                                            </span>
                                                        </div>
                                                        {i < STEPS.length - 1 && (
                                                            <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < activeStep ? "bg-orange-400" : "bg-slate-200"}`} />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className={`mt-2 text-xs font-bold px-3 py-2 rounded-lg inline-block ${statusDisplay.className}`}>
                                            {statusDisplay.label}が確定しました
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-16 text-center">
                        <p className="text-slate-500 mb-6">まだ応募履歴がありません。</p>
                        <Button asChild>
                            <Link href="/jobs">求人を探す</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
