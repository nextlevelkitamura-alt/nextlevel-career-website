export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-8 border-l-4 border-primary-500 pl-4">プライバシーポリシー</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
                <p className="text-slate-600 leading-relaxed">
                    株式会社Next Level（以下「当社」といいます。）は、お客様の個人情報保護の重要性を強く認識し、以下の方針に基づき個人情報の適正な取り扱いに努めてまいります。
                </p>

                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-3">1. 個人情報の取得について</h2>
                    <p className="text-slate-600 leading-relaxed">
                        当社は、適法かつ公正な手段によって、個人情報を取得致します。
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-3">2. 個人情報の利用について</h2>
                    <p className="text-slate-600 leading-relaxed">
                        当社は、個人情報を、取得の際に示した利用目的の範囲内で、業務の遂行上必要な限りにおいて、利用します。
                    </p>
                </section>

                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-3">3. 個人情報の第三者提供について</h2>
                    <p className="text-slate-600 leading-relaxed">
                        当社は、法令に定める場合を除き、個人情報を、事前に本人の同意を得ることなく、第三者に提供しません。
                    </p>
                </section>

                {/* Add more sections as needed */}

                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-3">お問い合わせ窓口</h2>
                    <p className="text-slate-600 leading-relaxed">
                        本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。<br />
                        株式会社Next Level 個人情報保護相談窓口<br />
                        E-mail: privacy@example.com
                    </p>
                </section>
            </div>
        </div>
    );
}
