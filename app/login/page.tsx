"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";

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
        <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-md">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h1 className="text-2xl font-bold text-center mb-8 text-slate-900">ログイン</h1>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">メールアドレス</label>
                            <input
                                type="email"
                                name="email"
                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="example@nextlevel.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">パスワード</label>
                            <input
                                type="password"
                                name="password"
                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="パスワードを入力"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/30"
                            disabled={isLoading}
                        >
                            {isLoading ? "ログイン中..." : "ログイン"}
                            {!isLoading && <Check className="w-4 h-4 ml-2" />}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        アカウントをお持ちでない方は <Link href="/register" className="text-primary-600 hover:underline font-bold">会員登録</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
