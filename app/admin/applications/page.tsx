import { getLeadManagementData } from "../analytics/actions";
import AnalyticsDashboard from "../analytics/AnalyticsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
    const data = await getLeadManagementData("30d");

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">応募管理ダッシュボード</h1>
            <AnalyticsDashboard initialData={data} />
        </div>
    );
}
