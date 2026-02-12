"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";


export default function GoogleSignInButton({ text = "Googleでログイン", nextUrl }: { text?: string, nextUrl?: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleLogin = async () => {
        setIsLoading(true);
        setErrorMsg(null);

        try {
            const supabase = createClient();

            // 前回の失敗したOAuth試行のステール状態をクリア
            await supabase.auth.signOut({ scope: 'local' });

            let redirectUrl = `${location.origin}/auth/callback`;
            if (nextUrl) {
                redirectUrl += `?next=${encodeURIComponent(nextUrl)}`;
            }

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        prompt: "select_account",
                    },
                },
            });

            if (error) {
                console.error("Google OAuth error:", error);
                setErrorMsg(error.message);
                setIsLoading(false);
                return;
            }

            // SDK がリダイレクトしなかった場合、手動でリダイレクト
            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (e) {
            console.error("Google OAuth unexpected error:", e);
            setErrorMsg(e instanceof Error ? e.message : "予期しないエラーが発生しました");
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            {errorMsg && (
                <div className="mb-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs">
                    Google認証エラー: {errorMsg}
                </div>
            )}
            <Button
                type="button"
                className="w-full h-12 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3"
                onClick={handleLogin}
                disabled={isLoading}
            >
                {!isLoading && (
                    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                        <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                        </g>
                    </svg>
                )}
                {isLoading ? "接続中..." : text}
            </Button>
        </div>
    );
}
