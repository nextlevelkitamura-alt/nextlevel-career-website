"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient, hasBrowserSupabaseEnv } from "@/utils/supabase/client";
import { getUnreadConsultations, markAllConsultationsAsRead } from "@/app/admin/actions/notifications";
import { X, Calendar } from "lucide-react";

interface UnreadConsultation {
    id: string;
    attendee_name: string | null;
    attendee_email: string | null;
    starts_at: string | null;
    status: string;
    created_at: string;
}

const statusLabels: Record<string, string> = {
    booked: "予約済み",
    confirmed: "確認済み",
};

export default function ConsultationNotificationPopup() {
    const [unreadConsultations, setUnreadConsultations] = useState<UnreadConsultation[]>([]);
    const [visible, setVisible] = useState(false);
    const [dismissedTemporarily, setDismissedTemporarily] = useState(false);
    const supabase = hasBrowserSupabaseEnv() ? createClient() : null;

    const fetchUnreadConsultations = useCallback(async () => {
        const consultations = await getUnreadConsultations();
        setUnreadConsultations(consultations);
        if (consultations.length > 0 && !dismissedTemporarily) {
            setVisible(true);
        }
    }, [dismissedTemporarily]);

    useEffect(() => {
        fetchUnreadConsultations();
    }, [fetchUnreadConsultations]);

    // Supabase Realtime: 新規面談予約を監視
    useEffect(() => {
        if (!supabase) return;

        const channel = supabase
            .channel("consultation-popup")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "consultation_bookings" },
                () => {
                    // 新規予約があったら再取得して表示
                    setDismissedTemporarily(false);
                    fetchUnreadConsultations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, fetchUnreadConsultations]);

    const handleConfirm = async () => {
        await markAllConsultationsAsRead();
        setUnreadConsultations([]);
        setVisible(false);
        setDismissedTemporarily(false);
    };

    const handleDismiss = () => {
        setVisible(false);
        setDismissedTemporarily(true);
    };

    if (!visible || unreadConsultations.length === 0) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-lg font-bold text-slate-900">
                            新規面談予約のお知らせ
                        </h3>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Count */}
                <div className="px-6 pb-3">
                    <p className="text-sm text-slate-500">
                        <span className="font-bold text-emerald-600">{unreadConsultations.length}件</span>の新規予約があります
                    </p>
                </div>

                {/* Consultation list */}
                <div className="px-6 max-h-64 overflow-y-auto">
                    <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                        {unreadConsultations.map((consultation) => (
                            <div key={consultation.id} className="px-4 py-3 flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-800 truncate">
                                        {consultation.attendee_name || consultation.attendee_email || "名前未登録"}
                                    </p>
                                    {consultation.attendee_name && consultation.attendee_email && (
                                        <p className="text-xs text-slate-400 truncate">{consultation.attendee_email}</p>
                                    )}
                                    {consultation.starts_at && (
                                        <p className="text-xs text-emerald-600 mt-0.5">
                                            {new Date(consultation.starts_at).toLocaleString("ja-JP", {
                                                month: "2-digit",
                                                day: "2-digit",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap ml-3">
                                    {statusLabels[consultation.status] || consultation.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Confirm button */}
                <div className="px-6 py-4">
                    <button
                        onClick={handleConfirm}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                    >
                        確認しました
                    </button>
                </div>
            </div>
        </div>
    );
}
