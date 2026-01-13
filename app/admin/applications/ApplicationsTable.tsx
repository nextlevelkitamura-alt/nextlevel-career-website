"use client";

import { useState } from "react";
import { updateApplicationStatus } from "../actions";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ApplicationDetailModal from "./ApplicationDetailModal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ApplicationsTable({ initialApplications }: { initialApplications: any[] }) {
    const [applications, setApplications] = useState(initialApplications);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedApp, setSelectedApp] = useState<any | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUpdate = (id: string, updates: any) => {
        setApplications(apps => apps.map(app =>
            app.id === id ? { ...app, ...updates } : app
        ));
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        if (updatingId) return;
        setUpdatingId(id);

        const result = await updateApplicationStatus(id, newStatus);

        if (result.success) {
            setApplications(apps => apps.map(app =>
                app.id === id ? { ...app, status: newStatus } : app
            ));
        } else {
            alert("更新に失敗しました: " + result.error);
        }
        setUpdatingId(null);
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                    <tr>
                        <th className="p-4 whitespace-nowrap">応募日時</th>
                        <th className="p-4 whitespace-nowrap">氏名</th>
                        <th className="p-4 whitespace-nowrap">求人タイトル</th>
                        <th className="p-4 whitespace-nowrap">現在のステータス</th>
                        <th className="p-4 whitespace-nowrap">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {applications.length > 0 ? (
                        applications.map((app) => (
                            <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 whitespace-nowrap">
                                    {new Date(app.created_at).toLocaleString("ja-JP")}
                                </td>
                                <td className="p-4 font-bold text-slate-800">
                                    {app.profiles ? (
                                        <>
                                            {app.profiles.last_name} {app.profiles.first_name}
                                            <div className="text-xs text-slate-400 font-normal">
                                                {app.profiles.last_name_kana} {app.profiles.first_name_kana}
                                                {app.profiles.prefecture && ` / ${app.profiles.prefecture}`}
                                                {app.profiles.birth_date && ` / ${calculateAge(app.profiles.birth_date)}歳`}
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-slate-400">(プロフィール未登録)</span>
                                    )}
                                </td>
                                <td className="p-4 max-w-xs truncate">
                                    <Link href={`/jobs/${app.jobs?.id}`} className="text-primary-600 hover:underline" target="_blank">
                                        {app.jobs?.title || "削除された求人"}
                                    </Link>
                                </td>
                                <td className="p-4">
                                    <select
                                        value={app.status}
                                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                        disabled={updatingId === app.id}
                                        className={`px-3 py-1.5 rounded border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer ${app.status === 'pending' ? 'bg-slate-50 text-slate-700' :
                                            app.status === 'reviewed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                app.status === 'interview' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    app.status === 'hired' ? 'bg-green-50 text-green-700 border-green-200' :
                                                        'bg-red-50 text-red-700 border-red-200'
                                            }`}
                                    >
                                        <option value="pending">選考中</option>
                                        <option value="reviewed">書類確認済</option>
                                        <option value="interview">面接設定</option>
                                        <option value="hired">採用</option>
                                        <option value="rejected">不採用</option>
                                    </select>
                                    {updatingId === app.id && <Loader2 className="inline ml-2 h-4 w-4 animate-spin text-slate-400" />}
                                </td>
                                <td className="p-4">
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setSelectedApp(app);
                                        // Mark as read when details are opened
                                        import("@/app/admin/actions").then(m => m.markAsRead("application", app.id));
                                    }}>
                                        詳細
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500">
                                応募はまだありません
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {selectedApp && (
                <ApplicationDetailModal
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    );
}

function calculateAge(birthDate: string) {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}
