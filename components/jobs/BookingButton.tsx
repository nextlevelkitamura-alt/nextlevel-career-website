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
    const label = type === "apply" ? "面談を予約する" : "相談を予約する";
    const Icon = type === "apply" ? CalendarDays : MessageCircle;
    const calUrl = CALCOM_URLS[type];

    const handleClick = async () => {
        // クリックをSupabaseに記録（Cal.comが開く前に確実に取得）
        await recordBookingClick(jobId, type);

        // Cal.comポップアップを開く（URLが設定済みの場合）
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        if (calUrl && typeof window !== "undefined" && win.Cal) {
            win.Cal("ui", { styles: { branding: { brandColor: "#7c3aed" } } });
            win.Cal("showPopup", { calLink: calUrl });
        } else if (calUrl) {
            window.open(`https://cal.com/${calUrl}`, "_blank");
        }
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
