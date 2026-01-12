import { getAdminApplications } from "../actions";
import ApplicationsTable from "./ApplicationsTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
    const applications = await getAdminApplications();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">応募者管理</h1>
                <Link href="/admin/jobs">
                    <Button variant="outline">求人管理へ</Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <ApplicationsTable initialApplications={applications} />
            </div>
        </div>
    );
}
