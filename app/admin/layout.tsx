import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_admin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-sm">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス権限がありません</h1>
                    <p className="text-slate-600 mb-6">このページを表示するには管理者権限が必要です。</p>
                    <Link href="/" className="text-primary-600 hover:underline">
                        トップページへ戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100">
            <nav className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
                        <Link href="/admin/jobs" className="text-xl font-bold text-slate-900">
                            管理画面
                        </Link>
                        <div className="flex gap-4 w-full md:w-auto justify-center md:justify-start">
                            <Link href="/admin/jobs" className="text-sm md:text-base text-slate-600 hover:text-primary-600 font-medium px-3 py-2 rounded-md hover:bg-slate-50 transition-colors">
                                求人管理
                            </Link>
                            <Link href="/admin/applications" className="text-sm md:text-base text-slate-600 hover:text-primary-600 font-medium px-3 py-2 rounded-md hover:bg-slate-50 transition-colors">
                                応募者管理
                            </Link>
                            <Link href="/admin/users" className="text-sm md:text-base text-slate-600 hover:text-primary-600 font-medium px-3 py-2 rounded-md hover:bg-slate-50 transition-colors">
                                ユーザー管理
                            </Link>
                            <Link href="/admin/masters" className="text-sm md:text-base text-slate-600 hover:text-primary-600 font-medium px-3 py-2 rounded-md hover:bg-slate-50 transition-colors">
                                設定
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0 border-slate-100">
                        <span className="text-slate-500 truncate max-w-[150px]">{user.email}</span>
                        <Link href="/" className="text-primary-600 hover:underline whitespace-nowrap">
                            サイトを表示
                        </Link>
                    </div>
                </div>
            </nav>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
