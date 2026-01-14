"use client";

import { FileText, Building, Smile, UserCheck, Phone, Video, Users, Clock, CheckCircle, MessageCircle, ArrowRight, Shield, Zap, Heart } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "./ui/button";

const steps = [
    {
        number: 1,
        title: "会員登録",
        subtitle: "たった1分で完了",
        description: "Webから簡単に登録できます。必要な情報は、お名前・メールアドレス・電話番号のみ。",
        icon: FileText,
        color: "from-blue-500 to-blue-600",
        details: [
            { icon: Clock, text: "登録は約1分で完了" },
            { icon: CheckCircle, text: "名前・メール・電話番号のみでOK" },
            { icon: Zap, text: "登録後すぐに非公開求人が見られる" },
        ],
        highlight: "登録するとすぐに、一般には公開されていない非公開求人を閲覧できます。",
    },
    {
        number: 2,
        title: "選べる活動スタイル",
        subtitle: "あなたに合った進め方で",
        description: "ご希望に合わせて、2つの活動スタイルから選べます。",
        icon: UserCheck,
        color: "from-primary-500 to-primary-600",
        options: [
            {
                title: "アドバイザーに相談",
                description: "非公開求人の提案や選考対策など、プロがフルサポート。最新の求人情報をいち早くご案内し、他の候補者より先に書類を提出できます。",
                icon: UserCheck,
                highlight: true,
                features: [
                    { icon: Phone, text: "電話相談（約30分）" },
                    { icon: Video, text: "オンライン対応可能" },
                    { icon: Users, text: "対面相談も柔軟に対応" },
                ],
            },
            {
                title: "自分で求人を探す",
                description: "サイトから直接応募。自分のペースで進めたい方におすすめです。",
                icon: FileText,
                highlight: false,
                features: [
                    { icon: CheckCircle, text: "自分のペースで活動" },
                    { icon: Zap, text: "気になる求人にすぐ応募" },
                ],
            },
        ],
    },
    {
        number: 3,
        title: "選考・面接",
        subtitle: "万全のサポート体制",
        description: "書類選考から面接まで、私たちがしっかりサポートします。",
        icon: Building,
        color: "from-green-500 to-green-600",
        details: [
            { icon: FileText, text: "履歴書・職務経歴書の添削" },
            { icon: MessageCircle, text: "面接対策（電話・オンライン・対面）" },
            { icon: Clock, text: "日程調整はすべてお任せ" },
        ],
        highlight: "面接の日程調整はすべて私たちが代行。あなたは面接に集中するだけでOKです。",
    },
    {
        number: 4,
        title: "内定・入社",
        subtitle: "入社後もサポート継続",
        description: "条件交渉から入社後のフォローまで、長期的にサポートします。",
        icon: Smile,
        color: "from-yellow-500 to-orange-500",
        details: [
            { icon: Shield, text: "給与・条件の交渉代行" },
            { icon: Heart, text: "入社後のお悩み相談" },
            { icon: ArrowRight, text: "次の転職もサポート" },
        ],
        highlight: "入社後も困ったことがあればいつでもご相談ください。次のキャリアについてもサポートいたします。",
    },
];

export default function Flow() {
    return (
        <section id="flow" className="py-24 bg-slate-50 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-primary-600 font-bold tracking-widest text-xs block mb-2">FLOW</span>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            ご利用の流れ
                        </h2>
                        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            登録から入社まで、専任アドバイザーがあなたのペースに合わせて徹底サポート。<br className="hidden sm:inline" />
                            面倒な日程調整や条件交渉もお任せください。すべて無料でご利用いただけます。
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-4xl mx-auto space-y-16">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="relative"
                        >
                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-8 top-24 w-0.5 h-[calc(100%+4rem)] bg-gradient-to-b from-slate-200 to-transparent hidden md:block" />
                            )}

                            <div className="flex gap-6 md:gap-10">
                                {/* Step Number */}
                                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg relative z-10`}>
                                    <step.icon className="w-8 h-8 text-white" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                                            STEP {step.number}
                                        </span>
                                        <span className="text-xs text-slate-400">{step.subtitle}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-slate-600 mb-6 leading-relaxed">{step.description}</p>

                                    {/* Details */}
                                    {step.details && (
                                        <div className="bg-slate-50 rounded-xl p-5 mb-4">
                                            <div className="grid gap-3">
                                                {step.details.map((detail, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                                            <detail.icon className="w-4 h-4 text-primary-600" />
                                                        </div>
                                                        <span className="text-slate-700 font-medium text-sm">{detail.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Options (for Step 2) */}
                                    {step.options && (
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            {step.options.map((option, i) => (
                                                <div
                                                    key={i}
                                                    className={`p-5 rounded-xl border-2 transition-all ${option.highlight
                                                            ? "border-primary-200 bg-primary-50/50"
                                                            : i === 1
                                                                ? "border-blue-200 bg-blue-50/50"
                                                                : "border-slate-200 bg-slate-50"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${option.highlight
                                                                ? "bg-primary-100"
                                                                : i === 1
                                                                    ? "bg-blue-100"
                                                                    : "bg-slate-200"
                                                            }`}>
                                                            <option.icon className={`w-4 h-4 ${option.highlight
                                                                    ? "text-primary-600"
                                                                    : i === 1
                                                                        ? "text-blue-600"
                                                                        : "text-slate-500"
                                                                }`} />
                                                        </div>
                                                        <h3 className="font-bold text-slate-900 text-sm md:text-base">{option.title}</h3>
                                                        {option.highlight && (
                                                            <span className="text-[10px] bg-primary-600 text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                                                                おすすめ
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs md:text-sm text-slate-600 mb-4">{option.description}</p>
                                                    <div className="space-y-2">
                                                        {option.features.map((feature, j) => (
                                                            <div key={j} className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
                                                                <feature.icon className={`w-3 h-3 md:w-4 md:h-4 flex-shrink-0 ${i === 1 ? "text-blue-400" : "text-slate-400"}`} />
                                                                <span>{feature.text}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Highlight Box */}
                                    {step.highlight && (
                                        <div className="bg-orange-50/80 border border-orange-100 rounded-lg p-4 flex gap-3">
                                            <Zap className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-orange-800 font-medium">{step.highlight}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Button asChild size="lg" className="bg-primary-600 hover:bg-primary-700 text-white font-bold h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <Link href="/flow">
                            サービスの流れを詳しく見る <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
