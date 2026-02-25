"use client";

import { Button } from "@/components/ui/button";
import { recordBookingClick } from "@/app/jobs/actions";
import { CalendarDays, MessageCircle } from "lucide-react";

interface BookingButtonProps {
    jobId: string;
    type: "apply" | "consult";
    variant?: "default" | "outline";
    size?: "default" | "lg" | "sm";
    className?: string;
}

const CALCOM_URLS = {
    apply: process.env.NEXT_PUBLIC_CALCOM_APPLY_URL ?? "",
    consult: process.env.NEXT_PUBLIC_CALCOM_CONSULT_URL ?? "",
};

export default function BookingButton({
    jobId,
    type,
    variant = "default",
    size = "lg",
    className = "",
}: BookingButtonProps) {
    const label = type === "apply" ? "応募する" : "相談する";
    const Icon = type === "apply" ? CalendarDays : MessageCircle;
    const calUrl = CALCOM_URLS[type];

    const handleClick = async () => {
        // クリックをSupabaseに記録
        const result = await recordBookingClick(jobId, type);

        if (!calUrl) return;

        const params = new URLSearchParams();
        params.set("metadata[jobId]", jobId);
        params.set("metadata[clickType]", type);
        if (result.userId) {
            params.set("metadata[userId]", result.userId);
        }

        // Cal.comを新規タブで開く
        window.open(`https://cal.com/${calUrl}?${params.toString()}`, "_blank");
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
