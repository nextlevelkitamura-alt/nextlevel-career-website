import { getUserApplications } from "../actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock, ChevronLeft } from "lucide-react";

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
                        {applications.map((app: any) => (
                            <div key={app.id} className="p-6 hover:bg-slate-50 transition-colors">
                                <Link href={`/jobs/${app.jobs?.id}`} className="block group">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${app.status === 'pending' ? 'bg-slate-100 text-slate-600' :
                                                    app.status === 'hired' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {app.status === 'pending' ? '選考中' : app.status === 'hired' ? '採用' : app.status === 'rejected' ? '不採用' : app.status}
                                                </span>
                                                <span className="text-xs text-slate-400">ID: {app.jobs?.id.substring(0, 8)}...</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-1">
                                                {app.jobs?.title || "求人情報が見つかりません"}
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                {app.jobs?.category} / {app.jobs?.area} / {app.jobs?.salary}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2 min-w-[120px]">
                                            <div className="flex items-center text-sm text-slate-400">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {new Date(app.created_at).toLocaleDateString("ja-JP")}
                                            </div>
                                            <Button size="sm" variant="outline" className="w-full text-xs h-8">
                                                詳細を見る
                                            </Button>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
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
