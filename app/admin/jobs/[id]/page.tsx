import { getJob } from "../../actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, FileText, Building2, MapPin, Banknote, Briefcase, Tag } from "lucide-react";

interface JobAttachment {
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size: number;
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
    const job = await getJob(params.id);

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/jobs">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 font-mono">
                                {job.job_code}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {job.clients?.name || "取引先未設定"}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span>作成日: {new Date(job.created_at).toLocaleDateString("ja-JP")}</span>
                        </div>
                    </div>
                </div>
                <Link href={`/admin/jobs/${job.id}/edit`}>
                    <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                        <Edit className="w-4 h-4 mr-2" />
                        編集する
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Left Column: Job Info */}
                <div className="col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                        <h2 className="font-bold text-slate-900 border-b border-slate-100 pb-2">基本情報</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">エリア</label>
                                <div className="flex items-center gap-2 text-slate-900">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    {job.area}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">給与</label>
                                <div className="flex items-center gap-2 text-slate-900">
                                    <Banknote className="w-4 h-4 text-slate-400" />
                                    {job.salary}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">雇用形態</label>
                                <div className="flex items-center gap-2 text-slate-900">
                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                    {job.type}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">カテゴリー</label>
                                <div className="inline-block px-3 py-1 rounded-full text-sm bg-primary-50 text-primary-700">
                                    {job.category}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">タグ</label>
                                <div className="flex flex-wrap gap-2">
                                    {job.tags && job.tags.length > 0 ? (
                                        job.tags.map((tag: string, i: number) => (
                                            <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-slate-100 text-slate-600">
                                                <Tag className="w-3 h-3" />
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 text-sm">-</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: PDF Viewer */}
                <div className="col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full min-h-[800px] flex flex-col">
                        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                            <h2 className="font-bold text-slate-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-500" />
                                求人票・添付ファイル
                            </h2>
                            {job.pdf_url && (
                                <a
                                    href={job.pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary-600 hover:underline"
                                >
                                    別タブで開く
                                </a>
                            )}
                        </div>

                        <div className="flex-1 bg-slate-100 flex flex-col">
                            {/* Attachment List */}
                            {(job.job_attachments?.length > 0 || job.pdf_url) && (
                                <div className="p-4 bg-white border-b border-slate-200 space-y-2">
                                    <p className="text-xs font-bold text-slate-500">添付ファイル一覧</p>
                                    <div className="flex flex-wrap gap-2">
                                        {job.job_attachments?.map((file: JobAttachment) => (
                                            <a
                                                key={file.id}
                                                href={file.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors group"
                                            >
                                                <FileText className="w-4 h-4 text-slate-400 group-hover:text-primary-500" />
                                                <span className="text-sm text-slate-700 group-hover:text-primary-700 max-w-[200px] truncate">
                                                    {file.file_name}
                                                </span>
                                            </a>
                                        ))}
                                        {job.pdf_url && (
                                            <a
                                                href={job.pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors group"
                                            >
                                                <FileText className="w-4 h-4 text-amber-400 group-hover:text-amber-600" />
                                                <span className="text-sm text-amber-700 group-hover:text-amber-800">
                                                    Legacy PDF
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* PDF Preview (First PDF found) */}
                            {(job.job_attachments?.find((f: JobAttachment) => f.file_type?.includes('pdf') || f.file_name?.endsWith('.pdf'))?.file_url || job.pdf_url) ? (
                                <iframe
                                    src={job.job_attachments?.find((f: JobAttachment) => f.file_type?.includes('pdf') || f.file_name?.endsWith('.pdf'))?.file_url || job.pdf_url}
                                    className="w-full h-full min-h-[800px]"
                                    title="求人票PDF"
                                />
                            ) : (
                                <div className="flex-1 flex items-center justify-center min-h-[400px]">
                                    <div className="text-center text-slate-400">
                                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                        <p>プレビュー可能なPDFがありません</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
