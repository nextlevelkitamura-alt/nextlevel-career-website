"use client";

import { useEffect, useState } from "react";
import BookingButton from "@/components/jobs/BookingButton";

interface JobDetailBottomBarProps {
    jobId: string;
    jobTitle: string;
    companyName?: string | null;
}

export default function JobDetailBottomBar({ jobId, jobTitle, companyName }: JobDetailBottomBarProps) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let animateId: number | null = null;
        const currentRef = { value: 0 };
        const targetRef = { value: 0 };

        const getScrollProgress = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

            if (scrollHeight <= 0) {
                return 0;
            }

            return Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
        };

        const animate = () => {
            const delta = targetRef.value - currentRef.value;
            currentRef.value += delta * 0.14;

            if (Math.abs(delta) < 0.12) {
                currentRef.value = targetRef.value;
            }

            setProgress(currentRef.value);
            animateId = window.requestAnimationFrame(animate);
        };

        const syncTarget = () => {
            targetRef.value = getScrollProgress();
        };

        syncTarget();
        currentRef.value = targetRef.value;
        setProgress(currentRef.value);

        animateId = window.requestAnimationFrame(animate);

        window.addEventListener("scroll", syncTarget, { passive: true });
        window.addEventListener("resize", syncTarget);

        return () => {
            window.removeEventListener("scroll", syncTarget);
            window.removeEventListener("resize", syncTarget);
            if (animateId !== null) {
                window.cancelAnimationFrame(animateId);
            }
        };
    }, []);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-3 md:px-4 pb-safe">
            <div className="mx-auto w-full max-w-5xl rounded-t-xl border border-slate-200/80 bg-white/88 backdrop-blur-md supports-[backdrop-filter]:bg-white/78 shadow-[0_-8px_20px_rgba(15,23,42,0.12)] overflow-hidden">
                <div className="h-1.5 w-full bg-slate-200/80">
                    <div
                        className="h-full bg-primary-500"
                        style={{ width: `${progress}%` }}
                        aria-hidden
                    />
                </div>

                <div className="px-4 py-3 md:px-5 md:py-4">
                    <div className="hidden md:flex items-center justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 line-clamp-1">{jobTitle}</p>
                            {companyName && (
                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{companyName}</p>
                            )}
                        </div>
                        <div className="w-full max-w-md flex items-center gap-3">
                            <BookingButton jobId={jobId} type="consult" variant="outline" size="default" className="flex-1 text-sm" />
                            <BookingButton jobId={jobId} type="apply" size="default" className="flex-1 text-sm" />
                        </div>
                    </div>

                    <div className="md:hidden flex items-center gap-3">
                        <BookingButton jobId={jobId} type="consult" variant="outline" size="default" className="flex-1 text-sm" />
                        <BookingButton jobId={jobId} type="apply" size="default" className="flex-1 text-sm" />
                    </div>
                </div>
            </div>
        </div>
    );
}
