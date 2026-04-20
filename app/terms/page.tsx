import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "利用規約",
    description: "株式会社ネクストレベルのサービス利用規約です。",
};

export default function TermsPage() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-white py-14 md:py-24">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-orange-200/20 blur-3xl" />
                <div className="absolute -right-20 bottom-12 h-72 w-72 rounded-full bg-sky-200/20 blur-3xl" />
            </div>
            <div className="relative mx-auto w-full max-w-5xl px-4">
                <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur md:p-10">
                    <div className="border-b border-slate-200 pb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">利用規約</h1>
                        <p className="mt-6 text-sm leading-7 text-slate-700 md:text-base">
                            この利用規約（以下「本規約」といいます。）は、株式会社ネクストレベル（以下「当社」といいます。）が提供するウェブサイト「ネクストレベルキャリア」（以下「本サービス」といいます。）の利用条件を定めるものです。ご利用の皆さま（以下「ユーザー」といいます。）には、本規約に従って本サービスをご利用いただきます。
                        </p>
                    </div>

                    <div className="mt-8 space-y-5">
                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">第1条（適用）</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700 md:text-base">
                                <p>1. 本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。</p>
                                <p>2. 当社は本サービスに関し、本規約のほか、利用にあたってのルール等、各種の定め（以下「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。</p>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">第2条（利用登録）</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700 md:text-base">
                                <p>1. 本サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。</p>
                                <p>2. 当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。</p>
                                <ul className="mt-2 list-disc space-y-1.5 pl-6 marker:text-slate-500">
                                    <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                                    <li>本規約に違反したことがある者からの申請である場合</li>
                                    <li>その他、当社が利用登録を相当でないと判断した場合</li>
                                </ul>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">第3条（Googleアカウントによる認証）</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700 md:text-base">
                                <p>1. 本サービスでは、Googleアカウントを利用した認証（以下「Google認証」といいます。）を提供しています。</p>
                                <p>2. Google認証を利用する場合、ユーザーはGoogleの利用規約及びプライバシーポリシーにも同意するものとします。</p>
                                <p>3. 当社がGoogle認証を通じて取得する情報は、メールアドレス及びプロフィール情報（氏名、プロフィール画像）に限られます。</p>
                                <p>4. 取得した情報は、本サービスにおけるユーザーの識別及びサービスの提供のみに使用し、当社のプライバシーポリシーに従い適切に管理します。</p>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">第4条（禁止事項）</h2>
                            <div className="mt-4 text-sm leading-7 text-slate-700 md:text-base">
                                <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
                                <ul className="mt-2 list-disc space-y-1.5 pl-6 marker:text-slate-500">
                                    <li>法令または公序良俗に違反する行為</li>
                                    <li>犯罪行為に関連する行為</li>
                                    <li>当社のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                                    <li>当社のサービスの運営を妨害するおそれのある行為</li>
                                    <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                                    <li>他のユーザーに成りすます行為</li>
                                    <li>当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                                    <li>その他、当社が不適切と判断する行為</li>
                                </ul>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">第5条（本サービスの提供の停止等）</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700 md:text-base">
                                <p>当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。</p>
                                <ul className="mt-2 list-disc space-y-1.5 pl-6 marker:text-slate-500">
                                    <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                                    <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                                    <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                                    <li>その他、当社が本サービスの提供が困難と判断した場合</li>
                                </ul>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">第6条（免責事項）</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700 md:text-base">
                                <p>1. 当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。</p>
                                <p>2. 当社は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。</p>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">第7条（サービス内容の変更等）</h2>
                            <p className="mt-4 text-sm leading-7 text-slate-700 md:text-base">
                                当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
                            </p>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">第8条（利用規約の変更）</h2>
                            <p className="mt-4 text-sm leading-7 text-slate-700 md:text-base">
                                当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。変更後の利用規約は、当社ウェブサイトに掲載したときから効力を生じるものとします。
                            </p>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">第9条（準拠法・裁判管轄）</h2>
                            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700 md:text-base">
                                <p>1. 本規約の解釈にあたっては、日本法を準拠法とします。</p>
                                <p>2. 本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。</p>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:p-7">
                            <h2 className="border-l-4 border-slate-900 pl-3 text-xl font-bold text-slate-900">お問い合わせ</h2>
                            <p className="mt-4 text-sm leading-7 text-slate-700 md:text-base">
                                本規約に関するお問い合わせは、下記までご連絡ください。
                            </p>
                            <p className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 md:text-base">ご連絡先：support@e-nextlevel.jp</p>
                        </section>
                    </div>
                </div>
            </div>
        </section>
    );
}
