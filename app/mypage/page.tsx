import { getUserApplications, getUserProfile } from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, UserCircle, ArrowRight, Clock } from "lucide-react";
import { format } from "date-fns"; // Standard date-fns or native Intl, I'll use native for fewer deps if possible, but let's check date-fns availability. Assuming standard JS for now to avoid errors if not installed.

export default async function MyPageDashboard() {
    const applications = await getUserApplications();
    const profile = await getUserProfile();

    const recentApplications = applications.slice(0, 3);
    const isProfileComplete = profile && profile.last_name && profile.first_name;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">ダッシュボード</h1>

            {/* Status Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-700">応募数</h3>
                        <FileText className="w-5 h-5 text-primary-500" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{applications.length}<span className="text-sm font-normal text-slate-500 ml-1">件</span></p>
                </div>
                {/* Add more stats if needed */}
            </div>

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

            {/* Recent Applications */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="font-bold text-slate-800">最近の応募履歴</h2>
                    <Link href="/mypage/applications" className="text-sm text-primary-600 hover:underline">
                        すべて見る
                    </Link>
                </div>
                {recentApplications.length > 0 ? (
                    <div className="divide-y divide-slate-100">
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
                                                {app.status === 'pending' ? '選考中' : app.status}
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
    );
}

