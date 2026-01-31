"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";

export default function GoogleSignInButton({ text = "Googleでログイン" }: { text?: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
        // Note: isLoading stays true until redirect happens
    };

    return (
        <Button
            type="button"
            className="w-full h-12 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold shadow-sm transition-all flex items-center justify-center gap-3"
            onClick={handleLogin}
            disabled={isLoading}
        >
            {!isLoading && (
                <Image
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    width={20}
                    height={20}
                />
            )}
            {isLoading ? "接続中..." : text}
        </Button>
    );
}
