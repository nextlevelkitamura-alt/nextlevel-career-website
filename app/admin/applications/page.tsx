import { getLeadManagementData } from "../analytics/actions";
import { getConsultationBookings } from "../actions/consultations";
import ApplicationsPageTabs from "./ApplicationsPageTabs";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
    const [leadData, consultations] = await Promise.all([
        getLeadManagementData("30d"),
        getConsultationBookings(),
    ]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">応募管理ダッシュボード</h1>
            <ApplicationsPageTabs
                leadData={leadData}
                consultations={consultations}
            />
        </div>
    );
}
