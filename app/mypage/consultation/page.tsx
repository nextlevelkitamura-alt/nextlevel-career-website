"use client";

import Link from "next/link";
import { Calendar, MessageCircle, ChevronRight, ExternalLink } from "lucide-react";

export default function ConsultationPage() {
    return (
        <div className="container mx-auto px-4 py-6 md:py-12 max-w-2xl h-[calc(100vh-80px)] md:h-auto flex flex-col justify-start md:justify-center">
            <div className="text-center mb-6 md:mb-10 shrink-0">
                <h1 className="text-xl md:text-3xl font-bold text-slate-900 mb-2">相談メニュー</h1>
                <p className="text-xs md:text-base text-slate-500">ご希望の方法を選択してください</p>
            </div>

            <div className="space-y-3 md:space-y-4 flex-1 md:flex-none">
                {/* 1. Interview Booking (Google Calendar) */}
                <a
                    href="https://calendar.app.google/xuRE3xjuCzH86EsL7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group w-full"
                >
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base md:text-lg font-bold text-slate-900">面談を予約する</h2>
                            <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold whitespace-nowrap hidden sm:inline-block">推奨</span>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 mt-0.5 truncate">アドバイザーと直接お話しできます</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 ml-2" />
                </a>

                {/* 2. Chat (Internal) */}
                <Link
                    href="/mypage/chat"
                    className="flex items-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition-all group w-full"
                >
                    <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="text-base md:text-lg font-bold text-slate-900">チャットで相談</h2>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 mt-0.5 truncate">LINE感覚で気軽に質問できます</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors shrink-0 ml-2" />
                </Link>

            </div>

            {/* Helper text for Mobile height adjustments if screen is very tall */}
            <div className="h-4 md:hidden"></div>
        </div>
    );
}
