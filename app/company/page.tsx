import Link from 'next/link';

export default function CompanyPage() {
    return (
        <div className="bg-slate-50 py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        会社概要
                    </h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Company Profile
                    </p>
                </div>

                <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-slate-100">
                    <dl className="divide-y divide-slate-100">
                        <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-slate-50/50 transition-colors">
                            <dt className="text-sm font-semibold text-slate-900 flex items-center">
                                会社名
                            </dt>
                            <dd className="mt-1 text-sm text-slate-700 sm:col-span-2 sm:mt-0">
                                ネクストレベルホールディングス株式会社
                            </dd>
                        </div>

                        <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-slate-50/50 transition-colors">
                            <dt className="text-sm font-semibold text-slate-900 flex items-center">
                                設立日
                            </dt>
                            <dd className="mt-1 text-sm text-slate-700 sm:col-span-2 sm:mt-0">
                                2018年4月2日<br />
                                <span className="text-slate-500 text-xs">
                                    (株式会社ネクストレベル 設立日 2008年7月1日)
                                </span>
                            </dd>
                        </div>

                        <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-slate-50/50 transition-colors">
                            <dt className="text-sm font-semibold text-slate-900 flex items-center">
                                役員
                            </dt>
                            <dd className="mt-1 text-sm text-slate-700 sm:col-span-2 sm:mt-0">
                                代表取締役 河原 由次
                            </dd>
                        </div>

                        <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-slate-50/50 transition-colors">
                            <dt className="text-sm font-semibold text-slate-900 flex items-center">
                                従業員人数
                            </dt>
                            <dd className="mt-1 text-sm text-slate-700 sm:col-span-2 sm:mt-0">
                                約300名 <span className="text-slate-500 text-xs">（グループ・関連会社を含む）</span>
                            </dd>
                        </div>

                        <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-slate-50/50 transition-colors">
                            <dt className="text-sm font-semibold text-slate-900 flex items-center">
                                本社所在地
                            </dt>
                            <dd className="mt-1 text-sm text-slate-700 sm:col-span-2 sm:mt-0">
                                東京本社<br />
                                〒160-0023<br />
                                東京都新宿区西新宿3丁目2-7 KDX新宿ビル11F
                            </dd>
                        </div>

                        <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-slate-50/50 transition-colors">
                            <dt className="text-sm font-semibold text-slate-900 flex items-center">
                                決算期
                            </dt>
                            <dd className="mt-1 text-sm text-slate-700 sm:col-span-2 sm:mt-0">
                                3月
                            </dd>
                        </div>

                        <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-slate-50/50 transition-colors">
                            <dt className="text-sm font-semibold text-slate-900 flex items-center">
                                資本金
                            </dt>
                            <dd className="mt-1 text-sm text-slate-700 sm:col-span-2 sm:mt-0">
                                3億8520万円 <span className="text-slate-500 text-xs">（グループ・関連会社含む）</span>
                            </dd>
                        </div>

                        <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-slate-50/50 transition-colors">
                            <dt className="text-sm font-semibold text-slate-900 flex items-center">
                                業務内容
                            </dt>
                            <dd className="mt-1 text-sm text-slate-700 sm:col-span-2 sm:mt-0">
                                各種HRマッチングプラットフォームの運営
                            </dd>
                        </div>

                        <div className="px-6 py-6 sm:grid sm:grid-cols-3 sm:gap-4 hover:bg-slate-50/50 transition-colors">
                            <dt className="text-sm font-semibold text-slate-900 flex items-center">
                                営業時間
                            </dt>
                            <dd className="mt-1 text-sm text-slate-700 sm:col-span-2 sm:mt-0">
                                10:00～19:00
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="mt-10 text-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm hover:shadow-md"
                    >
                        トップページに戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}
