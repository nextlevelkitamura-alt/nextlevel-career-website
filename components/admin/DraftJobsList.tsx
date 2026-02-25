"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Edit, Trash2, CheckCircle, AlertCircle, XCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { DraftJob } from "@/utils/types";

interface DraftJobsListProps {
    batchId: string | null;
    onEdit: (draftJob: DraftJob) => void;
    onDelete: (id: string) => void;
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onSelectAll: () => void;
}

export default function DraftJobsList({
    batchId,
    onEdit,
    onDelete,
    selectedIds,
    onToggleSelect,
    onSelectAll,
}: DraftJobsListProps) {
    const [draftJobs, setDraftJobs] = useState<DraftJob[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDraftJobs = useCallback(async () => {
        if (!batchId) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/admin/draft-jobs?batchId=${batchId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch draft jobs");
            }
            const data = await response.json();
            setDraftJobs(data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setLoading(false);
        }
    }, [batchId]);

    // Fetch draft jobs
    useEffect(() => {
        if (batchId) {
            fetchDraftJobs();
        }
    }, [batchId, fetchDraftJobs]);

    // Poll for updates
    useEffect(() => {
        if (!batchId) return;

        const interval = setInterval(() => {
            fetchDraftJobs();
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [batchId, fetchDraftJobs]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'success':
                return '✓ 抽出成功';
            case 'warning':
                return '⚠ 要確認';
            case 'error':
                return '✗ エラー';
            default:
                return '';
        }
    };

    const getConfidenceStars = (confidence: number) => {
        const stars = Math.round(confidence / 20); // 0-100 to 0-5 stars
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={cn(
                    "w-4 h-4",
                    i < stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                )}
            />
        ));
    };

    const allSelected = draftJobs.length > 0 && draftJobs.every(job => selectedIds.includes(job.id));

    if (loading && draftJobs.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">AI抽出処理中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-700 font-medium">エラーが発生しました</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
        );
    }

    if (draftJobs.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">まだ抽出された求人がありません</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with Select All */}
            <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={onSelectAll}
                        className="w-5 h-5 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                    />
                    <span className="font-semibold text-slate-900">
                        すべて選択 ({selectedIds.length} / {draftJobs.length})
                    </span>
                </div>
                <div className="text-sm text-slate-600">
                    成功: {draftJobs.filter(j => j.extraction_status === 'success').length} |{' '}
                    要確認: {draftJobs.filter(j => j.extraction_status === 'warning').length} |{' '}
                    エラー: {draftJobs.filter(j => j.extraction_status === 'error').length}
                </div>
            </div>

            {/* Draft Jobs List */}
            <div className="space-y-3">
                {draftJobs.map((job) => (
                    <div
                        key={job.id}
                        className={cn(
                            "border rounded-lg p-4 transition-all",
                            selectedIds.includes(job.id)
                                ? "border-primary-500 bg-primary-50"
                                : "border-slate-200 bg-white hover:border-slate-300"
                        )}
                    >
                        <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(job.id)}
                                onChange={() => onToggleSelect(job.id)}
                                className="mt-1 w-5 h-5 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                            />

                            {/* Status Icon */}
                            <div className="flex-shrink-0 mt-1">
                                {getStatusIcon(job.extraction_status)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900">{job.title}</h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-600">
                                    {job.area && <span>{job.area}</span>}
                                    {job.salary && <span>|</span>}
                                    {job.salary && <span>{job.salary}</span>}
                                </div>

                                {/* Tags */}
                                {job.tags && job.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {job.tags.slice(0, 5).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {job.tags.length > 5 && (
                                            <span className="text-xs text-slate-500">
                                                +{job.tags.length - 5}件
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Warnings */}
                                {job.extraction_warnings && job.extraction_warnings.length > 0 && (
                                    <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded">
                                        ⚠ {job.extraction_warnings[0]}
                                    </div>
                                )}

                                {/* AI Confidence */}
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-slate-600">AI信頼度:</span>
                                    <div className="flex items-center gap-0.5">
                                        {getConfidenceStars(job.ai_confidence)}
                                    </div>
                                    <span className="text-xs text-slate-600">({job.ai_confidence}%)</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onEdit(job)}
                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-primary-600 transition-colors"
                                    title="編集"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (confirm("この下書きを削除してもよろしいですか？")) {
                                            onDelete(job.id);
                                        }
                                    }}
                                    className="p-2 hover:bg-red-100 rounded-lg text-slate-600 hover:text-red-600 transition-colors"
                                    title="削除"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Status Text */}
                        <div className="mt-3 pt-3 border-t border-slate-100">
                            <span className={cn(
                                "text-sm font-medium",
                                job.extraction_status === 'success' && "text-green-600",
                                job.extraction_status === 'warning' && "text-yellow-600",
                                job.extraction_status === 'error' && "text-red-600"
                            )}>
                                {getStatusText(job.extraction_status)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
