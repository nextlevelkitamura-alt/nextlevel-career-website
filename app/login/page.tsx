"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
// import { createClient } from "@/utils/supabase/client";

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
        <div className="relative min-h-screen bg-slate-50 py-16 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8 md:p-12">
                        <h1 className="text-2xl font-bold text-center mb-2 text-slate-900">ログイン</h1>
                        <p className="text-center text-slate-500 mb-8 text-sm">こちらから求人を探しましょう</p>

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

                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-500">
                                アカウントをお持ちでない方は<br />
                                <Link href="/register" className="text-primary-600 font-bold hover:underline">新規会員登録（無料）</Link>
                            </p>
                        </div>
                    </div >
                </div >

                <div className="mt-6 text-center w-full text-slate-400 text-xs">
                    © 2026 Next Level Career. All rights reserved.
                </div>
            </div >
        </div >
    );
}
