"use client";

import { useState, useEffect } from "react";
import { updateApplicationMemo, updateApplicationStatus } from "../actions";
import { Button } from "@/components/ui/button";
import { X, Save, Loader2, User, Briefcase, FileText } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ApplicationDetailModal({ application, onClose, onUpdate }: { application: any, onClose: () => void, onUpdate: (id: string, updates: any) => void }) {
    const [memo, setMemo] = useState(application.admin_memo || "");
    const [status, setStatus] = useState(application.status);
    const [isSaving, setIsSaving] = useState(false);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        // Save Memo
        if (memo !== application.admin_memo) {
            await updateApplicationMemo(application.id, memo);
        }
        // Save Status
        if (status !== application.status) {
            await updateApplicationStatus(application.id, status);
        }

        onUpdate(application.id, { admin_memo: memo, status: status });
        setIsSaving(false);
        onClose();
    };

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return "-";
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return `${age}歳`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary-500" />
                        応募者詳細
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-6 space-y-8">
                    {/* Basic Info */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-l-4 border-primary-500 pl-2">基本情報</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">氏名</label>
                                <p className="font-bold text-slate-900 text-lg">
                                    {application.profiles?.last_name} {application.profiles?.first_name}
                                    <span className="text-sm font-normal text-slate-500 ml-2">
                                        ({application.profiles?.last_name_kana} {application.profiles?.first_name_kana})
                                    </span>
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">年齢</label>
                                <p className="font-medium text-slate-900">
                                    {application.profiles?.birth_date ? (
                                        <>
                                            {formatDate(application.profiles.birth_date)}
                                            <span className="ml-2 text-slate-600">({calculateAge(application.profiles.birth_date)})</span>
                                        </>
                                    ) : (
                                        <span className="text-slate-400">未登録</span>
                                    )}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">電話番号</label>
                                <p className="font-medium text-slate-900">{application.profiles?.phone_number || "-"}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">都道府県</label>
                                <p className="font-medium text-slate-900">{application.profiles?.prefecture || "未登録"}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">応募日時</label>
                                <p className="font-medium text-slate-900">{new Date(application.created_at).toLocaleString("ja-JP")}</p>
                            </div>
                        </div>
                    </section>

                    {/* Job Info */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-l-4 border-primary-500 pl-2 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            応募求人
                        </h3>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                            <p className="font-bold text-slate-900 mb-1">{application.jobs?.title}</p>
                            <p className="text-xs text-slate-500">Job ID: {application.jobs?.id}</p>
                        </div>
                    </section>

                    {/* Admin Controls */}
                    <section className="bg-amber-50/50 rounded-xl p-6 border border-amber-100">
                        <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            管理者記入欄
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-2">選考ステータス</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full md:w-1/2 rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="pending">選考中</option>
                                    <option value="reviewed">書類確認済</option>
                                    <option value="interview">面接設定</option>
                                    <option value="hired">採用</option>
                                    <option value="rejected">不採用</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 block mb-2">選考メモ（社内用）</label>
                                <textarea
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    placeholder="面接の印象や連絡事項などを記入してください（応募者には公開されません）"
                                    className="w-full min-h-[120px] rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                                ></textarea>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>キャンセル</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-primary-600 hover:bg-primary-700 text-white min-w-[120px]">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        保存する
                    </Button>
                </div>
            </div>
        </div>
    );
}

function formatDate(dateStr: string) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("ja-JP");
}
