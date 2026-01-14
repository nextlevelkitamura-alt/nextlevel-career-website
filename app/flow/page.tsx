"use client";

import { FileText, Building, Smile, UserCheck, Phone, Video, Users, Clock, CheckCircle, MessageCircle, ArrowRight, Shield, Zap, Heart, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

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

const testimonials = [
    {
        name: "K.S さん",
        age: "24歳女性",
        category: "事務職",
        comment: "思っていたより給与が高くなりました！前職より月5万円アップで、本当に驚きました。残業も減って自分の時間が増えたのが嬉しいです。",
        image: "/images/testimonials/woman1.png",
        rating: 5,
    },
    {
        name: "T.M さん",
        age: "32歳男性",
        category: "営業職",
        comment: "一般には公開されていない非公開求人の中に、まさに自分が探していた条件の仕事がありました。自分一人では絶対に見つけられなかったと思います。",
        image: "/images/testimonials/man1.png",
        rating: 5,
    },
    {
        name: "A.Y さん",
        age: "26歳女性",
        category: "企画・マーケティング",
        comment: "担当の方が親身になって相談に乗ってくれました。初めての転職で不安でしたが、丁寧な面接対策のおかげで自信を持って臨めました。",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
        rating: 5,
    },
    {
        name: "H.N さん",
        age: "29歳女性",
        category: "ITエンジニア",
        comment: "未経験からの挑戦でしたが、研修制度が整っている企業を紹介してもらえました。新しいスキルが身につく環境で働けて毎日が充実しています。",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
        rating: 5,
    },
    {
        name: "R.K さん",
        age: "25歳男性",
        category: "販売・サービス",
        comment: "入社日の調整や年収交渉まで全てお任せできたのが助かりました。働きながらの転職活動もスムーズに進められました。",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        rating: 5,
    },
    {
        name: "M.I さん",
        age: "34歳女性",
        category: "人事・総務",
        comment: "キャリアプランの相談から乗ってもらい、長期的な視点で企業を選べました。将来のビジョンが明確になりました。",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        rating: 5,
    },
    {
        name: "Y.T さん",
        age: "27歳女性",
        category: "Webデザイナー",
        comment: "紹介された求人の質は高かったですが、もう少し選択肢の幅が広いと良かったかなと思います。ただ、結果的には良い企業に出会えました。",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
        rating: 4,
    },
    {
        name: "S.O さん",
        age: "28歳男性",
        category: "コンサルタント",
        comment: "サポートは手厚かったですが、連絡の頻度がもう少し少なくても良いかなと感じました。熱心さは伝わりました。",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        rating: 4,
    },
    {
        name: "N.F さん",
        age: "31歳女性",
        category: "医療事務",
        comment: "希望条件に合う求人が見つかるまで少し時間がかかりましたが、最後まで根気強く探してくれたおかげで納得のいく転職ができました。",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
        rating: 4,
    },
];

const faqs = [
    {
        question: "登録は無料ですか？",
        answer: "はい、完全無料です。登録から内定・入社まで、一切費用はかかりません。",
    },
    {
        question: "登録後にしつこく連絡が来ませんか？",
        answer: "ご安心ください。ご希望に合わせた連絡頻度で対応いたします。「自分のペースで進めたい」という方には、必要なときだけご連絡します。",
    },
    {
        question: "途中でキャンセルできますか？",
        answer: "もちろん可能です。いつでもお気軽にお申し出ください。",
    },
    {
        question: "未経験でも大丈夫ですか？",
        answer: "はい、未経験の方も多くご利用いただいています。未経験OKの求人も多数ご紹介しています。",
    },
    {
        question: "相談はどのような形式でできますか？",
        answer: "電話、オンライン、対面など、ご希望に合わせて柔軟に対応いたします。基本的には電話での相談で、所要時間は約30分です。",
    },
    {
        question: "入社後もサポートしてもらえますか？",
        answer: "はい、入社後もお困りのことがあればいつでもご相談いただけます。次の転職についてもサポートいたします。",
    },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-slate-200 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-5 flex justify-between items-center text-left hover:text-primary-600 transition-colors"
            >
                <span className="font-bold text-slate-900 pr-4">{question}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <p className="pb-5 text-slate-600 leading-relaxed">{answer}</p>
            </motion.div>
        </div>
    );
}

function TestimonialCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-scroll every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    // Get 3 testimonials to display
    const getVisibleTestimonials = () => {
        const items = [];
        for (let i = 0; i < 3; i++) {
            const index = (currentIndex + i) % testimonials.length;
            items.push({ ...testimonials[index], originalIndex: index });
        }
        return items;
    };

    return (
        <div className="relative max-w-5xl mx-auto">
            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-primary-600 hover:shadow-xl transition-all"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-600 hover:text-primary-600 hover:shadow-xl transition-all"
            >
                <ChevronRight className="w-5 h-5" />
            </button>

            {/* Carousel Items */}
            <div className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {getVisibleTestimonials().map((testimonial, i) => (
                            <motion.div
                                key={`${testimonial.originalIndex}-${currentIndex}`}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3, delay: i * 0.1 }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
                            >
                                <p className="text-slate-700 mb-5 leading-relaxed min-h-[80px]">&ldquo;{testimonial.comment}&rdquo;</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 relative">
                                        <Image
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{testimonial.name}</p>
                                        <p className="text-xs text-slate-500">{testimonial.age} / {testimonial.category}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-primary-600 w-6" : "bg-slate-300 hover:bg-slate-400"}`}
                    />
                ))}
            </div>
        </div>
    );
}

export default function FlowPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-primary-50 to-white pt-20 pb-16">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 text-xs font-bold rounded-full mb-4">
                            SERVICE FLOW
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            サービスの流れ
                        </h1>
                        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            登録から入社まで、あなたのペースに合わせてサポートします。<br className="hidden sm:inline" />
                            すべて無料でご利用いただけます。
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
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
                                    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                                        <step.icon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                                                STEP {step.number}
                                            </span>
                                            <span className="text-xs text-slate-400">{step.subtitle}</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h2>
                                        <p className="text-slate-600 mb-6 leading-relaxed">{step.description}</p>

                                        {/* Details */}
                                        {step.details && (
                                            <div className="bg-slate-50 rounded-xl p-5 mb-4">
                                                <div className="grid gap-3">
                                                    {step.details.map((detail, i) => (
                                                        <div key={i} className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                                                                <detail.icon className="w-4 h-4 text-primary-600" />
                                                            </div>
                                                            <span className="text-slate-700">{detail.text}</span>
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
                                                        className={`p-5 rounded-xl border-2 ${option.highlight
                                                            ? "border-primary-200 bg-primary-50/50"
                                                            : i === 1
                                                                ? "border-blue-200 bg-blue-50/50"
                                                                : "border-slate-200 bg-slate-50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${option.highlight
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
                                                            <h3 className="font-bold text-slate-900">{option.title}</h3>
                                                            {option.highlight && (
                                                                <span className="text-[10px] bg-primary-600 text-white px-2 py-0.5 rounded-full font-bold">
                                                                    おすすめ
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-600 mb-4">{option.description}</p>
                                                        <div className="space-y-2">
                                                            {option.features.map((feature, j) => (
                                                                <div key={j} className="flex items-center gap-2 text-sm text-slate-600">
                                                                    <feature.icon className={`w-4 h-4 ${i === 1 ? "text-blue-400" : "text-slate-400"}`} />
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
                                            <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 flex gap-3">
                                                <Zap className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-primary-800 font-medium">{step.highlight}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="text-primary-600 font-bold tracking-widest text-xs block mb-2">VOICE</span>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">利用者の声</h2>
                        <p className="text-slate-600">実際にサービスをご利用いただいた方々の声をご紹介します。</p>
                    </div>

                    <TestimonialCarousel />
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="text-primary-600 font-bold tracking-widest text-xs block mb-2">FAQ</span>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">よくある質問</h2>
                    </div>

                    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                        {faqs.map((faq, index) => (
                            <FAQItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-700">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            あなたのキャリアを、次のレベルへ。
                        </h2>
                        <p className="text-primary-100 mb-8 max-w-xl mx-auto">
                            登録は無料、1分で完了します。<br />
                            まずは非公開求人をチェックしてみませんか？
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button asChild size="lg" className="bg-white text-primary-700 hover:bg-primary-50 font-bold text-lg h-14 px-8 rounded-xl shadow-lg">
                                <Link href="/register">
                                    無料で会員登録
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" className="bg-primary-800 text-white hover:bg-primary-900 border-2 border-primary-500 font-bold h-14 px-8 rounded-xl">
                                <Link href="/jobs">
                                    求人を見る
                                </Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
