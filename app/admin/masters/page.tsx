import Link from "next/link";
import { Building2, Newspaper, ArrowRight } from "lucide-react";

export default function MastersPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">設定（マスタ管理）</h1>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Client Master */}
                <Link href="/admin/masters/clients" className="block group">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 group-hover:border-primary-200 group-hover:shadow-md transition-all h-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
                                <Building2 className="w-8 h-8" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">取引先管理</h2>
                        <p className="text-sm text-slate-500">
                            求人情報の「求人元（取引先）」として選択できる企業を管理します。
                        </p>
                    </div>
                </Link>
                {/* Listing Sources Master */}
                <Link href="/admin/masters/listing-sources" className="block group">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 group-hover:border-amber-200 group-hover:shadow-md transition-all h-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                                <Newspaper className="w-8 h-8" />
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">掲載元（媒体）管理</h2>
                        <p className="text-sm text-slate-500">
                            求人の掲載元を管理し、媒体ごとのデフォルト福利厚生を設定します。
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
