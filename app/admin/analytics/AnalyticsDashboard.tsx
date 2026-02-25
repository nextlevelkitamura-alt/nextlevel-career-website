"use client";

import { useState, useTransition } from "react";
import OverviewCards from "./components/OverviewCards";
import ViewsChart from "./components/ViewsChart";
import JobRankingTable from "./components/JobRankingTable";
import ApplicationFunnel from "./components/ApplicationFunnel";
import PeriodSelector from "./components/PeriodSelector";
import {
  type EmploymentSegment,
  getAnalyticsSummary,
  getDailyViews,
  getJobRanking,
  getApplicationStatusBreakdown,
} from "./actions";
import type { Period } from "./actions";

interface Props {
  initialSummary: Awaited<ReturnType<typeof getAnalyticsSummary>>;
  initialDailyViews: Awaited<ReturnType<typeof getDailyViews>>;
  initialJobRanking: Awaited<ReturnType<typeof getJobRanking>>;
  initialStatusBreakdown: Awaited<ReturnType<typeof getApplicationStatusBreakdown>>;
}

export default function AnalyticsDashboard({
  initialSummary,
  initialDailyViews,
  initialJobRanking,
  initialStatusBreakdown,
}: Props) {
  const [period, setPeriod] = useState<Period>("30d");
  const [segment, setSegment] = useState<EmploymentSegment>("all");
  const [summary, setSummary] = useState(initialSummary);
  const [dailyViews, setDailyViews] = useState(initialDailyViews);
  const [jobRanking, setJobRanking] = useState(initialJobRanking);
  const [statusBreakdown, setStatusBreakdown] = useState(initialStatusBreakdown);
  const [isPending, startTransition] = useTransition();

  const refreshAnalytics = (nextPeriod: Period, nextSegment: EmploymentSegment) => {
    startTransition(async () => {
      const [s, d, j, st] = await Promise.all([
        getAnalyticsSummary(nextPeriod, nextSegment),
        getDailyViews(nextPeriod, nextSegment),
        getJobRanking(nextPeriod, 20, nextSegment),
        getApplicationStatusBreakdown(nextPeriod, nextSegment),
      ]);
      setSummary(s);
      setDailyViews(d);
      setJobRanking(j);
      setStatusBreakdown(st);
    });
  };

  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    refreshAnalytics(newPeriod, segment);
  };

  const handleSegmentChange = (newSegment: EmploymentSegment) => {
    setSegment(newSegment);
    refreshAnalytics(period, newSegment);
  };

  return (
    <div className="space-y-6">
      <PeriodSelector
        value={period}
        onChange={handlePeriodChange}
        segment={segment}
        onSegmentChange={handleSegmentChange}
        isPending={isPending}
      />
      <OverviewCards summary={summary} isPending={isPending} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ViewsChart data={dailyViews} isPending={isPending} />
        </div>
        <div>
          <ApplicationFunnel data={statusBreakdown} isPending={isPending} />
        </div>
      </div>
      <JobRankingTable data={jobRanking} isPending={isPending} />
    </div>
  );
}
