"use client";

import { useState } from "react";
import type { LeadManagementData } from "../analytics/actions";
import type { ConsultationBooking } from "../actions/consultations";
import AnalyticsDashboard from "../analytics/AnalyticsDashboard";
import ConsultationKanban from "@/components/admin/ConsultationKanban";

interface Props {
    leadData: LeadManagementData;
    consultations: ConsultationBooking[];
}

export default function ApplicationsPageTabs({ leadData, consultations }: Props) {
    const [activeTab, setActiveTab] = useState<"applications" | "consultations">("applications");

    return (
        <div>
            {/* タブヘッダー */}
            <div className="flex gap-1 bg-slate-200 rounded-lg p-1 mb-6">
                <button
                    onClick={() => setActiveTab("applications")}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === "applications"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                    応募一覧
                </button>
                <button
                    onClick={() => setActiveTab("consultations")}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === "consultations"
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                    面談予約
                    {consultations.filter(c => c.status === "booked" || c.status === "confirmed").length > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold text-white bg-emerald-600 rounded-full">
                            {consultations.filter(c => c.status === "booked" || c.status === "confirmed").length}
                        </span>
                    )}
                </button>
            </div>

            {/* タブコンテンツ */}
            {activeTab === "applications" ? (
                <AnalyticsDashboard initialData={leadData} />
            ) : (
                <ConsultationKanban initialData={consultations} />
            )}
        </div>
    );
}
