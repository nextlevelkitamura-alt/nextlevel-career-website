"use client";

import { useState } from "react";
import { deleteInquiry } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Eye, X } from "lucide-react";

interface InquiryActionsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inquiry: any;
}

export default function InquiryActions({ inquiry }: InquiryActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleDelete = async () => {
        if (!confirm("本当にこの問い合わせを削除しますか？この操作は元に戻せません。")) return;

        setIsDeleting(true);
        const result = await deleteInquiry(inquiry.id);
        if (result?.error) {
            alert("削除に失敗しました: " + result.error);
        }
        setIsDeleting(false);
        // Page will revalidate automatically
    };

    return (
        <>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModal(true)}
                    className="h-8 px-2"
                >
                    <Eye className="w-4 h-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
            </div>

            {/* Detail Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
                            <h3 className="text-lg font-bold">問い合わせ詳細</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 font-medium">会社名</label>
                                    <p className="font-bold">{inquiry.company_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-medium">担当者</label>
                                    <p>{inquiry.contact_person} 様</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-medium">メールアドレス</label>
                                    <p className="text-blue-600">{inquiry.email}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-medium">電話番号</label>
                                    <p>{inquiry.phone || "-"}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-medium">受信日時</label>
                                    <p>{new Date(inquiry.created_at).toLocaleString("ja-JP")}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-medium">ステータス</label>
                                    <p>{inquiry.status}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-medium">問い合わせ内容</label>
                                <div className="mt-2 p-4 bg-slate-50 rounded-lg whitespace-pre-wrap text-sm">
                                    {inquiry.message}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-slate-50 flex justify-end">
                            <Button variant="outline" onClick={() => setShowModal(false)}>
                                閉じる
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
