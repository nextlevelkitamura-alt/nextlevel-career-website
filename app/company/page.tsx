export default function CompanyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-8 border-l-4 border-primary-500 pl-4">会社概要</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-100">
                        <tr className="flex flex-col md:table-row">
                            <th className="bg-slate-50 p-4 md:w-48 font-bold text-slate-700">会社名</th>
                            <td className="p-4 text-slate-700">株式会社Next Level</td>
                        </tr>
                        <tr className="flex flex-col md:table-row">
                            <th className="bg-slate-50 p-4 md:w-48 font-bold text-slate-700">設立</th>
                            <td className="p-4 text-slate-700">2020年4月1日</td>
                        </tr>
                        <tr className="flex flex-col md:table-row">
                            <th className="bg-slate-50 p-4 md:w-48 font-bold text-slate-700">代表者</th>
                            <td className="p-4 text-slate-700">代表取締役 田中 健太</td>
                        </tr>
                        <tr className="flex flex-col md:table-row">
                            <th className="bg-slate-50 p-4 md:w-48 font-bold text-slate-700">資本金</th>
                            <td className="p-4 text-slate-700">1,000万円</td>
                        </tr>
                        <tr className="flex flex-col md:table-row">
                            <th className="bg-slate-50 p-4 md:w-48 font-bold text-slate-700">従業員数</th>
                            <td className="p-4 text-slate-700">150名（2025年4月現在）</td>
                        </tr>
                        <tr className="flex flex-col md:table-row">
                            <th className="bg-slate-50 p-4 md:w-48 font-bold text-slate-700">事業内容</th>
                            <td className="p-4 text-slate-700 leading-relaxed">
                                人材紹介事業（厚生労働大臣許可番号：13-ユ-333333）<br />
                                人材派遣事業（厚生労働大臣許可番号：派13-333333）<br />
                                採用コンサルティング事業<br />
                                教育研修事業
                            </td>
                        </tr>
                        <tr className="flex flex-col md:table-row">
                            <th className="bg-slate-50 p-4 md:w-48 font-bold text-slate-700">所在地</th>
                            <td className="p-4 text-slate-700">
                                〒100-0005<br />
                                東京都千代田区丸の内1-1-1 Next Level Tower 25F
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
