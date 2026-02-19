"use client";

import { useState, useTransition } from "react";
import OverviewCards from "../../admin/analytics/components/OverviewCards";
import ViewsChart from "../../admin/analytics/components/ViewsChart";
import JobRankingTable from "../../admin/analytics/components/JobRankingTable";
import ApplicationFunnel from "../../admin/analytics/components/ApplicationFunnel";
import PeriodSelector from "../../admin/analytics/components/PeriodSelector";
import {
  getAnalyticsSummary,
  getDailyViews,
  getJobRanking,
  getApplicationStatusBreakdown,
  type Period,
} from "../../admin/analytics/actions";

interface Props {
  initialSummary: Awaited<ReturnType<typeof getAnalyticsSummary>>;
  initialDailyViews: Awaited<ReturnType<typeof getDailyViews>>;
  initialJobRanking: Awaited<ReturnType<typeof getJobRanking>>;
  initialStatusBreakdown: Awaited<ReturnType<typeof getApplicationStatusBreakdown>>;
  initialPeriod: Period;
}

export default function CompanyAnalyticsDashboard({
  initialSummary,
  initialDailyViews,
  initialJobRanking,
  initialStatusBreakdown,
  initialPeriod,
}: Props) {
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [summary, setSummary] = useState(initialSummary);
  const [dailyViews, setDailyViews] = useState(initialDailyViews);
  const [jobRanking, setJobRanking] = useState(initialJobRanking);
  const [statusBreakdown, setStatusBreakdown] = useState(initialStatusBreakdown);
  const [isPending, startTransition] = useTransition();

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set("period", newPeriod);
    window.history.pushState({}, "", url.toString());

    startTransition(async () => {
      const [s, d, j, st] = await Promise.all([
        getAnalyticsSummary(newPeriod),
        getDailyViews(newPeriod),
        getJobRanking(newPeriod),
        getApplicationStatusBreakdown(newPeriod),
      ]);
      setSummary(s);
      setDailyViews(d);
      setJobRanking(j);
      setStatusBreakdown(st);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            分析
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            求人のパフォーマンスを確認できます
          </p>
        </div>
        <PeriodSelector
          value={period}
          onChange={handlePeriodChange}
          isPending={isPending}
        />
      </div>

      {/* Cards */}
      <OverviewCards summary={summary} isPending={isPending} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ViewsChart data={dailyViews} isPending={isPending} />
        </div>
        <div>
          <ApplicationFunnel data={statusBreakdown} isPending={isPending} />
        </div>
      </div>

      {/* Ranking Table */}
      <JobRankingTable data={jobRanking} isPending={isPending} />
    </div>
  );
}
