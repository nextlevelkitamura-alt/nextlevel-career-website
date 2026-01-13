"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Search, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        try {
            const { login } = await import("../auth/actions");
            const result = await login(formData);
            if (result?.error) {
                setError(result.error);
                setIsLoading(false);
            }
            // Redirect is handled in the server action
        } catch {
            setError("An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center px-4">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-2xl shadow-xl overflow-hidden">

                {/* Left Side: Promotion / CTA */}
                <div className="p-8 md:p-12 bg-slate-900 text-white h-full flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center bg-white/10 text-primary-200 text-xs font-bold px-3 py-1 rounded-full mb-6 border border-white/10">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Next Level Career
                        </div>
                        <h2 className="text-3xl font-bold mb-4 leading-tight">
                            あなたの可能性を<br />もっと広げよう
                        </h2>
                        <p className="text-slate-300 mb-8 leading-relaxed">
                            会員登録・ログインすると、非公開求人を含むすべての求人情報を閲覧できます。
                            まずはあなたの希望に合う仕事を探してみませんか？
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary-900/50 rounded-lg text-primary-400 mt-1">
                                    <Search className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">豊富な求人から探せる</h3>
                                    <p className="text-sm text-slate-400">オフィスワークを中心に、未経験OKからハイクラスまで幅広く掲載。</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-700">
                            <p className="text-sm text-slate-400 mb-3">まだアカウントをお持ちでない方は</p>
                            <Link href="/register" className="inline-flex items-center text-white font-bold hover:text-primary-300 transition-colors group">
                                新規会員登録（無料）
                                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="p-8 md:p-12">
                    <h1 className="text-2xl font-bold text-center mb-2 text-slate-900">おかえりなさい</h1>
                    <p className="text-center text-slate-500 mb-8 text-sm">ログインして求人を探しましょう</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">メールアドレス</label>
                            <input
                                type="email"
                                name="email"
                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-slate-50 focus:bg-white"
                                placeholder="example@nextlevel.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700">パスワード</label>
                                <Link href="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline">
                                    パスワードをお忘れの方
                                </Link>
                            </div>
                            <input
                                type="password"
                                name="password"
                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all bg-slate-50 focus:bg-white"
                                placeholder="パスワードを入力"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/30 transition-all mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? "ログイン中..." : "ログインする"}
                            {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </form>

                    <div className="mt-8 text-center md:hidden">
                        <p className="text-sm text-slate-500">
                            アカウントをお持ちでない方は<br />
                            <Link href="/register" className="text-primary-600 font-bold hover:underline">新規会員登録（無料）</Link>
                        </p>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 text-center w-full text-slate-400 text-xs">
                © 2026 Next Level Career. All rights reserved.
            </div>
        </div>
    );
}
