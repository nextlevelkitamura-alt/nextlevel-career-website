import Link from 'next/link';
import type { ReactNode } from 'react';

type CompanyItem = {
    label: string;
    value: ReactNode;
};

const businessItems = [
    '短期人材サービス事業',
    'イベント施工サービス',
    'イベント運営サービス',
    '内装施工サービス',
    '軽作業、各種請負サービス',
    '一般派遣労働者派遣事業',
    '求人広告取扱事業',
    '有料職業紹介事業',
];

const allianceItems = [
    '大阪青年会議所',
    '京都商工会議所',
    '関西活性化プロジェクト',
    '高付加価値型アウトソーシング研究会',
];

const companyItems: CompanyItem[] = [
    {
        label: '会社名',
        value: '株式会社ネクストレベル',
    },
    {
        label: '設立日',
        value: '2008年7月1日',
    },
    {
        label: '資本金',
        value: '1億2000万円（内資本準備金4000万）',
    },
    {
        label: '役員',
        value: (
            <ul className="space-y-2">
                <li>志村 康雄（業務請負総責任者）</li>
                <li>山口 大輝（派遣事業部総責任者）</li>
            </ul>
        ),
    },
    {
        label: '本社所在地',
        value: '東京本社　〒160-0023　東京都新宿区西新宿3丁目2-7 KDX新宿ビル11F',
    },
    {
        label: 'メールアドレス',
        value: (
            <a href="mailto:info@e-nextlevel.jp" className="text-primary-700 hover:text-primary-800 underline underline-offset-2">
                info@e-nextlevel.jp
            </a>
        ),
    },
    {
        label: '決算期',
        value: '6月',
    },
    {
        label: '業務内容',
        value: (
            <ul className="space-y-2">
                {businessItems.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 shrink-0 rotate-45 bg-primary-500" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        ),
    },
    {
        label: '営業時間',
        value: '10:00～19:00',
    },
    {
        label: '認許可',
        value: (
            <ul className="space-y-2">
                <li>一般労働者派遣事業（許可証：派27-302098）</li>
                <li>有料職業紹介事業（許可証：27-ユ-302821）</li>
            </ul>
        ),
    },
    {
        label: 'キャリアコンサルティング',
        value: 'キャリアコンサルティング詳細資料',
    },
    {
        label: '加入保険',
        value: '朝日火災海上保険株式会社（対人・対物） / あいおいニッセイ同和損害保険株式会社（業務災害）',
    },
    {
        label: '加盟団体',
        value: (
            <ul className="space-y-2">
                {allianceItems.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        ),
    },
];

export default function CompanyPage() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-100/60 via-primary-50/40 to-white py-14 md:py-24">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-primary-200/35 blur-3xl" />
                <div className="absolute -right-20 bottom-12 h-72 w-72 rounded-full bg-primary-300/25 blur-3xl" />
            </div>

            <div className="relative mx-auto w-full max-w-6xl px-4">
                <div className="rounded-3xl border border-primary-100 bg-white/95 p-6 shadow-[0_24px_80px_-40px_rgba(234,88,12,0.28)] backdrop-blur md:p-10">
                    <div className="flex items-center gap-5 pb-6 md:gap-8 md:pb-8">
                        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-300 to-transparent" />
                        <h1 className="text-3xl font-bold tracking-tight text-primary-600 md:text-5xl">会社概要</h1>
                        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-300 to-transparent" />
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white">
                        <dl className="divide-y divide-dashed divide-primary-100">
                            {companyItems.map((item, index) => (
                                <div
                                    key={item.label}
                                    className={`grid gap-3 px-5 py-5 transition-colors md:grid-cols-[220px_1fr] md:gap-8 md:px-8 md:py-7 ${index % 2 === 0 ? 'bg-white' : 'bg-primary-50/20'}`}
                                >
                                    <dt className="text-xl font-bold text-secondary-800">{item.label}</dt>
                                    <dd className="text-lg leading-8 text-secondary-700">{item.value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className="mt-8 text-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm shadow-primary-600/30 transition-colors hover:bg-primary-700"
                        >
                            トップページに戻る
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
