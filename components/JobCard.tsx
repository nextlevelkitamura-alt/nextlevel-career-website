import { Job } from "@/app/jobs/jobsData";
import { Button } from "@/components/ui/button";
import { MapPin, Banknote, Tag, FileText, Paperclip } from "lucide-react";
import Link from "next/link";

interface JobCardProps {
    job: Job;
}

export default function JobCard({ job }: JobCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex items-start justify-between mb-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                    {job.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {job.job_code || "-"}</span>
            </div>

            <div className="mb-4">
                <span className="text-sm text-slate-500">{job.type}</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2 flex-grow">
                {job.title}
            </h3>

            <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                    {job.area}
                </div>
                <div className="flex items-center text-sm text-slate-600">
                    <Banknote className="w-4 h-4 mr-2 text-slate-400" />
                    {job.salary}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {job.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                    </span>
                ))}
            </div>

            {/* Attachments */}
            {job.job_attachments && job.job_attachments.length > 0 && (
                <div className="mb-6 space-y-2">
                    <div className="flex items-center text-xs font-bold text-slate-500 mb-1">
                        <Paperclip className="w-3 h-3 mr-1" />
                        添付ファイル
                    </div>
                    {job.job_attachments.map((file) => (
                        <a
                            key={file.id}
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-2 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100 transition-colors group"
                        >
                            <FileText className="w-4 h-4 text-slate-400 group-hover:text-primary-600 mr-2" />
                            <span className="text-xs text-slate-600 group-hover:text-primary-700 truncate max-w-[200px]">
                                {file.file_name}
                            </span>
                        </a>
                    ))}
                </div>
            )}

            <div className="mt-auto">
                <Button asChild className="w-full bg-primary-600 hover:bg-primary-700 border-0">
                    <Link href={`/jobs/${job.id}`}>詳細を見る</Link>
                </Button>
            </div>
        </div>
    );
}
