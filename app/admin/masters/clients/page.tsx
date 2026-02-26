"use client";

import { useState, useEffect } from "react";
import { getClients, createClient, deleteClient, updateClient } from "../../actions";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Edit2, Building2, Tag } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MastersTagManager from "@/components/admin/MastersTagManager";
import TagSelector from "@/components/admin/TagSelector";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const OPTION_CATEGORIES = [
    { id: "requirements", label: "応募資格" },
    { id: "holidays", label: "休日・休暇" },
    { id: "benefits", label: "福利厚生" },
    { id: "selection_process", label: "選考プロセス" }
];

interface Client {
    id: string;
    name: string;
    default_benefits?: string[];
}

export default function PartnersAndTagsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [newClientName, setNewClientName] = useState("");
    const [isCreatingClient, setIsCreatingClient] = useState(false);

    // Edit Dialog State
    const [editClient, setEditClient] = useState<Client | null>(null);
    const [editName, setEditName] = useState("");
    const [editBenefits, setEditBenefits] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Tags State
    const [activeTab, setActiveTab] = useState("clients");

    const fetchClients = async () => {
        setIsLoadingClients(true);
        try {
            const data = await getClients();
            setClients(data || []);
        } catch (e) {
            console.error(e);
            alert("データの取得に失敗しました");
        } finally {
            setIsLoadingClients(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleCreateClient = async () => {
        if (!newClientName.trim()) return;
        setIsCreatingClient(true);
        try {
            const res = await createClient(newClientName);
            if (res.error) {
                alert(res.error);
            } else {
                setNewClientName("");
                fetchClients();
            }
        } finally {
            setIsCreatingClient(false);
        }
    };

    const handleDeleteClient = async (id: string) => {
        if (!confirm("本当に削除しますか？\n（この取引先を使用している求人がある場合、表示に影響が出る可能性があります）")) return;
        try {
            const res = await deleteClient(id);
            if (res.error) {
                alert(res.error);
            } else {
                setClients(prev => prev.filter(c => c.id !== id));
            }
        } catch (e) {
            console.error(e);
            alert("削除に失敗しました");
        }
    };

    const openEdit = (client: Client) => {
        setEditClient(client);
        setEditName(client.name);
        setEditBenefits(JSON.stringify(client.default_benefits || []));
    };

    const closeEdit = () => {
        setEditClient(null);
        setEditName("");
        setEditBenefits("");
    };

    const handleSave = async () => {
        if (!editClient || !editName.trim()) return;
        setIsSaving(true);
        try {
            let benefits: string[] = [];
            try {
                benefits = JSON.parse(editBenefits);
                if (!Array.isArray(benefits)) benefits = [];
            } catch {
                benefits = [];
            }

            const res = await updateClient(editClient.id, editName.trim(), benefits);
            if (res.error) {
                alert(res.error);
            } else {
                closeEdit();
                fetchClients();
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">求人マスタ管理</h1>
                <Link href="/admin/jobs">
                    <Button variant="outline">求人一覧に戻る</Button>
                </Link>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-8 bg-white border border-slate-200 p-1 rounded-xl w-full flex-wrap h-auto gap-1">
                    <TabsTrigger value="clients" className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700 data-[state=active]:font-bold rounded-lg transition-all text-sm">
                        <Building2 className="w-4 h-4" />
                        取引先
                    </TabsTrigger>
                    {OPTION_CATEGORIES.map(cat => (
                        <TabsTrigger
                            key={cat.id}
                            value={cat.id}
                            className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700 data-[state=active]:font-bold rounded-lg transition-all text-sm"
                        >
                            <Tag className="w-4 h-4" />
                            {cat.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Clients Management Tab */}
                <TabsContent value="clients" className="mt-0 space-y-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary-600" />
                            取引先の新規登録
                        </h2>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="取引先名を入力..."
                                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={newClientName}
                                onChange={(e) => setNewClientName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreateClient()}
                            />
                            <Button onClick={handleCreateClient} disabled={isCreatingClient || !newClientName.trim()} className="bg-primary-600 hover:bg-primary-700 text-white min-w-[100px]">
                                {isCreatingClient ? <Loader2 className="animate-spin w-4 h-4" /> : "登録"}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                        {isLoadingClients ? (
                            <div className="p-12 text-center">
                                <Loader2 className="animate-spin w-8 h-8 mx-auto text-slate-300" />
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                                    <tr>
                                        <th className="p-4 pl-6">取引先名</th>
                                        <th className="p-4">デフォルト福利厚生</th>
                                        <th className="p-4 w-32 text-center">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {clients.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-slate-500">
                                                登録された取引先はありません
                                            </td>
                                        </tr>
                                    ) : clients.map((client) => (
                                        <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 pl-6">
                                                <span className="font-medium text-slate-900">{client.name}</span>
                                            </td>
                                            <td className="p-4">
                                                {client.default_benefits && client.default_benefits.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {client.default_benefits.map((b, i) => (
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
                                                    <Button size="sm" variant="ghost" onClick={() => openEdit(client)} className="text-slate-500 hover:text-primary-600 hover:bg-primary-50">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteClient(client.id)} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
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
                </TabsContent>

                {/* Tag Category Tabs - One for each category */}
                {OPTION_CATEGORIES.map(cat => (
                    <TabsContent key={cat.id} value={cat.id} className="mt-0">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                            <MastersTagManager category={cat.id} label={cat.label} />
                        </div>
                    </TabsContent>
                ))}
            </Tabs>

            {/* 取引先編集ダイアログ */}
            <Dialog open={!!editClient} onOpenChange={(open) => !open && closeEdit()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>取引先の編集</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">取引先名</label>
                            <input
                                type="text"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">デフォルト福利厚生</label>
                            <p className="text-xs text-slate-500">この取引先を掲載元として選択したとき、自動で追加される福利厚生タグです。</p>
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
