"use client";

import { useState, useEffect } from "react";
import { getJobOptions, createJobOption, deleteJobOption } from "../../actions";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OPTION_CATEGORIES = [
    { id: "working_hours", label: "勤務時間" },
    { id: "holidays", label: "休日・休暇" },
    { id: "selection_process", label: "選考プロセス" },
    { id: "benefits", label: "福利厚生" },
    { id: "requirements", label: "応募資格" }
];

export default function OptionsMasterPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [options, setOptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("working_hours");

    const [newLabel, setNewLabel] = useState("");
    const [newValue, setNewValue] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const fetchOptions = async () => {
        setIsLoading(true);
        try {
            const data = await getJobOptions();
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
    }, []);

    const handleCreate = async () => {
        if (!newLabel.trim() || !newValue.trim()) return;
        setIsCreating(true);
        try {
            const res = await createJobOption(activeTab, newLabel, newValue);
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

    const filteredOptions = options.filter(o => o.category === activeTab);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">選択肢テンプレート管理</h1>
                <Link href="/admin/masters">
                    <Button variant="outline">戻る</Button>
                </Link>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 flex overflow-x-auto h-auto p-1 bg-slate-100 rounded-lg">
                    {OPTION_CATEGORIES.map(cat => (
                        <TabsTrigger key={cat.id} value={cat.id} className="px-4 py-2 text-sm">
                            {cat.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {OPTION_CATEGORIES.map(cat => (
                    <TabsContent key={cat.id} value={cat.id}>
                        {/* Create Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                            <h2 className="font-bold text-slate-900 mb-4">{cat.label}の新規テンプレート登録</h2>
                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">表示名（プルダウンに表示）</label>
                                    <input
                                        type="text"
                                        placeholder="例：基本パターンA"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">挿入テキスト（選んだら入力される内容）</label>
                                    <textarea
                                        rows={3}
                                        placeholder="例：9:00〜18:00（休憩60分）"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button onClick={handleCreate} disabled={isCreating || !newLabel.trim() || !newValue.trim()} className="bg-primary-600 hover:bg-primary-700 text-white">
                                        {isCreating ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4 mr-2" />}
                                        登録
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                            {isLoading ? (
                                <div className="p-12 text-center">
                                    <Loader2 className="animate-spin w-8 h-8 mx-auto text-slate-300" />
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                                        <tr>
                                            <th className="p-4 w-1/4">表示名</th>
                                            <th className="p-4">挿入テキスト</th>
                                            <th className="p-4 w-24 text-center">操作</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredOptions.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="p-8 text-center text-slate-500">
                                                    登録されたテンプレートはありません
                                                </td>
                                            </tr>
                                        ) : filteredOptions.map((opt) => (
                                            <tr key={opt.id} className="hover:bg-slate-50">
                                                <td className="p-4 font-bold text-slate-800 align-top">{opt.label}</td>
                                                <td className="p-4 text-sm text-slate-600 whitespace-pre-wrap">{opt.value}</td>
                                                <td className="p-4 text-center align-top">
                                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(opt.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
