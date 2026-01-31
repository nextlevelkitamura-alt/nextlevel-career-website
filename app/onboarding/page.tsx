"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
// import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // const router = useRouter();

    // Googleログインユーザーの初期データ取得用（名前などがあれば埋める）
    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata) {
                const { full_name, name } = user.user_metadata;
                // Googleの名前を姓・名に分割する簡易ロジック（スペース区切り）
                if (full_name || name) {
                    const rawName = full_name || name || "";
                    const parts = rawName.split(" ");
                    if (parts.length >= 2) {
                        setFormData(prev => ({
                            ...prev,
                            lastName: parts[0],
                            firstName: parts.slice(1).join(" ")
                        }));
                    } else {
                        setFormData(prev => ({ ...prev, lastName: rawName }));
                    }
                }
            }
        };
        fetchUser();
    }, []);

    const [formData, setFormData] = useState({
        lastName: "",
        firstName: "",
        lastNameKana: "",
        firstNameKana: "",
        birthYear: "",
        birthMonth: "",
        birthDay: "",
        prefecture: "",
        phoneNumber: "",
        start_date: "",
    });

    const totalSteps = 3;

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const formDataObj = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                formDataObj.append(key, value);
            });

            const { completeProfile } = await import("../auth/actions");
            const result = await completeProfile(formDataObj);

            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
            }
            // success is handled by redirect in server action
        } catch {
            setError("予期せぬエラーが発生しました。");
            setIsLoading(false);
        }
    };

    // --- Validation Logic ---
    const canProceedStep1 = formData.lastName && formData.firstName && formData.lastNameKana && formData.firstNameKana;
    const canProceedStep2 = formData.birthYear && formData.birthMonth && formData.birthDay && formData.prefecture;
    const canProceedStep3 = formData.phoneNumber && formData.start_date;

    // --- Data Lists ---
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - 18 - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    const prefectures = [
        "東京都", "神奈川県", "埼玉県", "千葉県", "茨城県", "栃木県", "群馬県",
        "大阪府", "京都府", "兵庫県", "奈良県", "愛知県", "福岡県", "北海道", "その他"
    ];

    const periods = [
        "すぐにでも",
        "1ヶ月以内",
        "3ヶ月以内",
        "未定"
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-4 max-w-lg">

                {/* Header Logo Area could go here */}
                {/* <div className="flex justify-center mb-8">
                     <Logo />
                </div> */}

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2 px-2 text-xs font-bold text-slate-400">
                        <span className={currentStep >= 1 ? "text-orange-500" : ""}>基本情報</span>
                        <span className={currentStep >= 2 ? "text-orange-500" : ""}>詳細情報</span>
                        <span className={currentStep >= 3 ? "text-orange-500" : ""}>完了</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden relative">
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-orange-500"
                            initial={{ width: "0%" }}
                            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <div className="text-right text-xs text-slate-400 mt-1">
                        STEP {currentStep} / {totalSteps}
                    </div>
                </div>

                <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100">
                    <form onSubmit={(e) => e.preventDefault()}>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {/* STEP 1: Name */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">基本情報の入力</h2>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">姓 <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="山田"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">名 <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="太郎"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">セイ（カナ） <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="lastNameKana"
                                                    value={formData.lastNameKana}
                                                    onChange={handleChange}
                                                    className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="ヤマダ"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700">メイ（カナ） <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    name="firstNameKana"
                                                    value={formData.firstNameKana}
                                                    onChange={handleChange}
                                                    className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="タロウ"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: Birth & Prefecture */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">詳細情報の入力</h2>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">生年月日 <span className="text-red-500">*</span></label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <select
                                                    name="birthYear"
                                                    value={formData.birthYear}
                                                    onChange={handleChange}
                                                    className="w-full h-12 rounded-xl border border-slate-300 px-3 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                                                >
                                                    <option value="">年</option>
                                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                                <select
                                                    name="birthMonth"
                                                    value={formData.birthMonth}
                                                    onChange={handleChange}
                                                    className="w-full h-12 rounded-xl border border-slate-300 px-3 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                                                >
                                                    <option value="">月</option>
                                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                                <select
                                                    name="birthDay"
                                                    value={formData.birthDay}
                                                    onChange={handleChange}
                                                    className="w-full h-12 rounded-xl border border-slate-300 px-3 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                                                >
                                                    <option value="">日</option>
                                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">お住まいの地域 <span className="text-red-500">*</span></label>
                                            <select
                                                name="prefecture"
                                                value={formData.prefecture}
                                                onChange={handleChange}
                                                className="w-full h-12 rounded-xl border border-slate-300 px-4 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                                            >
                                                <option value="">選択してください</option>
                                                {prefectures.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: Contact */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">ご連絡先の入力</h2>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">電話番号 <span className="text-red-500">*</span></label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                                                placeholder="09012345678"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">就職希望時期 <span className="text-slate-400 font-normal ml-1">(任意)</span></label>
                                            <select
                                                name="start_date"
                                                value={formData.start_date}
                                                onChange={handleChange}
                                                className="w-full h-12 rounded-xl border border-slate-300 px-4 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                                            >
                                                <option value="">選択してください</option>
                                                {periods.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Footer Buttons */}
                        <div className="mt-8 flex gap-3">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    onClick={handleBack}
                                    variant="outline"
                                    disabled={isLoading}
                                    className="flex-1 h-12 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    戻る
                                </Button>
                            )}

                            {currentStep < totalSteps ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={
                                        (currentStep === 1 && !canProceedStep1) ||
                                        (currentStep === 2 && !canProceedStep2)
                                    }
                                    className="flex-1 h-12 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-xl shadow-md shadow-orange-200"
                                >
                                    次へ
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() => handleSubmit()}
                                    disabled={!canProceedStep3 || isLoading}
                                    className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200"
                                >
                                    {isLoading ? "登録中..." : "登録する"}
                                    {!isLoading && <Check className="w-4 h-4 ml-1" />}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400">すでにアカウントをお持ちの方は <a href="/login" className="text-orange-500 font-bold hover:underline">ログイン</a></p>
                </div>
            </div>
        </div>
    );
}
