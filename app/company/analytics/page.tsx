import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  getAnalyticsSummary,
  getDailyViews,
  getJobRanking,
  getApplicationStatusBreakdown,
  type Period,
} from "../../admin/analytics/actions";
import CompanyAnalyticsDashboard from "./CompanyAnalyticsDashboard";

export const dynamic = "force-dynamic";

export default async function CompanyAnalyticsPage({
  searchParams,
}: {
  searchParams: { period?: Period };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            アクセス権限がありません
          </h1>
          <p className="text-slate-600 mb-6">
            このページを表示するには管理者権限が必要です。
          </p>
          <a
            href="/"
            className="inline-block text-primary-600 hover:underline"
          >
            トップページへ戻る
          </a>
        </div>
      </div>
    );
  }

  const period = searchParams.period || "30d";

  const [summary, dailyViews, jobRanking, statusBreakdown] = await Promise.all([
    getAnalyticsSummary(period),
    getDailyViews(period),
    getJobRanking(period),
    getApplicationStatusBreakdown(period),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <CompanyAnalyticsDashboard
          initialSummary={summary}
          initialDailyViews={dailyViews}
          initialJobRanking={jobRanking}
          initialStatusBreakdown={statusBreakdown}
          initialPeriod={period}
        />
      </div>
    </div>
  );
}
