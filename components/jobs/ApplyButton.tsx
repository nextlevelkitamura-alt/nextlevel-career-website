"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { applyForJob } from "../../app/jobs/actions";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ApplyButtonProps {
    jobId: string;
    isLoggedIn: boolean;
    hasApplied: boolean;
}

export default function ApplyButton({ jobId, isLoggedIn, hasApplied: initialHasApplied }: ApplyButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [hasApplied, setHasApplied] = useState(initialHasApplied);

    const handleApply = async () => {
        if (!isLoggedIn) {
            router.push(`/login?returnUrl=/jobs/${jobId}`);
            return;
        }

        // 確認ダイアログなしで即座に応募
        setIsLoading(true);
        const result = await applyForJob(jobId);
        setIsLoading(false);

        if (result.success) {
            setHasApplied(true);
            toast.success("応募が完了しました！", {
                description: "担当者から連絡をお待ちください。"
            });
            router.refresh();
        } else {
            console.error(result);
            if (result.code === "UNAUTHORIZED") {
                router.push(`/login?returnUrl=/jobs/${jobId}`);
            } else if (result.code === "ALREADY_APPLIED") {
                setHasApplied(true);
                toast.info("既に応募済みです。");
            } else {
                toast.error("エラーが発生しました", {
                    description: result.error || "不明なエラー"
                });
            }
        }
    };

    if (hasApplied) {
        return (
            <Button disabled className="w-full bg-slate-100 text-slate-500 border border-slate-200">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                応募済み
            </Button>
        );
    }

    return (
        <Button
            onClick={handleApply}
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/30"
            size="lg"
        >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoggedIn ? "この求人に応募する" : "ログインして応募する"}
        </Button>
    );
}

