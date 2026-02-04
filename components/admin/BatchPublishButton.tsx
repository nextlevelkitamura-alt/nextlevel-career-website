"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { publishDraftJobs } from "@/app/admin/actions";
import { toast } from "sonner";

interface BatchPublishButtonProps {
    selectedIds: string[];
    onComplete: () => void;
}

export default function BatchPublishButton({ selectedIds, onComplete }: BatchPublishButtonProps) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const handlePublish = async () => {
        setIsPublishing(true);

        const result = await publishDraftJobs(selectedIds);
        setIsPublishing(false);

        if (result.error) {
            toast.error("公開に失敗しました", {
                description: result.error,
            });
        } else {
            toast.success(`${result.count}件の求人を公開しました！`);
            onComplete();
            setIsConfirmOpen(false);
        }
    };

    if (selectedIds.length === 0) {
        return (
            <button
                type="button"
                disabled
                className="px-6 py-3 bg-slate-400 text-white rounded-lg cursor-not-allowed"
            >
                求人を選択してください
            </button>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2"
            >
                <CheckCircle className="w-5 h-5" />
                {selectedIds.length}件を一括公開
            </button>

            {/* Confirmation Modal */}
            {isConfirmOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                    公開の確認
                                </h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    以下の{selectedIds.length}件の求人を公開します。
                                </p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-yellow-800 font-medium">
                                ⚠ 公開後に取り消すことはできません
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                                求職者が閲覧・応募できるようになります。
                                内容を確認の上、公開してください。
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsConfirmOpen(false)}
                                disabled={isPublishing}
                                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                キャンセル
                            </button>
                            <button
                                type="button"
                                onClick={handlePublish}
                                disabled={isPublishing}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400 transition-colors"
                            >
                                {isPublishing ? "公開中..." : "公開する"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
