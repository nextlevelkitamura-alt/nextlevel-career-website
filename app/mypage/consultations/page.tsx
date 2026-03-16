import { getUserConsultationBookings } from "../actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CalendarDays, ExternalLink } from "lucide-react";

const CONSULTATION_STATUS_LABELS: Record<string, { label: string; className: string }> = {
    booked:      { label: "予約済み",   className: "bg-amber-100 text-amber-700" },
    confirmed:   { label: "確定",       className: "bg-blue-100 text-blue-700" },
    rescheduled: { label: "再調整中",   className: "bg-purple-100 text-purple-700" },
    completed:   { label: "完了",       className: "bg-slate-100 text-slate-600" },
    canceled:    { label: "キャンセル", className: "bg-red-100 text-red-700" },
    no_show:     { label: "不参加",     className: "bg-red-100 text-red-700" },
};

function formatBookingDate(dateStr: string) {
    const d = new Date(dateStr);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default async function ConsultationsPage() {
    const bookings = await getUserConsultationBookings();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/mypage" className="md:hidden p-2 -ml-2 text-slate-500">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">相談予約一覧</h1>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {bookings.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {bookings.map((booking: any) => {
                            const s = CONSULTATION_STATUS_LABELS[booking.status] ?? { label: booking.status, className: "bg-slate-100 text-slate-600" };
                            const isUpcoming = booking.starts_at && new Date(booking.starts_at) > new Date()
                                && (booking.status === "booked" || booking.status === "confirmed" || booking.status === "rescheduled");

                            return (
                                <div key={booking.id} className={`p-6 ${isUpcoming ? "bg-blue-50/30" : ""}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <CalendarDays className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${s.className}`}>
                                                        {s.label}
                                                    </span>
                                                    {isUpcoming && (
                                                        <span className="text-xs text-blue-600 font-bold">予定あり</span>
                                                    )}
                                                </div>
                                                <p className="text-base font-bold text-slate-900">
                                                    {booking.starts_at ? formatBookingDate(booking.starts_at) : "日時未定"}
                                                </p>
                                                {booking.jobs?.title && (
                                                    <p className="text-sm text-slate-500 mt-0.5">
                                                        求人: {booking.jobs.title}
                                                        {booking.jobs.area && ` / ${booking.jobs.area}`}
                                                    </p>
                                                )}
                                                <p className="text-xs text-slate-400 mt-1">
                                                    予約日: {new Date(booking.created_at).toLocaleDateString("ja-JP")}
                                                </p>
                                            </div>
                                        </div>
                                        {booking.meeting_url && (booking.status === "confirmed" || booking.status === "booked") && (
                                            <a
                                                href={booking.meeting_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                ミーティングURLを開く
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-16 text-center">
                        <CalendarDays className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 mb-6">まだ相談予約がありません</p>
                        <Button asChild>
                            <Link href="/mypage/consultation">相談を予約する</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
