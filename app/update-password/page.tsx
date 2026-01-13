"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Check, Lock, Loader2 } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';
import Link from "next/link";

export default function UpdatePasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSessionLoading, setIsSessionLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasSession, setHasSession] = useState(false);

    // クライアントサイドでSupabaseクライアントを作成
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        // URLのハッシュフラグメントからセッションを確立
        const handleHashFragment = async () => {
            // Supabaseはハッシュフラグメントを自動的に処理してセッションを確立
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error('Session error:', sessionError.message);
                setError("セッションの確立に失敗しました。もう一度パスワードリセットメールからやり直してください。");
                setIsSessionLoading(false);
                return;
            }

            if (session) {
                setHasSession(true);
            } else {
                // ハッシュフラグメントがある場合、onAuthStateChangeを待つ
                const hashParams = window.location.hash;
                if (hashParams && hashParams.includes('access_token')) {
                    // Supabaseが自動的にハッシュを処理するのを待つ
                    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                        if (event === 'SIGNED_IN' && session) {
                            setHasSession(true);
                            setIsSessionLoading(false);
                            // ハッシュをクリア
                            window.history.replaceState(null, '', window.location.pathname);
                        } else if (event === 'TOKEN_REFRESHED' && session) {
                            setHasSession(true);
                            setIsSessionLoading(false);
                        }
                    });

                    // 3秒後にタイムアウト
                    setTimeout(() => {
                        if (!hasSession) {
                            setError("セッションが確立できませんでした。リンクの有効期限が切れている可能性があります。");
                            setIsSessionLoading(false);
                        }
                        subscription.unsubscribe();
                    }, 3000);
                    return;
                } else {
                    setError("パスワードリセットリンクが無効か、有効期限が切れています。もう一度お試しください。");
                }
            }
            setIsSessionLoading(false);
        };

        handleHashFragment();
    }, []);

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

        if (password.length < 8) {
            setError("パスワードは8文字以上で入力してください。");
            setIsLoading(false);
            return;
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                console.error('Update password error:', updateError.message);
                setError("パスワードの更新に失敗しました。");
            } else {
                setMessage("パスワードを更新しました！");
            }
        } catch {
            setError("予期せぬエラーが発生しました。");
        } finally {
            setIsLoading(false);
        }
    };

    // セッション確立中のローディング
    if (isSessionLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-slate-600">セッションを確認中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        新しいパスワードの設定
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        次回ログイン時から使用するパスワードを設定してください。
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                        {error}
                        <div className="mt-3">
                            <Link href="/forgot-password" className="text-primary-600 hover:underline font-medium">
                                パスワードリセットをやり直す
                            </Link>
                        </div>
                    </div>
                )}

                {message && (
                    <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
                        <p className="font-bold mb-2">{message}</p>
                        <Link href="/jobs" className="text-primary-600 hover:text-primary-800 underline">
                            求人一覧へ移動
                        </Link>
                    </div>
                )}

                {!message && hasSession && (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    新しいパスワード
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    placeholder="8文字以上で入力"
                                    minLength={8}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    確認用パスワード
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    placeholder="もう一度入力"
                                    minLength={8}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/30 transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? "更新中..." : "パスワードを変更する"}
                            {!isLoading && <Check className="w-4 h-4 ml-2" />}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
