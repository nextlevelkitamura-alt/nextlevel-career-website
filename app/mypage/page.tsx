import { getUserApplications, getUserProfile } from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, UserCircle, Clock } from "lucide-react";

export default async function MyPageDashboard() {
    const applications = await getUserApplications();
    const profile = await getUserProfile();

    const recentApplications = applications.slice(0, 3);
    const isProfileComplete = profile && profile.last_name && profile.first_name && profile.phone_number && profile.work_history;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-900">マイページ</h1>

            {/* Profile Header with Application Count */}
            <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-50 flex-shrink-0">
                        {profile?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={profile.avatar_url}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <UserCircle className="w-16 h-16" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                                {profile?.last_name ? `${profile.last_name} ${profile.first_name} 様` : "ゲスト 様"}
                            </h2>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-bold">
                                    <FileText className="w-4 h-4" />
                                    応募 {applications.length}件
                                </span>
                            </div>
                        </div>
                        <p className="text-slate-500">
                            {isProfileComplete ? "プロフィールは充実しています。求人に応募してみましょう！" : "プロフィールを完成させて、スカウトや応募をスムーズにしましょう。"}
                        </p>
                        <div className="pt-2">
                            <Button asChild variant="outline" className="border-primary-200 text-primary-700 hover:bg-primary-50">
                                <Link href="/mypage/profile">プロフィールを編集</Link>
                            </Button>
                        </div>
                    </div>
                </div>
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
    );
}
