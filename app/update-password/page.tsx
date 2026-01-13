"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check } from "lucide-react";
import { updatePassword } from "../auth/actions"; // これから追加する

export default function UpdatePasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setError("パスワードが一致しません。");
            setIsLoading(false);
            return;
        }

        try {
            const result = await updatePassword(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setMessage("パスワードを更新しました。");
            }
        } catch {
            setError("予期せぬエラーが発生しました。");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-md">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h1 className="text-2xl font-bold text-center mb-8 text-slate-900">新しいパスワードの設定</h1>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                            {message}
                            <div className="mt-4 text-center">
                                <a href="/jobs" className="text-primary-600 font-bold hover:underline">求人一覧へ移動</a>
                            </div>
                        </div>
                    )}

                    {!message && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">新しいパスワード</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="8文字以上で入力してください"
                                    minLength={8}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">新しいパスワード（確認）</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="もう一度入力してください"
                                    minLength={8}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/30"
                                disabled={isLoading}
                            >
                                {isLoading ? "更新中..." : "パスワードを変更する"}
                                {!isLoading && <Check className="w-4 h-4 ml-2" />}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
