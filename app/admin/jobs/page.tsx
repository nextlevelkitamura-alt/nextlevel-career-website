import { getJobs, deleteJob } from "../actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, Building2 } from "lucide-react";
import AdminSearch from "./AdminSearch";

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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">求人管理</h1>
                <div className="flex gap-2">
                    <Link href="/admin/jobs/masters">
                        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                            <Building2 className="w-4 h-4 mr-2" />
                            求人マスタ管理
                        </Button>
                    </Link>
                    <Link href="/admin/jobs/pre-registration">
                        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                            求人ファイル事前登録
                        </Button>
                    </Link>
                    <Link href="/admin/corporate-inquiries">
                        <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                            企業問い合わせ一覧
                        </Button>
                    </Link>
                    <Link href="/admin/jobs/create">
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


            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-4 font-semibold text-slate-700">ID</th>
                            <th className="p-4 font-semibold text-slate-700">求人元</th>
                            <th className="p-4 font-semibold text-slate-700">タイトル</th>
                            <th className="p-4 font-semibold text-slate-700">エリア</th>
                            <th className="p-4 font-semibold text-slate-700">PDF</th>
                            <th className="p-4 font-semibold text-slate-700">給与</th>
                            <th className="p-4 font-semibold text-slate-700 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs && jobs.length > 0 ? (
                            jobs.map((job) => (
                                <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4 font-mono text-sm text-slate-500">{job.job_code || "-"}</td>
                                    <td className="p-4 text-sm text-slate-600">
                                        {job.clients?.name ? (
                                            <span className="inline-block px-2 py-1 bg-slate-100 rounded text-slate-700">
                                                {job.clients.name}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 font-medium text-slate-900">{job.title}</td>
                                    <td className="p-4 text-slate-600">{job.area}</td>
                                    <td className="p-4 text-slate-600">
                                        {(job.job_attachments && job.job_attachments.length > 0) || job.pdf_url ? (
                                            <span className="text-primary-600" title="PDFあり">
                                                📄
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-600">{job.salary}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/jobs/${job.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary-600 hover:bg-primary-50">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/jobs/${job.id}/edit`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary-600 hover:bg-primary-50">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <form action={async () => {
                                                "use server";
                                                await deleteJob(job.id);
                                            }}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                                    type="submit"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    求人がまだ登録されていません。
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
