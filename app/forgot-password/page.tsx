"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { resetPassword } from "../auth/actions"; // 修正されたアクションをインポート

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await resetPassword(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setMessage("パスワード再設定用のメールを送信しました。メールをご確認ください。");
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
                <Link href="/login" className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium text-sm">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    ログイン画面に戻る
                </Link>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                    <h1 className="text-2xl font-bold text-center mb-4 text-slate-900">パスワードをお忘れの方</h1>
                    <p className="text-sm text-slate-500 text-center mb-8">
                        ご登録のメールアドレスを入力してください。<br />
                        パスワード再設定用のリンクをお送りします。
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                            {message}
                        </div>
                    )}

                    {!message && (
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

                            <Button
                                type="submit"
                                className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/30"
                                disabled={isLoading}
                            >
                                {isLoading ? "送信中..." : "送信する"}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
