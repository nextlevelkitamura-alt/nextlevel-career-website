import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Settings, Home, MessageCircle, UserCircle, Clock } from "lucide-react";
import NotificationListener from "@/components/NotificationListener";
import { getUserProfile, getUserApplications } from "./actions";
import { Button } from "@/components/ui/button";

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
    const isProfileComplete = profile && profile.last_name && profile.first_name && profile.phone_number && profile.work_history;
    const applications = await getUserApplications();
    const recentApplications = applications.slice(0, 3);

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col gap-4">
                    
                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>

                    {/* Profile Alert */}
                    {!isProfileComplete && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <UserCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-amber-800">プロフィールを完成させましょう</h3>
                                    <p className="text-sm text-amber-700">基本情報を登録すると、応募がスムーズになります。</p>
                                </div>
                            </div>
                            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white border-0 whitespace-nowrap">
                                <Link href="/mypage/profile">編集する</Link>
                            </Button>
                        </div>
                    )}
                    
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

                    {/* Recent Applications */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-bold text-slate-800">最近の応募履歴</h2>
                            <Link href="/mypage/applications" className="text-sm text-primary-600 hover:underline">
                                すべて見る
                            </Link>
                        </div>
                        {recentApplications.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {recentApplications.map((app: any) => (
                                    <div key={app.id} className="p-6 hover:bg-slate-50 transition-colors">
                                        <Link href={`/jobs/${app.jobs?.id}`} className="block group">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 ${app.status === 'pending' ? 'bg-slate-100 text-slate-600' :
                                                        app.status === 'hired' ? 'bg-green-100 text-green-700' :
                                                            app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {app.status === 'pending' ? '選考中' : app.status === 'hired' ? '採用' : app.status === 'rejected' ? '不採用' : app.status}
                                                    </span>
                                                    <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-1">
                                                        {app.jobs?.title || "求人情報が見つかりません"}
                                                    </h3>
                                                    <p className="text-sm text-slate-500">
                                                        {app.jobs?.category} / {app.jobs?.area}
                                                    </p>
                                                </div>
                                                <div className="flex items-center text-sm text-slate-400">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {new Date(app.created_at).toLocaleDateString("ja-JP")}
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <p className="text-slate-500 mb-6">まだ応募履歴がありません。</p>
                                <Button asChild>
                                    <Link href="/jobs">求人を探す</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <NotificationListener userId={user.id.toString()} />
        </div>
    );
}
