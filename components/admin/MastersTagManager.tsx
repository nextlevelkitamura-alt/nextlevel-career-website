"use client";

import { useState, useEffect } from "react";
import { getJobOptions, createJobOption, deleteJobOption } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface MastersTagManagerProps {
    category: string;
    label?: string;
}

export default function MastersTagManager({ category, label }: MastersTagManagerProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [options, setOptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [newLabel, setNewLabel] = useState("");
    const [newValue, setNewValue] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const fetchOptions = async () => {
        setIsLoading(true);
        try {
            const data = await getJobOptions(category);
            setOptions(data || []);
        } catch (e) {
            console.error(e);
            alert("データの取得に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOptions();
    }, [category]);

    const handleCreate = async () => {
        if (!newLabel.trim()) return;
        // If value is empty, use label as value (simple tag mode)
        const val = newValue.trim() || newLabel.trim();

        setIsCreating(true);
        try {
            const res = await createJobOption(category, newLabel, val);
            if (res.error) {
                alert(res.error);
            } else {
                setNewLabel("");
                setNewValue("");
                fetchOptions();
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("削除しますか？")) return;
        try {
            const res = await deleteJobOption(id);
            if (res.error) {
                alert(res.error);
            } else {
                setOptions(prev => prev.filter(o => o.id !== id));
            }
        } catch (e) {
            console.error(e);
            alert("削除に失敗しました");
        }
    };

    return (
        <div>
            {/* Create Form */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 mb-4 text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary-500" />
                    {label || category}の新規作成
                </h3>
                <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] items-end">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">タグ名 (表示名)</label>
                        <input
                            type="text"
                            placeholder="例: 未経験歓迎"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">挿入値 (任意)</label>
                        <input
                            type="text"
                            placeholder="空欄の場合はタグ名と同じになります"
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleCreate} disabled={isCreating || !newLabel.trim()} className="bg-primary-600 hover:bg-primary-700 text-white">
                        {isCreating ? <Loader2 className="animate-spin w-4 h-4" /> : "追加"}
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="animate-spin w-8 h-8 mx-auto text-slate-300" />
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                            <tr>
                                <th className="p-4 w-1/3">タグ名</th>
                                <th className="p-4 hidden md:table-cell">値</th>
                                <th className="p-4 w-20 text-center">削除</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {options.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-500 text-sm">
                                        登録されたタグはありません
                                    </td>
                                </tr>
                            ) : options.map((opt) => (
                                <tr key={opt.id} className="hover:bg-slate-50 group transition-colors">
                                    <td className="p-4 text-sm font-medium text-slate-900">{opt.label}</td>
                                    <td className="p-4 text-xs text-slate-500 font-mono hidden md:table-cell truncate max-w-[200px]">{opt.value}</td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => handleDelete(opt.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                                            title="削除"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
