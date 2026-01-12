"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
    const [currentStep, setCurrentStep] = useState(1);
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

    // Generate years (18 to 65 years old roughly)
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

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Manual Validation
        const requiredFields = [
            formData.lastName, formData.firstName,
            formData.lastNameKana, formData.firstNameKana,
            formData.birthYear, formData.birthMonth, formData.birthDay,
            formData.email, formData.password,
            formData.prefecture, formData.period
        ];

        if (requiredFields.some(field => !field)) {
            alert("すべての項目を入力してください。");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { signup } = await import("../auth/actions");
            const result = await signup(formData);

            if (result?.error) {
                alert(result.error); // Show error alert
                setError(result.error);
                setIsLoading(false);
            } else if (result?.success) {
                alert("登録完了"); // Show success alert
                window.location.href = "/"; // Redirect to top page
            }
        } catch {
            const msg = "予期せぬエラーが発生しました。";
            alert(msg);
            setError(msg);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-xl">
                {/* Header & Progress Bar */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-center mb-8 text-slate-900">会員登録</h1>

                    <div className="relative mb-8">
                        <div className="flex justify-between mb-2">
                            <span className={`text-xs font-bold ${currentStep >= 1 ? "text-primary-600" : "text-slate-400"}`}>基本情報</span>
                            <span className={`text-xs font-bold ${currentStep >= 2 ? "text-primary-600" : "text-slate-400"}`}>アカウント</span>
                            <span className={`text-xs font-bold ${currentStep >= 3 ? "text-primary-600" : "text-slate-400"}`}>希望条件</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary-600"
                                initial={{ width: "0%" }}
                                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <div className="text-right text-xs text-slate-500 mt-1">
                            STEP {currentStep} / {totalSteps}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <form onSubmit={(e) => e.preventDefault()}>
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <AnimatePresence mode="wait">
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">基本情報の入力</h2>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">姓 <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="山田"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">名 <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="太郎"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">せい <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="lastNameKana"
                                                value={formData.lastNameKana}
                                                onChange={handleChange}
                                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="ヤマダ"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">めい <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="firstNameKana"
                                                value={formData.firstNameKana}
                                                onChange={handleChange}
                                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="タロウ"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">生年月日 <span className="text-red-500">*</span></label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="relative">
                                                <select
                                                    name="birthYear"
                                                    value={formData.birthYear}
                                                    onChange={handleChange}
                                                    className="w-full h-12 rounded-lg border border-slate-300 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                                    required
                                                >
                                                    <option value="">年</option>
                                                    {years.map(y => <option key={y} value={y}>{y}年</option>)}
                                                </select>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    name="birthMonth"
                                                    value={formData.birthMonth}
                                                    onChange={handleChange}
                                                    className="w-full h-12 rounded-lg border border-slate-300 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                                    required
                                                >
                                                    <option value="">月</option>
                                                    {months.map(m => <option key={m} value={m}>{m}月</option>)}
                                                </select>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    name="birthDay"
                                                    value={formData.birthDay}
                                                    onChange={handleChange}
                                                    className="w-full h-12 rounded-lg border border-slate-300 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-2 focus:ring-primary-500 bg-white"
                                                    required
                                                >
                                                    <option value="">日</option>
                                                    {days.map(d => <option key={d} value={d}>{d}日</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">アカウント・連絡先情報の入力</h2>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">電話番号 <span className="text-red-500">*</span></label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="09012345678"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">メールアドレス <span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="example@nextlevel.com"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">パスワード <span className="text-red-500">*</span></label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="8文字以上の半角英数字"
                                            required
                                            minLength={8}
                                        />
                                        <p className="text-xs text-slate-500">※8文字以上の半角英数字で入力してください</p>
                                    </div>
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4">希望条件の入力</h2>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">勤務希望地 <span className="text-red-500">*</span></label>
                                        <select
                                            name="prefecture"
                                            value={formData.prefecture}
                                            onChange={handleChange}
                                            className="w-full h-12 rounded-lg border border-slate-300 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                            required
                                        >
                                            <option value="">選択してください</option>
                                            {prefectures.map(pref => <option key={pref} value={pref}>{pref}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">就職希望時期 <span className="text-red-500">*</span></label>
                                        <select
                                            name="period"
                                            value={formData.period}
                                            onChange={handleChange}
                                            className="w-full h-12 rounded-lg border border-slate-300 px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                            required
                                        >
                                            <option value="">選択してください</option>
                                            {periods.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-8 flex gap-4">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    onClick={handleBack}
                                    variant="outline"
                                    className="flex-1 h-12 text-slate-600 border-slate-300 hover:bg-slate-50"
                                    disabled={isLoading}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    戻る
                                </Button>
                            )}

                            {currentStep < totalSteps ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex-1 h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold"
                                >
                                    次へ
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() => handleSubmit()}
                                    className="flex-1 h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/30"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "送信中..." : "登録する"}
                                    {!isLoading && <Check className="w-4 h-4 ml-2" />}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                <div className="mt-6 text-center text-sm text-slate-500">
                    すでにアカウントをお持ちの方は <Link href="/login" className="text-primary-600 hover:underline font-bold">ログイン</Link>
                </div>
            </div>
        </div>
    );
}
