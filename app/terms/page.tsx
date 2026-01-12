export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-8 border-l-4 border-primary-500 pl-4">利用規約</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
                <p className="text-slate-600 leading-relaxed">
                    この利用規約（以下「本規約」といいます。）は、株式会社Next Level（以下「当社」といいます。）が提供するサービス（以下「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下「ユーザー」といいます。）には、本規約に従って、本サービスをご利用いただきます。
                </p>

                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-3">第1条（適用）</h2>
                    <p className="text-slate-600 leading-relaxed">
                        本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-3">第2条（利用登録）</h2>
                    <p className="text-slate-600 leading-relaxed">
                        登録希望者が当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-3">第3条（禁止事項）</h2>
                    <p className="text-slate-600 leading-relaxed">
                        ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。<br />
                        1. 法令または公序良俗に違反する行為<br />
                        2. 犯罪行為に関連する行為<br />
                        3. 当社のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為<br />
                        4. 当社のサービスの運営を妨害するおそれのある行為
                    </p>
                </section>

                {/* Add more sections as needed */}

            </div>
        </div>
    );
}
