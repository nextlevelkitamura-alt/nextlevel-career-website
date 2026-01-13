"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { resetPassword } from "../auth/actions";

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
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                        <Mail className="h-6 w-6 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        パスワードをお忘れの方
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        ご登録のメールアドレスを入力してください。<br />
                        再設定用のリンクをお送りします。
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
                        <p className="font-bold">{message}</p>
                    </div>
                )}

                {!message && (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                メールアドレス
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                placeholder="example@nextlevel.com"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/30 transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "送信中..." : "送信する"}
                        </Button>
                    </form>
                )}

                <div className="text-center">
                    <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        ログイン画面に戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}
