"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { applyForJob } from "../../app/jobs/actions";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";

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

        if (!confirm("この求人に応募しますか？")) {
            return;
        }

        setIsLoading(true);
        const result = await applyForJob(jobId);
        setIsLoading(false);

        if (result.success) {
            setHasApplied(true);
            alert("応募が完了しました！");
            router.refresh(); // Refresh to update any server-side state if needed
        } else {
            console.error(result);
            if (result.code === "UNAUTHORIZED") {
                router.push(`/login?returnUrl=/jobs/${jobId}`);
            } else if (result.code === "ALREADY_APPLIED") {
                setHasApplied(true);
                alert("既に応募済みです。");
            } else {
                alert("エラーが発生しました：" + (result.error || "不明なエラー"));
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
