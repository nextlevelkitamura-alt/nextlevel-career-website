import { getUserConsultationBookings } from "../actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CalendarDays, ExternalLink, Video, Phone } from "lucide-react";

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

type MeetingInfo =
    | { type: "google_meet"; url: string }
    | { type: "video_url"; url: string }
    | { type: "phone" }
    | { type: "unknown" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMeetingInfo(booking: any): MeetingInfo {
    const url = booking.meeting_url as string | null | undefined;

    if (url && /meet\.google\.com/i.test(url)) {
        return { type: "google_meet", url };
    }

    if (url && /^https?:\/\//i.test(url)) {
        return { type: "video_url", url };
    }

    // raw_payload の location から電話面談かどうかを判定
    const rawLocation =
        (booking.raw_payload as Record<string, unknown> | null)?.location ??
        ((booking.raw_payload as Record<string, unknown> | null)?.data as Record<string, unknown> | undefined)?.location;

    if (typeof rawLocation === "string") {
        const loc = rawLocation.trim().toLowerCase();
        if (loc === "phone" || loc === "attendeephone" || /^[\+\d\-\(\)\s]{7,}$/.test(rawLocation.trim())) {
            return { type: "phone" };
        }
    }

    if (booking.attendee_phone) {
        return { type: "phone" };
    }

    return { type: "unknown" };
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
                            const isActive = booking.status === "booked" || booking.status === "confirmed" || booking.status === "rescheduled";
                            const isUpcoming = booking.starts_at && new Date(booking.starts_at) > new Date() && isActive;
                            const meetingInfo = getMeetingInfo(booking);
                            const showMeetingInfo = isActive && meetingInfo.type !== "unknown";

                            return (
                                <div key={booking.id} className={`p-6 ${isUpcoming ? "bg-blue-50/30" : ""}`}>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <CalendarDays className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
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

                                                {/* 面談情報ブロック */}
                                                {showMeetingInfo && (
                                                    <div className={`mt-3 p-3 rounded-lg border ${isUpcoming ? "bg-white border-blue-200" : "bg-slate-50 border-slate-200"}`}>
                                                        {meetingInfo.type === "google_meet" && (
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Video className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                                                                        Google Meet
                                                                    </span>
                                                                </div>
                                                                <a
                                                                    href={meetingInfo.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors w-fit"
                                                                >
                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                    Google Meet に参加
                                                                </a>
                                                            </div>
                                                        )}

                                                        {meetingInfo.type === "video_url" && (
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Video className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                                                        オンライン面談
                                                                    </span>
                                                                </div>
                                                                <a
                                                                    href={meetingInfo.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors w-fit"
                                                                >
                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                    URLを開く
                                                                </a>
                                                            </div>
                                                        )}

                                                        {meetingInfo.type === "phone" && (
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                                                        電話面談
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-slate-600">
                                                                    面談時間になりましたら、担当者よりお電話いたします。
                                                                </p>
                                                                {booking.attendee_phone && (
                                                                    <p className="text-xs text-slate-500">
                                                                        ご登録のお電話番号: <span className="font-medium text-slate-700">{booking.attendee_phone}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <p className="text-xs text-slate-400 mt-2">
                                                    予約日: {new Date(booking.created_at).toLocaleDateString("ja-JP")}
                                                </p>
                                            </div>
                                        </div>
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
