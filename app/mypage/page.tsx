import { getUserApplications, getUserProfile } from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, UserCircle, CheckCircle2, Circle, MessageCircle, ChevronRight } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    pending:   { label: "書類選考中", className: "bg-amber-100 text-amber-700" },
    reviewed:  { label: "書類通過",   className: "bg-blue-100 text-blue-700" },
    interview: { label: "面接調整中", className: "bg-purple-100 text-purple-700" },
    hired:     { label: "採用",       className: "bg-green-100 text-green-700" },
    rejected:  { label: "不採用",     className: "bg-red-100 text-red-700" },
    converted: { label: "転換済み",   className: "bg-teal-100 text-teal-700" },
};

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

export default async function MyPageDashboard() {
    const applications = await getUserApplications();
    const profile = await getUserProfile();

    // プロフィール完成度チェック
    const completionItems = [
        { label: "氏名", done: !!(profile?.last_name && profile?.first_name) },
        { label: "電話番号", done: !!profile?.phone_number },
        { label: "住所", done: !!(profile?.prefecture && profile?.address) },
        { label: "生年月日", done: !!profile?.birth_date },
        { label: "最終学歴", done: !!profile?.education },
        { label: "職歴", done: !!profile?.work_history },
        { label: "希望条件", done: !!(profile?.desired_conditions || profile?.desired_job_type) },
        { label: "自己PR", done: !!profile?.self_pr },
        { label: "プロフィール写真", done: !!profile?.avatar_url },
    ];
    const completionScore = completionItems.reduce((sum, item) => item.done ? sum + 1 : sum, 0);
    const missingItems = completionItems.filter(item => !item.done);
    // やることリスト: 未入力項目を最大4件表示
    const todoItems = missingItems.slice(0, 4);

    const pendingCount = applications.filter((a: { status: string }) => a.status === "pending").length;
    const recentApplications = applications.slice(0, 3);

    return (
        <div className="space-y-4">
            {/* プロフィールヘッダー */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-50 flex-shrink-0">
                        {profile?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={profile.avatar_url}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <UserCircle className="w-12 h-12" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-slate-900 truncate">
                            {profile?.last_name ? `${profile.last_name} ${profile.first_name} 様` : "ゲスト 様"}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {completionScore === completionItems.length
                                ? "プロフィール完成！スカウトを待ちましょう"
                                : `プロフィール完成度 ${completionScore}/${completionItems.length} 項目`}
                        </p>
                    </div>
                    <Button asChild variant="outline" size="sm" className="flex-shrink-0 border-primary-200 text-primary-700 hover:bg-primary-50">
                        <Link href="/mypage/profile">編集</Link>
                    </Button>
                </div>
            </div>

            {/* 統計カード */}
            <div className="grid grid-cols-2 gap-3">
                <Link href="/mypage/applications" className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-primary-200 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{applications.length}</p>
                            <p className="text-xs text-slate-500">応募履歴</p>
                        </div>
                    </div>
                    {pendingCount > 0 && (
                        <p className="text-xs text-amber-600 font-bold mt-2 bg-amber-50 rounded px-2 py-1">選考中 {pendingCount}件</p>
                    )}
                </Link>

                <Link href="/mypage/chat" className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-primary-200 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">相談・チャット</p>
                            <p className="text-xs text-slate-500">エージェントに聞く</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* やることリスト */}
            {todoItems.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800 text-sm">やることリスト</h2>
                        <Link href="/mypage/profile" className="text-xs text-primary-600 hover:underline">
                            すべて入力する →
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {todoItems.map((item) => (
                            <Link key={item.label} href="/mypage/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group">
                                {item.done ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                ) : (
                                    <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                                )}
                                <span className="text-sm text-slate-700 flex-1">
                                    「{item.label}」を入力する
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-400 transition-colors" />
                            </Link>
                        ))}
                    </div>
                    {missingItems.length > 4 && (
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                            <Link href="/mypage/profile" className="text-xs text-slate-500 hover:text-primary-600">
                                他 {missingItems.length - 4} 項目の未入力あり →
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* 最近の応募履歴 */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="font-bold text-slate-800 text-sm">最近の応募履歴</h2>
                    <Link href="/mypage/applications" className="text-xs text-primary-600 hover:underline">
                        すべて見る
                    </Link>
                </div>
                {recentApplications.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {recentApplications.map((app: any) => {
                            const statusDisplay = getStatusDisplay(app.status);
                            return (
                                <Link key={app.id} href={`/jobs/${app.jobs?.id}`} className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors group">
                                    <div className="flex-1 min-w-0">
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold mb-1 ${statusDisplay.className}`}>
                                            {statusDisplay.label}
                                        </span>
                                        <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors truncate">
                                            {app.jobs?.title || "求人情報が見つかりません"}
                                        </p>
                                        <p className="text-xs text-slate-500">{app.jobs?.area}</p>
                                    </div>
                                    <div className="text-xs text-slate-400 flex-shrink-0 text-right">
                                        <p>{getRelativeDays(app.created_at)}に応募</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-slate-500 text-sm mb-4">まだ応募履歴がありません</p>
                        <Button asChild size="sm">
                            <Link href="/jobs">求人を探す</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
