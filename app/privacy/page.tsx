import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "プライバシーポリシー",
    description: "株式会社ネクストレベルのプライバシーポリシーです。",
};

const staffPersonalInfoPurposes = [
    "①登録に関する受付・管理・ご連絡",
    "②ユーザーの個人認証及び本サービスの提供",
    "③最適な仕事の案内",
    "④本サービスの利用に伴う連絡・お問合せへの回答・メールマガジン・ⅮⅯ等の配信",
    "⑤ユーザーが当社に希望したサービスの提供",
    "⑥登録情報の修正及び更新",
    "⑦就業に関する労務管理事務",
    "⑧福利厚生の提供",
    "⑨ユーザーの同意に基づく当社提携企業・グループ会社への個人情報の提供・共同利用",
    "⑩本サービスの改善・新規サービスの開発及びマーケティング",
    "⑪キャンペーン・アンケート・モニター・取材等の実施",
    "⑫当社へのお問合せ及び資料請求への対応",
    "⑬就業活動の支援を目的とした当社グループ企業及び提供先企業への提供",
    "⑭派遣先での円滑な就業を目的とした派遣先企業への提供",
    "⑮就業状況管理を目的とした当社グループ企業での共同利用",
];

const businessPartnerPersonalInfoPurposes = [
    "①お取引関係先との業務連絡",
    "②契約の締結及び契約内容の履行",
    "③お取引先管理及び営業活動",
];

const employeePersonalInfoPurposes = [
    "①福利厚生の提供",
    "②就業に関する労務管理事務",
    "③教育・研修・カウンセリング",
    "④緊急時の安全確認等に係る連絡",
    "⑤法令に基づく対応",
];

const securityMeasures = [
    "個人情報への不正アクセス、個人情報の紛失、破壊、改ざん、漏えい等を防止するために、合理的で適切な安全対策、予防策等の実施に努めます。",
    "万が一個人情報における事故が発生した場合、迅速に調査を行い、是正に努めます。",
];

export default function PrivacyPage() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-white py-14 md:py-24">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-orange-200/20 blur-3xl" />
                <div className="absolute -right-20 bottom-12 h-72 w-72 rounded-full bg-sky-200/20 blur-3xl" />
            </div>
            <div className="relative mx-auto w-full max-w-5xl px-4">
                <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur md:p-10">
                    <div className="border-b border-slate-200 pb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">プライバシーポリシー</h1>
                        <p className="mt-6 text-sm leading-7 text-slate-700 md:text-base">
                            株式会社ネクストレベル（以下「当社」といいます。）は個人情報の保護を重要な責務と認識し、以下のとおりプライバシーポリシーを制定します。当社において個人情報に関わる全職員がこれを理解し実践することにより、皆様から信頼される企業を目指します。
                        </p>
                    </div>

                    <div className="mt-8 space-y-5">
                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">個人情報の収集及び利用目的について</h2>
                            <p className="mt-4 text-sm leading-7 text-slate-700 md:text-base">
                                当社は適法かつ適切な手段により、個人情報の収集及び利用を行います。個人情報の利用目的は以下のとおりとします。
                            </p>

                            <div className="mt-4 space-y-5 text-sm leading-7 text-slate-700 md:text-base">
                                <div className="rounded-xl bg-white p-4 shadow-sm">
                                    <p className="font-medium text-slate-900">1.登録スタッフの方及びスタッフ登録手続を行われる方の個人情報</p>
                                    <ul className="mt-2 list-disc space-y-1.5 pl-6 marker:text-slate-500">
                                        {staffPersonalInfoPurposes.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="rounded-xl bg-white p-4 shadow-sm">
                                    <p className="font-medium text-slate-900">2.当社のお取引関係先の個人情報</p>
                                    <ul className="mt-2 list-disc space-y-1.5 pl-6 marker:text-slate-500">
                                        {businessPartnerPersonalInfoPurposes.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="rounded-xl bg-white p-4 shadow-sm">
                                    <p className="font-medium text-slate-900">3.当社へ入社された方及びそのご家族</p>
                                    <ul className="mt-2 list-disc space-y-1.5 pl-6 marker:text-slate-500">
                                        {employeePersonalInfoPurposes.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">個人情報の管理方法、安全対策について</h2>
                            <p className="mt-4 text-sm leading-7 text-slate-700 md:text-base">
                                当社は、個人情報を安全かつ正確に管理するために、次のような対策を講じています。
                            </p>
                            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-sm leading-7 text-slate-700 marker:text-slate-500 md:text-base">
                                {securityMeasures.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">個人情報の第三者への開示について</h2>
                            <p className="mt-4 text-sm leading-7 text-slate-700 md:text-base">
                                当社は、法令等で認められている場合を除き、本人の事前の同意なく個人データを第三者に提供いたしません。
                            </p>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">個人情報の共同利用</h2>
                            <p className="mt-4 text-sm leading-7 text-slate-700 md:text-base">
                                当社は、当社グループ企業その他第三者と共同して事業活動を行うとき、その活動に必要な個人データを共同利用することがあります。このとき、あらかじめデータ項目、利用者の範囲、利用目的及び管理責任者を明確にし、ご本人に通知又は公表します。
                            </p>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">本ポリシーの変更</h2>
                            <p className="mt-4 text-sm leading-7 text-slate-700 md:text-base">
                                当社は、個人情報の取扱いに関する運用状況を適宜見直し、継続的な改善に努めるものとし、必要に応じて本ポリシーを変更することがあります。また、法令上、ご本人の同意が必要となるような内容の変更を行うときは、別途当社が定める方法により、ご本人の同意を得ることとします。
                            </p>
                            <p className="mt-4 text-sm leading-7 text-slate-700 md:text-base">
                                変更後の本ポリシーについては、当社ウェブサイト上での表示その他の適切な方法により周知し、又はご本人に通知します。
                            </p>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">個人情報の開示等及び相談・苦情のお申出先について</h2>
                            <p className="mt-4 text-sm leading-7 text-slate-700 md:text-base">
                                個人情報の開示等（開示、訂正、追加、削除、利用停止）をお求めの方及び個人情報に関する相談・苦情は、下記Emailアドレスまでご連絡をお願いいたします。なお、お申出への対応に際しては、ご本人又はその代理人であることを確認させていただきます。
                            </p>
                            <p className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 md:text-base">ご連絡先：support@e-nextlevel.jp</p>
                        </section>
                    </div>
                </div>
            </div>
        </section>
    );
}
