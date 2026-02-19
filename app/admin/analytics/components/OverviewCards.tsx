"use client";

import { Eye, FileText, Briefcase, TrendingUp } from "lucide-react";

interface Props {
  summary: {
    totalViews: number;
    totalApplications: number;
    activeJobs: number;
    cvr: number;
  };
  isPending: boolean;
}

const cards = [
  { key: "totalViews", label: "総閲覧数", icon: Eye, color: "text-primary-600", bg: "bg-primary-50" },
  { key: "totalApplications", label: "総応募数", icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "activeJobs", label: "アクティブ求人", icon: Briefcase, color: "text-green-600", bg: "bg-green-50" },
  { key: "cvr", label: "CVR", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
] as const;

export default function OverviewCards({ summary, isPending }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = summary[card.key as keyof typeof summary];
        const display = card.key === "cvr" ? `${value}%` : value.toLocaleString();

        return (
          <div
            key={card.key}
            className={`bg-white rounded-xl border border-slate-200 p-5 transition-opacity ${
              isPending ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <span className="text-sm text-slate-500">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{display}</p>
          </div>
        );
      })}
    </div>
  );
}
