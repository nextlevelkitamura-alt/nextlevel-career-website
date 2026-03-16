import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Settings, Home, MessageCircle } from "lucide-react";
import NotificationListener from "@/components/NotificationListener";
import { getUserProfile } from "./actions";

export default async function MyPageLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const profile = await getUserProfile();

    // プロフィール完成度を計算（合計100点）
    const completionItems = [
        { label: "氏名", done: !!(profile?.last_name && profile?.first_name), points: 15 },
        { label: "電話番号", done: !!profile?.phone_number, points: 10 },
        { label: "住所", done: !!(profile?.prefecture && profile?.address), points: 10 },
        { label: "生年月日", done: !!profile?.birth_date, points: 5 },
        { label: "最終学歴", done: !!profile?.education, points: 10 },
        { label: "職歴", done: !!profile?.work_history, points: 20 },
        { label: "希望条件", done: !!(profile?.desired_conditions || profile?.desired_job_type), points: 10 },
        { label: "自己PR", done: !!profile?.self_pr, points: 10 },
        { label: "プロフィール写真", done: !!profile?.avatar_url, points: 10 },
    ];
    const completionScore = completionItems.reduce((sum, item) => sum + (item.done ? item.points : 0), 0);
    const missingItems = completionItems.filter(item => !item.done).map(item => item.label);

    const barColor = completionScore >= 80 ? "bg-green-500" : completionScore >= 50 ? "bg-amber-500" : "bg-red-400";
    const scoreColor = completionScore >= 80 ? "text-green-600" : completionScore >= 50 ? "text-amber-600" : "text-red-500";

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col gap-4">

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>

                    {/* Profile Completion Bar */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-slate-700">プロフィール完成度</span>
                            <span className={`text-sm font-bold ${scoreColor}`}>{completionScore}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3">
                            <div
                                className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
                                style={{ width: `${completionScore}%` }}
                            />
                        </div>
                        {missingItems.length > 0 ? (
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-xs text-slate-500">
                                    「{missingItems.slice(0, 2).join("」「")}」{missingItems.length > 2 ? ` 他${missingItems.length - 2}項目` : ""}を入力するとスカウトが届きやすくなります
                                </p>
                                <Link href="/mypage/profile" className="text-xs font-bold text-primary-600 hover:underline whitespace-nowrap">
                                    入力する →
                                </Link>
                            </div>
                        ) : (
                            <p className="text-xs text-green-600 font-bold">プロフィール完成！スカウトを待ちましょう</p>
                        )}
                    </div>

                    {/* Navigation Menu */}
                    <aside className="w-full">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                                <p className="text-xs text-slate-500 font-bold mb-1">ログイン中</p>
                                <p className="text-sm font-medium truncate" title={user.email}>{user.email}</p>
                            </div>
                            <nav className="p-2">
                                <ul className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                                    <li>
                                        <Link href="/mypage" className="flex flex-col items-center justify-center text-center px-2 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary-600 transition-colors">
                                            <Home className="w-6 h-6 mb-1 text-slate-400" />
                                            マイページ
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/mypage/applications" className="flex flex-col items-center justify-center text-center px-2 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary-600 transition-colors">
                                            <FileText className="w-6 h-6 mb-1 text-slate-400" />
                                            応募履歴
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/mypage/chat" className="flex flex-col items-center justify-center text-center px-2 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary-600 transition-colors">
                                            <MessageCircle className="w-6 h-6 mb-1 text-slate-400" />
                                            チャット
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/mypage/profile" className="flex flex-col items-center justify-center text-center px-2 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary-600 transition-colors">
                                            <Settings className="w-6 h-6 mb-1 text-slate-400" />
                                            プロフィール編集
                                        </Link>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </aside>
                </div>
            </div>
            <NotificationListener userId={user.id.toString()} />
        </div>
    );
}
