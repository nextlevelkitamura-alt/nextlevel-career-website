import {
  getAnalyticsSummary,
  getDailyViews,
  getJobRanking,
  getApplicationStatusBreakdown,
} from "./actions";
import AnalyticsDashboard from "./AnalyticsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [summary, dailyViews, jobRanking, statusBreakdown] = await Promise.all([
    getAnalyticsSummary("30d"),
    getDailyViews("30d"),
    getJobRanking("30d"),
    getApplicationStatusBreakdown("30d"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">アナリティクス</h1>
      <AnalyticsDashboard
        initialSummary={summary}
        initialDailyViews={dailyViews}
        initialJobRanking={jobRanking}
        initialStatusBreakdown={statusBreakdown}
      />
    </div>
  );
}
