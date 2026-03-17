"use client";

import { useState, useTransition } from "react";
import type { ConsultationBooking } from "@/app/admin/actions/consultations";
import {
    updateConsultationStatus,
    updateConsultationOutcome,
    updateConsultationNote,
} from "@/app/admin/actions/consultations";
import { Calendar, Phone, Mail, Video, MessageSquare, X, Clock, User, Briefcase, Link2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Props {
    initialData: ConsultationBooking[];
}

type KanbanColumn = {
    key: string;
    label: string;
    color: string;
    bgColor: string;
    filter: (c: ConsultationBooking) => boolean;
};

const columns: KanbanColumn[] = [
    {
        key: "booked",
        label: "予約済み",
        color: "text-blue-700",
        bgColor: "bg-blue-50 border-blue-200",
        filter: (c) => c.status === "booked",
    },
    {
        key: "confirmed",
        label: "確認済み",
        color: "text-amber-700",
        bgColor: "bg-amber-50 border-amber-200",
        filter: (c) => c.status === "confirmed",
    },
    {
        key: "completed",
        label: "面談完了",
        color: "text-emerald-700",
        bgColor: "bg-emerald-50 border-emerald-200",
        filter: (c) => c.status === "completed" && c.outcome === "pending",
    },
    {
        key: "placed",
        label: "成約",
        color: "text-green-700",
        bgColor: "bg-green-50 border-green-200",
        filter: (c) => c.outcome === "placed",
    },
    {
        key: "declined",
        label: "不成約",
        color: "text-slate-500",
        bgColor: "bg-slate-50 border-slate-200",
        filter: (c) => c.outcome === "declined" || c.outcome === "withdrawn" || c.status === "canceled" || c.status === "no_show",
    },
];

export default function ConsultationKanban({ initialData }: Props) {
    const [bookings, setBookings] = useState(initialData);
    const [selectedBooking, setSelectedBooking] = useState<ConsultationBooking | null>(null);
    const [isPending, startTransition] = useTransition();
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, bookingId: string) => {
        e.dataTransfer.setData("bookingId", bookingId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, columnKey: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverColumn(columnKey);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent, columnKey: string) => {
        e.preventDefault();
        setDragOverColumn(null);
        const bookingId = e.dataTransfer.getData("bookingId");
        if (!bookingId) return;

        startTransition(async () => {
            let result;
            if (columnKey === "placed" || columnKey === "declined") {
                // 成約/不成約 → outcome を更新
                result = await updateConsultationOutcome(bookingId, columnKey);
                if (result.success) {
                    // status も completed にする
                    await updateConsultationStatus(bookingId, "completed");
                }
            } else if (columnKey === "booked" || columnKey === "confirmed" || columnKey === "completed") {
                result = await updateConsultationStatus(bookingId, columnKey);
                if (result.success && columnKey !== "completed") {
                    // booked/confirmed に戻す場合は outcome を pending に
                    await updateConsultationOutcome(bookingId, "pending");
                }
            } else {
                return;
            }

            if (result?.success) {
                setBookings(prev => prev.map(b => {
                    if (b.id !== bookingId) return b;
                    if (columnKey === "placed" || columnKey === "declined") {
                        return { ...b, status: "completed", outcome: columnKey };
                    }
                    return { ...b, status: columnKey, outcome: columnKey === "completed" ? b.outcome : "pending" };
                }));
                toast.success("ステータスを更新しました");
            } else {
                toast.error("更新に失敗しました");
            }
        });
    };

    const handleSaveNote = async (bookingId: string, note: string) => {
        startTransition(async () => {
            const result = await updateConsultationNote(bookingId, note);
            if (result.success) {
                setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, admin_note: note } : b));
                toast.success("メモを保存しました");
            } else {
                toast.error("メモの保存に失敗しました");
            }
        });
    };

    return (
        <div>
            {/* カンバンボード */}
            <div className="flex gap-4 overflow-x-auto pb-4">
                {columns.map((col) => {
                    const items = bookings.filter(col.filter);
                    return (
                        <div
                            key={col.key}
                            className={`flex-shrink-0 w-64 rounded-lg border ${col.bgColor} ${dragOverColumn === col.key ? "ring-2 ring-blue-400" : ""}`}
                            onDragOver={(e) => handleDragOver(e, col.key)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, col.key)}
                        >
                            {/* Column header */}
                            <div className="px-3 py-2 border-b border-inherit">
                                <div className="flex items-center justify-between">
                                    <h3 className={`text-sm font-bold ${col.color}`}>{col.label}</h3>
                                    <span className={`text-xs font-medium ${col.color}`}>{items.length}</span>
                                </div>
                            </div>

                            {/* Cards */}
                            <div className="p-2 space-y-2 min-h-[120px]">
                                {items.map((booking) => (
                                    <div
                                        key={booking.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, booking.id)}
                                        onClick={() => setSelectedBooking(booking)}
                                        className="bg-white rounded-lg border border-slate-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                                    >
                                        <p className="text-sm font-medium text-slate-800 truncate">
                                            {booking.attendee_name || "名前未登録"}
                                        </p>
                                        {booking.attendee_email && (
                                            <p className="text-xs text-slate-400 truncate mt-0.5">{booking.attendee_email}</p>
                                        )}
                                        <BookingSourceBadge booking={booking} />
                                        {booking.starts_at && (
                                            <div className="flex items-center gap-1 mt-1.5">
                                                <Calendar className="w-3 h-3 text-slate-400" />
                                                <span className="text-xs text-slate-500">
                                                    {new Date(booking.starts_at).toLocaleString("ja-JP", {
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {booking.admin_note && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <MessageSquare className="w-3 h-3 text-slate-400" />
                                                <span className="text-xs text-slate-400 truncate">{booking.admin_note}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {items.length === 0 && (
                                    <div className="text-xs text-slate-400 text-center py-4">
                                        ドラッグ&ドロップで移動
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 詳細モーダル */}
            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                    onSaveNote={handleSaveNote}
                    isPending={isPending}
                />
            )}
        </div>
    );
}

// 詳細モーダルコンポーネント
function BookingDetailModal({
    booking,
    onClose,
    onSaveNote,
    isPending,
}: {
    booking: ConsultationBooking;
    onClose: () => void;
    onSaveNote: (id: string, note: string) => void;
    isPending: boolean;
}) {
    const [note, setNote] = useState(booking.admin_note || "");

    const statusLabels: Record<string, string> = {
        booked: "予約済み",
        confirmed: "確認済み",
        rescheduled: "リスケ",
        completed: "面談完了",
        canceled: "キャンセル",
        no_show: "不参加",
    };

    const outcomeLabels: Record<string, string> = {
        pending: "未定",
        placed: "成約",
        declined: "不成約",
        withdrawn: "取り下げ",
    };

    const clickTypeLabel = booking.click_type === "apply" ? "応募" : booking.click_type === "consult" ? "相談" : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">面談予約詳細</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* 基本情報 */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-800">{booking.attendee_name || "名前未登録"}</span>
                        </div>
                        {booking.attendee_email && (
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <a href={`mailto:${booking.attendee_email}`} className="text-sm text-blue-600 hover:underline">{booking.attendee_email}</a>
                            </div>
                        )}
                        {(booking.attendee_phone || booking.profile_phone) && (
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <a href={`tel:${booking.attendee_phone || booking.profile_phone}`} className="text-sm text-blue-600 hover:underline">{booking.attendee_phone || booking.profile_phone}</a>
                            </div>
                        )}
                    </div>

                    {/* 予約元 */}
                    <div className="bg-blue-50 rounded-lg p-3 space-y-1.5">
                        <p className="text-xs font-medium text-blue-700 mb-1">予約元</p>
                        {booking.job_title ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-blue-500" />
                                    {booking.job_id ? (
                                        <a
                                            href={`/jobs/${booking.job_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-slate-800 hover:text-blue-600 hover:underline flex items-center gap-1"
                                        >
                                            {booking.job_title}
                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        </a>
                                    ) : (
                                        <span className="text-sm text-slate-800">{booking.job_title}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {clickTypeLabel && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            booking.click_type === "apply"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-blue-100 text-blue-700"
                                        }`}>
                                            {clickTypeLabel}
                                        </span>
                                    )}
                                    {booking.listing_source_name && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                            {booking.listing_source_name}
                                        </span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-600">直接リンク</span>
                                {clickTypeLabel && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                                        {clickTypeLabel}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 予約情報 */}
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                        {booking.starts_at && (
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-700">
                                    {new Date(booking.starts_at).toLocaleString("ja-JP", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                    {booking.ends_at && (
                                        <> 〜 {new Date(booking.ends_at).toLocaleString("ja-JP", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}</>
                                    )}
                                </span>
                            </div>
                        )}
                        {booking.meeting_url && (
                            <div className="flex items-center gap-2">
                                <Video className="w-4 h-4 text-slate-400" />
                                <a href={booking.meeting_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate">
                                    会議に参加
                                </a>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-xs text-slate-500">
                                ステータス: <span className="font-medium">{statusLabels[booking.status] || booking.status}</span>
                                {" / "}
                                結果: <span className="font-medium">{outcomeLabels[booking.outcome] || booking.outcome}</span>
                            </span>
                        </div>
                    </div>

                    {/* メモ */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">管理者メモ</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="面談の内容や次のアクションをメモ..."
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                        />
                        <button
                            onClick={() => onSaveNote(booking.id, note)}
                            disabled={isPending || note === (booking.admin_note || "")}
                            className="mt-2 px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isPending ? "保存中..." : "メモを保存"}
                        </button>
                    </div>

                    {/* 登録日時 */}
                    <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                        登録日時: {new Date(booking.created_at).toLocaleString("ja-JP")}
                    </div>
                </div>
            </div>
        </div>
    );
}

// 予約元バッジ（カード用）
function BookingSourceBadge({ booking }: { booking: ConsultationBooking }) {
    const clickLabel = booking.click_type === "apply" ? "応募" : booking.click_type === "consult" ? "相談" : null;

    if (booking.job_title) {
        return (
            <div className="flex items-center gap-1 mt-1 min-w-0">
                <Briefcase className="w-3 h-3 text-blue-500 flex-shrink-0" />
                <span className="text-xs text-slate-600 truncate">{booking.job_title}</span>
                {clickLabel && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium ${
                        booking.click_type === "apply"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                    }`}>
                        {clickLabel}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 mt-1">
            <Link2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-500">直接リンク</span>
            {clickLabel && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0 font-medium">
                    {clickLabel}
                </span>
            )}
        </div>
    );
}
