import { getJobs } from "../actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";
import AdminSearch from "./AdminSearch";
import JobsTable from "./JobsTable";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage({
    searchParams,
}: {
    searchParams?: {
        q?: string;
    };
}) {
    const query = searchParams?.q || "";
    const jobs = await getJobs(query);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-2xl font-bold text-slate-900 shrink-0">求人管理</h1>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar mask-gradient-right md:mask-none">
                    <Link href="/admin/jobs/masters" className="shrink-0">
                        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                            <Building2 className="w-4 h-4 mr-2" />
                            求人マスタ管理
                        </Button>
                    </Link>
                    <Link href="/admin/jobs/pre-registration" className="shrink-0">
                        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                            求人ファイル事前登録
                        </Button>
                    </Link>
                    <Link href="/admin/corporate-inquiries" className="shrink-0">
                        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                            企業問い合わせ一覧
                        </Button>
                    </Link>
                    <Link href="/admin/jobs/create" className="shrink-0">
                        <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            新規作成
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="mb-6">
                <AdminSearch />
            </div>


            <JobsTable jobs={jobs} />
        </div>
    );
}
