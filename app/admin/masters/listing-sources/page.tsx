"use client";

import { useState, useEffect } from "react";
import { getListingSources, createListingSource, updateListingSource, deleteListingSource } from "@/app/admin/actions/listing-sources";
import type { ListingSource } from "@/app/admin/actions/listing-sources";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Edit2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import TagSelector from "@/components/admin/TagSelector";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function ListingSourcesPage() {
    const [sources, setSources] = useState<ListingSource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Edit dialog state
    const [editSource, setEditSource] = useState<ListingSource | null>(null);
    const [editName, setEditName] = useState("");
    const [editBenefits, setEditBenefits] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const fetchSources = async () => {
        setIsLoading(true);
        try {
            const data = await getListingSources();
            setSources(data);
        } catch (e) {
            console.error(e);
            alert("データの取得に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSources();
    }, []);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setIsCreating(true);
        try {
            const res = await createListingSource(newName.trim(), []);
            if ("error" in res && res.error) {
                alert(res.error);
            } else {
                setNewName("");
                fetchSources();
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`「${name}」を削除しますか？`)) return;
        try {
            const res = await deleteListingSource(id);
            if ("error" in res && res.error) {
                alert(res.error);
            } else {
                setSources(prev => prev.filter(s => s.id !== id));
            }
        } catch (e) {
            console.error(e);
            alert("削除に失敗しました");
        }
    };

    const openEdit = (source: ListingSource) => {
        setEditSource(source);
        setEditName(source.name);
        setEditBenefits(JSON.stringify(source.default_benefits || []));
    };

    const closeEdit = () => {
        setEditSource(null);
        setEditName("");
        setEditBenefits("");
    };

    const handleSave = async () => {
        if (!editSource || !editName.trim()) return;
        setIsSaving(true);
        try {
            let benefits: string[] = [];
            try {
                benefits = JSON.parse(editBenefits);
                if (!Array.isArray(benefits)) benefits = [];
            } catch {
                benefits = [];
            }

            const res = await updateListingSource(editSource.id, editName.trim(), benefits);
            if ("error" in res && res.error) {
                alert(res.error);
            } else {
                closeEdit();
                fetchSources();
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">掲載元（媒体）管理</h1>
                <Link href="/admin/masters">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        設定に戻る
                    </Button>
                </Link>
            </div>

            {/* 新規登録 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary-600" />
                    掲載元の新規登録
                </h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="媒体名を入力（例：Jobuddy）"
                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    />
                    <Button
                        onClick={handleCreate}
                        disabled={isCreating || !newName.trim()}
                        className="bg-primary-600 hover:bg-primary-700 text-white min-w-[100px]"
                    >
                        {isCreating ? <Loader2 className="animate-spin w-4 h-4" /> : "登録"}
                    </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    登録後、「編集」からデフォルト福利厚生を設定できます。
                </p>
            </div>

            {/* 一覧 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="animate-spin w-8 h-8 mx-auto text-slate-300" />
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                            <tr>
                                <th className="p-4 pl-6">媒体名</th>
                                <th className="p-4">デフォルト福利厚生</th>
                                <th className="p-4 w-32 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sources.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-slate-500">
                                        登録された掲載元はありません
                                    </td>
                                </tr>
                            ) : sources.map((source) => (
                                <tr key={source.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 pl-6 font-medium text-slate-900">
                                        {source.name}
                                    </td>
                                    <td className="p-4">
                                        {source.default_benefits.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {source.default_benefits.map((b, i) => (
                                                    <span key={i} className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-200">
                                                        {b}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-slate-400">未設定</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => openEdit(source)} className="text-slate-500 hover:text-primary-600 hover:bg-primary-50">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(source.id, source.name)} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* 編集ダイアログ */}
            <Dialog open={!!editSource} onOpenChange={(open) => !open && closeEdit()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>掲載元の編集</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">媒体名</label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">デフォルト福利厚生</label>
                            <p className="text-xs text-slate-500">この掲載元を選択したとき、自動で追加される福利厚生タグです。</p>
                            <TagSelector
                                category="benefits"
                                value={editBenefits}
                                onChange={setEditBenefits}
                                placeholder="福利厚生タグを選択..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={closeEdit}>キャンセル</Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !editName.trim()}
                                className="bg-primary-600 hover:bg-primary-700 text-white"
                            >
                                {isSaving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                保存
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
