"use client";

import Link from "next/link";
import { Lock, Sparkles, FolderHeart, Rocket } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function RegistrationGate() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 relative overflow-hidden">
                {/* Decorative Background Blob */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 bg-primary-100 rounded-full blur-3xl opacity-50"></div>

                <div className="relative z-10 text-center">
                    <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-2">診断完了！</h2>
                    <p className="text-slate-600 mb-8">
                        あなたの適職タイプが見つかりました。<br />
                        結果を見るには会員登録（無料）へお進みください。
                    </p>

                    <div className="bg-slate-50 rounded-xl p-5 mb-8 text-left space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-orange-500 shadow-sm shrink-0">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">AIマッチング</h3>
                                <p className="text-xs text-slate-500">相性90%以上の求人を厳選表示</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-pink-500 shadow-sm shrink-0">
                                <FolderHeart className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">結果を保存</h3>
                                <p className="text-xs text-slate-500">マイページでいつでも見返せる</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                                <Rocket className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">簡単応募</h3>
                                <p className="text-xs text-slate-500">気になる求人へ即応募可能</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <GoogleSignInButton nextUrl="/diagnosis/result" />

                        <Link
                            href="/register?next=/diagnosis/result"
                            className="block w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors text-sm"
                        >
                            メールアドレスで登録
                        </Link>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            すでに会員の方は
                            <Link href="/login?next=/diagnosis/result" className="text-primary-600 font-bold hover:underline ml-1">
                                ログイン
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
