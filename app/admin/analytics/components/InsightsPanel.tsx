"use client";

import ViewsChart from "./ViewsChart";
import ApplicationFunnel from "./ApplicationFunnel";
import JobRankingTable from "./JobRankingTable";
import { Loader2 } from "lucide-react";

interface Props {
  dailyViews: {
    date: string;
    views: number;
    applications: number;
    applyClicks: number;
    consultClicks: number;
  }[] | null;
  jobRanking: {
    id: string;
    title: string;
    area: string | null;
    type: string | null;
    category: string | null;
    views: number;
    applications: number;
    cvr: number;
    applyClicks: number;
    consultClicks: number;
  }[] | null;
  statusBreakdown: {
    pending: number;
    reviewed: number;
    interview: number;
    hired: number;
    rejected: number;
  } | null;
  isPending: boolean;
}

export default function InsightsPanel({
  dailyViews,
  jobRanking,
  statusBreakdown,
  isPending,
}: Props) {
  if (!dailyViews && !jobRanking && !statusBreakdown) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        データを読み込んでいます...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ViewsChart data={dailyViews || []} isPending={isPending} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ApplicationFunnel
          data={statusBreakdown || { pending: 0, reviewed: 0, interview: 0, hired: 0, rejected: 0 }}
          isPending={isPending}
        />
        <JobRankingTable data={jobRanking || []} isPending={isPending} />
      </div>
    </div>
  );
}
