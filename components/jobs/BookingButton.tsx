"use client";

import { Button } from "@/components/ui/button";
import { recordBookingClick } from "@/app/jobs/actions";
import { CalendarDays, MessageCircle } from "lucide-react";
import { buildCalComUrl } from "@/utils/calcom";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

interface BookingButtonProps {
    jobId: string;
    type: "apply" | "consult";
    variant?: "default" | "outline";
    size?: "default" | "lg" | "sm";
    className?: string;
    gigJobUrl?: string | null; // スキマバイトから正社員の場合の応募先URL
}

const CALCOM_URLS = {
    apply: process.env.NEXT_PUBLIC_CALCOM_APPLY_URL ?? "",
    consult: process.env.NEXT_PUBLIC_CALCOM_CONSULT_URL ?? "",
};

type CalPrefill = {
    name: string | null;
    email: string | null;
    phone: string | null;
};

export default function BookingButton({
    jobId,
    type,
    variant = "default",
    size = "lg",
    className = "",
    gigJobUrl,
}: BookingButtonProps) {
    const [prefill, setPrefill] = useState<CalPrefill>({
        name: null,
        email: null,
        phone: null,
    });

    useEffect(() => {
        const loadPrefill = async () => {
            const supabase = createClient();
            const { data: authData } = await supabase.auth.getUser();
            const user = authData.user;
            if (!user) return;

            const { data: profile } = await supabase
                .from("profiles")
                .select("first_name,last_name,phone_number")
                .eq("id", user.id)
                .maybeSingle();

            const fullName = [profile?.last_name, profile?.first_name]
                .filter(Boolean)
                .join(" ")
                .trim();

            setPrefill({
                name: fullName || null,
                email: user.email ?? null,
                phone: profile?.phone_number ?? null,
            });
        };

        void loadPrefill();
    }, []);

    const label = type === "apply" ? "応募する" : "相談する";
    const Icon = type === "apply" ? CalendarDays : MessageCircle;
    const calUrl = CALCOM_URLS[type];

    const handleClick = async () => {
        // クリックをSupabaseに記録
        const result = await recordBookingClick(jobId, type);

        // スキマバイトから正社員の「応募する」ボタン: スキマバイト求人URLに遷移
        if (type === "apply" && gigJobUrl) {
            window.open(gigJobUrl, "_blank");
            return;
        }

        if (!calUrl) return;

        const calUrlWithParams = buildCalComUrl(calUrl, {
            jobId,
            clickType: type,
            userId: result.userId,
        }, {
            name: prefill.name,
            email: prefill.email,
            phone: prefill.phone,
        });

        // Cal.comを新規タブで開く
        window.open(calUrlWithParams, "_blank");
    };

    const isApply = type === "apply";

    return (
        <Button
            onClick={handleClick}
            variant={variant}
            size={size}
            className={
                isApply
                    ? `w-full bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/30 ${className}`
                    : `w-full border-primary-300 text-primary-700 hover:bg-primary-50 font-bold ${className}`
            }
        >
            <Icon className="mr-2 h-4 w-4" />
            {label}
        </Button>
    );
}
