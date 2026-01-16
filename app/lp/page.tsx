"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
// // import { createClient } from "@/utils/supabase/client"; // Improved import
import { Check, ChevronRight, ChevronLeft, Star, Search, Briefcase, Shield, Clock, TrendingUp, Users, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterLPPage() {
    const [currentStep, setCurrentStep] = useState(0); // 0 = LP view, 1-3 = form steps
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        lastName: "",
        firstName: "",
        lastNameKana: "",
        firstNameKana: "",
        birthYear: "",
        birthMonth: "",
        birthDay: "",
        email: "",
        password: "",
        prefecture: "",
        period: "",
        phoneNumber: "",
    });

    const totalSteps = 4;

    const handleStartRegistration = () => {
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (currentStep === 1) {
            setCurrentStep(0);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - 18 - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const prefectures = [
        "東京都", "神奈川県", "埼玉県", "千葉県", "茨城県", "栃木県", "群馬県",
        "大阪府", "京都府", "兵庫県", "奈良県", "愛知県", "福岡県", "北海道", "その他"
    ];

    const periods = ["すぐにでも", "1ヶ月以内", "3ヶ月以内", "未定"];

    // Step 1: Account
    const canProceedStep1 = formData.email && formData.password && formData.password.length >= 8;

    // Step 2: Name & Kana
    const canProceedStep2 = formData.lastName && formData.firstName &&
        formData.lastNameKana && formData.firstNameKana;

    // Step 3: DOB & Prefecture
    const canProceedStep3 = formData.birthYear && formData.birthMonth && formData.birthDay;

    // Step 4: Phone & Period
    // Step 4: Phone & Period
    const canProceedStep4 = formData.phoneNumber;

    const handleSubmit = async () => {
        const requiredFields = [
            formData.lastName, formData.firstName,
            formData.lastNameKana, formData.firstNameKana,
            formData.birthYear, formData.birthMonth, formData.birthDay,
            formData.email, formData.password, formData.phoneNumber
        ];

        if (requiredFields.some(field => !field)) {
            alert("すべての必須項目を入力してください。");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { signup } = await import("../auth/actions");
            const result = await signup(formData);

            if (result?.error) {
                alert(result.error);
                setError(result.error);
                setIsLoading(false);
            } else if (result?.success) {
                // 登録完了後、メインサイトへ遷移
                window.location.href = "/jobs";
            }
        } catch {
            const msg = "予期せぬエラーが発生しました。";
            alert(msg);
            setError(msg);
            setIsLoading(false);
        }
    };

    // Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    } as const;

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    } as const;

    // LP View (Step 0)
    if (currentStep === 0) {
        return (
            <div className="min-h-screen bg-white font-sans text-slate-900">
                {/* LP Header */}
                <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
                    <div className="w-full flex h-16 items-center justify-between px-4 md:px-8">
                        <div className="flex items-center space-x-2">
                            <Image
                                src="/logo_large.png"
                                alt="Next Level Career"
                                width={200}
                                height={60}
                                className="h-10 w-auto object-contain"
                                priority
                            />
                        </div>
                        <Link
                            href="/login"
                            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-full text-sm transition-colors shadow-sm"
                        >
                            ログイン
                        </Link>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden">
                    {/* Background Image with Overlay */}
                    <motion.div
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, ease: "linear" }}
                        className="absolute inset-0 z-0"
                    >
                        <Image
                            src="/images/hero-bg.png"
                            alt="Background"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/30" />
                    </motion.div>

                    <div className="container mx-auto px-4 relative z-10 text-center text-white">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="max-w-4xl mx-auto"
                        >
                            <motion.h1
                                variants={fadeInUp}
                                className="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-md tracking-tight px-2"
                            >
                                あなたの理想の働き方を、<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">一緒に見つけましょう</span>
                            </motion.h1>
                            <motion.p
                                variants={fadeInUp}
                                className="text-base sm:text-lg lg:text-2xl text-white/90 mb-10 font-medium drop-shadow-sm px-4"
                            >
                                非公開求人多数<br className="sm:hidden" />専任アドバイザーが徹底サポート
                            </motion.p>
                            <motion.div variants={fadeInUp}>
                                <Button
                                    onClick={handleStartRegistration}
                                    size="lg"
                                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xl h-16 px-12 rounded-full shadow-2xl shadow-orange-500/30 transform transition-all hover:scale-105 active:scale-95 border-2 border-white/20 backdrop-blur-sm"
                                >
                                    無料会員登録（60秒）
                                    <ChevronRight className="ml-2 w-6 h-6" />
                                </Button>
                                <p className="text-sm text-white/70 mt-4 font-light">
                                    ※ 登録・サービス利用は完全無料です
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Wave Divider */}
                    <div className="absolute bottom-0 left-0 right-0 z-20">
                        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto text-white fill-current">
                            <path d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 40C840 50 960 70 1080 75C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V60Z" />
                        </svg>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-50 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-50"></div>

                    <div className="container mx-auto px-4 relative z-10">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeInUp}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                                NEXT LEVEL CAREERの<span className="text-primary-600">3つの強み</span>
                            </h2>
                            <p className="text-slate-500">選ばれ続ける理由があります</p>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                        >
                            {[
                                {
                                    icon: Search,
                                    title: "非公開求人多数",
                                    description: "一般には公開されていない、高待遇・好条件のプレミア求人を多数保有しています。",
                                    color: "bg-blue-50 text-blue-600"
                                },
                                {
                                    icon: Briefcase,
                                    title: "専任アドバイザー",
                                    description: "業界に精通したプロのアドバイザーが、あなたのキャリアプランに伴走します。",
                                    color: "bg-orange-50 text-orange-600"
                                },
                                {
                                    icon: Clock,
                                    title: "スピード対応",
                                    description: "応募から2営業日以内にご連絡。お待たせすることなくスムーズな転職活動を支援します。",
                                    color: "bg-green-50 text-green-600"
                                }
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    whileHover={{ y: -10, transition: { duration: 0.2 } }}
                                    className="bg-white rounded-2xl p-10 text-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-50 relative group"
                                >
                                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="w-10 h-10" />
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-900 mb-4">{feature.title}</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm">{feature.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Job Categories */}
                <section className="py-20 bg-slate-50 border-t border-slate-100">
                    <div className="container mx-auto px-4 text-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-8">
                                豊富な職種から選べます
                            </h2>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                            className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto mb-8"
                        >
                            {["事務", "コールセンター", "営業", "IT・エンジニア", "クリエイティブ", "販売・接客", "製造・軽作業", "医療・介護", "リモート"].map((cat) => (
                                <motion.span
                                    key={cat}
                                    variants={fadeInUp}
                                    whileHover={{ scale: 1.05, backgroundColor: "#fff", borderColor: "#cbd5e1" }}
                                    className="px-6 py-3 bg-white border border-slate-200 rounded-full text-base font-medium text-slate-700 shadow-sm cursor-default transition-colors"
                                >
                                    {cat}
                                </motion.span>
                            ))}
                        </motion.div>
                        <p className="text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                            <Search className="w-4 h-4" /> その他にも多数ご用意
                        </p>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="py-24 bg-white relative">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-5xl mx-auto">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={staggerContainer}
                                className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100"
                            >
                                <motion.div variants={fadeInUp} className="space-y-4 py-8 md:py-0">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-2">
                                        <Award className="w-8 h-8 text-primary-600" />
                                    </div>
                                    <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">85<span className="text-3xl">%</span></div>
                                    <p className="text-slate-900 font-bold tracking-wide">非公開求人比率</p>
                                    <p className="text-xs text-slate-500">一般公開されない好条件求人が多数</p>
                                </motion.div>
                                <motion.div variants={fadeInUp} className="space-y-4 py-8 md:py-0">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-full mb-2">
                                        <Users className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">98<span className="text-3xl">%</span></div>
                                    <p className="text-slate-900 font-bold tracking-wide">ユーザー満足度</p>
                                    <p className="text-xs text-slate-500">丁寧なヒアリングと提案力が好評</p>
                                </motion.div>
                                <motion.div variants={fadeInUp} className="space-y-4 py-8 md:py-0">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mb-2">
                                        <TrendingUp className="w-8 h-8 text-green-500" />
                                    </div>
                                    <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400">24h<span className="text-3xl">以内</span></div>
                                    <p className="text-slate-900 font-bold tracking-wide">初回連絡スピード</p>
                                    <p className="text-xs text-slate-500">お待たせしない迅速な対応</p>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Testimonial */}
                <section className="py-24 bg-slate-50 border-t border-slate-200">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                                ご利用者の声
                            </h2>
                            <p className="text-slate-500">
                                実際にサービスを利用して転職に成功された方の声をご紹介します
                            </p>
                        </motion.div>

                        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                            {/* User K */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-3xl p-8 lg:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>
                                <div className="relative z-10">
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-700 mb-8 leading-relaxed font-medium text-lg">
                                        「初めての転職で不安ばかりでしたが、担当の方がとても親身になって話を聞いてくれました。自分の強みを見つけてくださり、思ってもみなかった大手企業から内定をいただくことができました。」
                                    </p>
                                    <div className="flex items-center gap-5 border-t border-slate-100 pt-6">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-100 shadow-sm shrink-0">
                                            <Image src="/images/user-k.png" alt="Kさん" width={64} height={64} className="object-cover w-full h-full" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xl text-slate-900">Kさん</p>
                                            <p className="text-sm text-slate-500 font-medium">20代前半 / 営業職へ転職</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* User M */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeInUp}
                                transition={{ delay: 0.2 }}
                                whileHover={{ y: -5 }}
                                className="bg-white rounded-3xl p-8 lg:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>
                                <div className="relative z-10">
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-slate-700 mb-8 leading-relaxed font-medium text-lg">
                                        「フルリモートでの働き方を希望していましたが、なかなか条件に合う求人が見つかりませんでした。こちらに登録してすぐに非公開求人を紹介していただき、年収もアップして大満足です。」
                                    </p>
                                    <div className="flex items-center gap-5 border-t border-slate-100 pt-6">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-100 shadow-sm shrink-0">
                                            <Image src="/images/user-m.png" alt="Mさん" width={64} height={64} className="object-cover w-full h-full" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-xl text-slate-900">Mさん</p>
                                            <p className="text-sm text-slate-500 font-medium">30代前半 / 事務職へ転職</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/30"></div>

                    <div className="container mx-auto px-4 text-center relative z-10">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <h2 className="text-3xl lg:text-5xl font-extrabold mb-6 tracking-tight">
                                まずは無料登録から始めましょう
                            </h2>
                            <p className="text-slate-300 mb-10 max-w-xl mx-auto text-lg">
                                簡単60秒で登録完了。<br />登録後すぐに非公開求人をご覧いただけます。
                            </p>
                            <Button
                                onClick={handleStartRegistration}
                                size="lg"
                                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xl h-16 px-16 rounded-full shadow-2xl shadow-orange-500/30 transform transition-all hover:scale-105 active:scale-95"
                            >
                                無料会員登録する
                                <ChevronRight className="ml-2 w-6 h-6" />
                            </Button>
                            <div className="flex flex-wrap justify-center gap-4 lg:gap-8 mt-12 text-sm text-slate-400 font-medium">
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                    <Shield className="w-4 h-4 text-green-400" /> 登録無料
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                    <Clock className="w-4 h-4 text-blue-400" /> 60秒で完了
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                    <Briefcase className="w-4 h-4 text-amber-400" /> 非公開求人多数
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>


            </div>
        );
    }

    // Registration Form View (Steps 1-3)
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-xl">
                {/* Header Title for Register */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-8">会員登録</h1>
                </div>

                {/* Progress Bar */}
                {/* Progress Bar */}
                <div className="mb-8">
                    {currentStep === 1 ? (
                        /* Step 1: Account Creation */
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">アカウント作成</h2>
                            <p className="text-sm text-slate-500 mt-2">まずはメールアドレスとパスワードを入力してください</p>
                        </div>
                    ) : (
                        /* Steps 2-4: Profile Completion */
                        <>
                            <div className="mb-6 bg-primary-50 border border-primary-100 rounded-lg p-4 text-center animate-pulse">
                                <p className="text-primary-800 font-bold text-sm sm:text-base">
                                    🎉 アカウント作成完了！あと3ステップで完了です
                                </p>
                            </div>
                            <div className="flex justify-between mb-2 px-1">
                                <span className={`text-[10px] sm:text-xs font-bold ${currentStep >= 2 ? "text-primary-600" : "text-slate-400"}`}>基本情報</span>
                                <span className={`text-[10px] sm:text-xs font-bold ${currentStep >= 3 ? "text-primary-600" : "text-slate-400"}`}>詳細情報</span>
                                <span className={`text-[10px] sm:text-xs font-bold ${currentStep >= 4 ? "text-primary-600" : "text-slate-400"}`}>完了</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary-600"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <div className="text-right text-xs text-slate-500 mt-1">
                                STEP {currentStep - 1} / 3
                            </div>
                        </>
                    )}
                </div>

                <div className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-slate-200">
                    <form onSubmit={(e) => e.preventDefault()}>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <AnimatePresence mode="wait">
                            {/* Step 1: Account (Email/Pass) */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-slate-700">メールアドレス <span className="text-red-500">*</span></label>
                                            <input type="email" name="email" value={formData.email} onChange={handleChange}
                                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="example@email.com" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-slate-700">パスワード <span className="text-red-500">*</span></label>
                                            <input type="password" name="password" value={formData.password} onChange={handleChange}
                                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="8文字以上" />
                                            <p className="text-xs text-slate-500">※8文字以上の半角英数字</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Name & Kana */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-5"
                                >
                                    <h2 className="text-lg font-bold text-slate-900 pb-2 border-b">お名前の入力</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-slate-700">姓 <span className="text-red-500">*</span></label>
                                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange}
                                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="山田" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-slate-700">名 <span className="text-red-500">*</span></label>
                                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="太郎" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-slate-700">セイ（カタカナ） <span className="text-red-500">*</span></label>
                                            <input type="text" name="lastNameKana" value={formData.lastNameKana} onChange={handleChange}
                                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="ヤマダ" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-bold text-slate-700">メイ（カタカナ） <span className="text-red-500">*</span></label>
                                            <input type="text" name="firstNameKana" value={formData.firstNameKana} onChange={handleChange}
                                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="タロウ" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: DOB & Prefecture */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-5"
                                >
                                    <h2 className="text-lg font-bold text-slate-900 pb-2 border-b">詳細情報の入力</h2>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700">生年月日 <span className="text-red-500">*</span></label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <select name="birthYear" value={formData.birthYear} onChange={handleChange}
                                                className="w-full h-12 rounded-lg border border-slate-300 px-3 bg-white">
                                                <option value="">年</option>
                                                {years.map(y => <option key={y} value={y}>{y}年</option>)}
                                            </select>
                                            <select name="birthMonth" value={formData.birthMonth} onChange={handleChange}
                                                className="w-full h-12 rounded-lg border border-slate-300 px-3 bg-white">
                                                <option value="">月</option>
                                                {months.map(m => <option key={m} value={m}>{m}月</option>)}
                                            </select>
                                            <select name="birthDay" value={formData.birthDay} onChange={handleChange}
                                                className="w-full h-12 rounded-lg border border-slate-300 px-3 bg-white">
                                                <option value="">日</option>
                                                {days.map(d => <option key={d} value={d}>{d}日</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700">お住まいの地域 <span className="text-red-500">*</span></label>
                                        <select name="prefecture" value={formData.prefecture} onChange={handleChange}
                                            className="w-full h-12 rounded-lg border border-slate-300 px-3 bg-white">
                                            <option value="">選択してください</option>
                                            {prefectures.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 4: Phone & Period */}
                            {currentStep === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-5"
                                >
                                    <h2 className="text-lg font-bold text-slate-900 pb-2 border-b">ご連絡先の入力</h2>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700">電話番号 <span className="text-red-500">*</span></label>
                                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                                            className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="09012345678" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700">就職希望時期 <span className="text-xs font-normal text-slate-500 ml-1">（任意）</span></label>
                                        <select name="period" value={formData.period} onChange={handleChange}
                                            className="w-full h-12 rounded-lg border border-slate-300 px-3 bg-white">
                                            <option value="">選択してください</option>
                                            {periods.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-8 flex gap-4">
                            <Button
                                type="button"
                                onClick={handleBack}
                                variant="outline"
                                className="flex-1 h-12 text-slate-600 border-slate-300"
                                disabled={isLoading}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                戻る
                            </Button>

                            {currentStep < totalSteps ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex-1 h-14 bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg rounded-xl"
                                    disabled={
                                        currentStep === 1 ? !canProceedStep1 :
                                            currentStep === 2 ? !canProceedStep2 :
                                                currentStep === 3 ? !canProceedStep3 : !canProceedStep4
                                    }
                                >
                                    次へ
                                    <ChevronRight className="w-5 h-5 ml-1" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="flex-1 h-14 bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-primary-500/30"
                                    disabled={isLoading || !canProceedStep4}
                                >
                                    {isLoading ? "登録中..." : "登録してはじめる"}
                                    {!isLoading && <Check className="w-5 h-5 ml-2" />}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                    すでにアカウントをお持ちの方は{" "}
                    <Link href="/login" className="text-primary-600 hover:underline font-bold">ログイン</Link>
                </p>
            </div>
        </div>
    );
}
