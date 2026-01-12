import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Settings, LogOut } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

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

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar Navigation */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                            <div className="p-6 border-b border-slate-100 bg-slate-50">
                                <p className="text-xs text-slate-500 font-bold mb-1">ログイン中</p>
                                <p className="text-sm font-medium truncate" title={user.email}>{user.email}</p>
                            </div>
                            <nav className="p-2">
                                <ul className="space-y-1">
                                    <li>
                                        <Link href="/mypage" className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary-600 transition-colors">
                                            <FileText className="w-5 h-5 mr-3 text-slate-400" />
                                            ダッシュボード
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/mypage/applications" className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary-600 transition-colors">
                                            <FileText className="w-5 h-5 mr-3 text-slate-400" />
                                            応募履歴
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/mypage/profile" className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary-600 transition-colors">
                                            <Settings className="w-5 h-5 mr-3 text-slate-400" />
                                            プロフィール編集
                                        </Link>
                                    </li>
                                </ul>
                                <div className="mt-4 pt-4 border-t border-slate-100 px-2">
                                    <div className="flex items-center px-4 py-2 text-sm font-medium text-slate-700">
                                        <LogOut className="w-5 h-5 mr-3 text-slate-400" />
                                        <div className="flex-1">
                                            <SignOutButton />
                                        </div>
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
