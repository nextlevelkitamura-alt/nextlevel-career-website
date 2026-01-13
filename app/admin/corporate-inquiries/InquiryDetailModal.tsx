"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function InquiryDetailModal({ inquiry, onClose }: { inquiry: any, onClose: () => void }) {
    if (!inquiry) return null;

    return (
        <Dialog open={!!inquiry} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>問い合わせ詳細</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <p className="text-slate-400">会社名</p>
                            <p className="font-bold">{inquiry.company_name}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-400">担当者名</p>
                            <p className="font-bold">{inquiry.contact_person}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-400">メールアドレス</p>
                            <p className="font-medium text-primary-600">{inquiry.email}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-400">電話番号</p>
                            <p className="font-medium">{inquiry.phone || "-"}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-slate-400">問い合わせ内容</p>
                        <div className="p-4 bg-slate-50 rounded-xl text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100">
                            {inquiry.message}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button variant="outline" onClick={onClose}>閉じる</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
