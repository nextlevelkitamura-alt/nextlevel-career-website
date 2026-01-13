"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import InquiryStatusSelect from "./InquiryStatusSelect";
import InquiryDetailModal from "./InquiryDetailModal";
import { deleteInquiry, markAsRead } from "../actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function InquiriesList({ initialInquiries }: { initialInquiries: any[] }) {
    const [inquiries, setInquiries] = useState(initialInquiries);
    const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("本当に削除しますか？")) return;
        const res = await deleteInquiry(id);
        if (res?.success) {
            setInquiries(inquiries.filter(i => i.id !== id));
        }
    };

    const handleOpenDetail = (inquiry: any) => {
        setSelectedInquiry(inquiry);
        // Mark as read for this admin
        markAsRead("inquiry", inquiry.id);
    };

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="p-4 font-semibold text-slate-700 min-w-[150px]">会社名</th>
                            <th className="p-4 font-semibold text-slate-700 min-w-[120px]">担当者名</th>
                            <th className="p-4 font-semibold text-slate-700">連絡先</th>
                            <th className="p-4 font-semibold text-slate-700 min-w-[200px]">内容</th>
                            <th className="p-4 font-semibold text-slate-700 whitespace-nowrap">ステータス</th>
                            <th className="p-4 font-semibold text-slate-700 whitespace-nowrap">日時</th>
                            <th className="p-4 font-semibold text-slate-700 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inquiries && inquiries.length > 0 ? (
                            inquiries.map((inquiry) => (
                                <tr key={inquiry.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-4 text-slate-900 font-medium align-top">
                                        {inquiry.company_name}
                                    </td>
                                    <td className="p-4 text-slate-600 align-top">
                                        {inquiry.contact_person}
                                    </td>
                                    <td className="p-4 text-slate-600 text-sm align-top">
                                        <div className="flex flex-col gap-1">
                                            <span>✉️ {inquiry.email}</span>
                                            {inquiry.phone && <span>📞 {inquiry.phone}</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 text-sm align-top">
                                        <div className="max-w-[200px] truncate">
                                            {inquiry.message}
                                        </div>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-auto p-0 text-primary-600 font-bold"
                                            onClick={() => handleOpenDetail(inquiry)}
                                        >
                                            詳細を見る
                                        </Button>
                                    </td>
                                    <td className="p-4 align-top">
                                        <InquiryStatusSelect id={inquiry.id} currentStatus={inquiry.status || "未対応"} />
                                    </td>
                                    <td className="p-4 text-slate-500 text-sm whitespace-nowrap align-top">
                                        {new Date(inquiry.created_at).toLocaleString('ja-JP')}
                                    </td>
                                    <td className="p-4 text-right align-top">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDelete(inquiry.id)}
                                            title="削除"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500">
                                    問い合わせはまだありません。
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <InquiryDetailModal
                inquiry={selectedInquiry}
                onClose={() => setSelectedInquiry(null)}
            />
        </>
    );
}
