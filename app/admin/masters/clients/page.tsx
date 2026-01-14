"use client";

import { useState, useEffect } from "react";
import { getClients, createClient, deleteClient, updateClient } from "../../actions";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Edit2, Check, X, Building2, Tag } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MastersTagManager from "@/components/admin/MastersTagManager";

const OPTION_CATEGORIES = [
    { id: "requirements", label: "応募資格" },
    { id: "holidays", label: "休日・休暇" },
    { id: "benefits", label: "福利厚生" },
    { id: "selection_process", label: "選考プロセス" }
];

export default function PartnersAndTagsPage() {
    // Clients State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [clients, setClients] = useState<any[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [newClientName, setNewClientName] = useState("");
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [editingClientId, setEditingClientId] = useState<string | null>(null);
    const [editClientName, setEditClientName] = useState("");

    // Tags State
    const [activeTab, setActiveTab] = useState("clients");

    // Fetch Clients
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

    // Client Actions
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

    const startEditClient = (client: { id: string, name: string }) => {
        setEditingClientId(client.id);
        setEditClientName(client.name);
    };

    const cancelEditClient = () => {
        setEditingClientId(null);
        setEditClientName("");
    };

    const saveEditClient = async (id: string) => {
        if (!editClientName.trim()) return;
        try {
            const res = await updateClient(id, editClientName);
            if (res.error) {
                alert(res.error);
            } else {
                setClients(prev => prev.map(c => c.id === id ? { ...c, name: editClientName } : c));
                setEditingClientId(null);
            }
        } catch (e) {
            console.error(e);
            alert("更新に失敗しました");
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
                                        <th className="p-4 w-40 text-center">操作</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {clients.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="p-8 text-center text-slate-500">
                                                登録された取引先はありません
                                            </td>
                                        </tr>
                                    ) : clients.map((client) => (
                                        <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 pl-6">
                                                {editingClientId === client.id ? (
                                                    <input
                                                        className="w-full border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                        value={editClientName}
                                                        onChange={(e) => setEditClientName(e.target.value)}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className="font-medium text-slate-900">{client.name}</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {editingClientId === client.id ? (
                                                    <div className="flex justify-center gap-2">
                                                        <Button size="sm" variant="ghost" onClick={() => saveEditClient(client.id)} className="text-green-600 hover:bg-green-50">
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={cancelEditClient} className="text-slate-500 hover:bg-slate-100">
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center gap-2">
                                                        <Button size="sm" variant="ghost" onClick={() => startEditClient(client)} className="text-slate-500 hover:text-primary-600 hover:bg-primary-50">
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => handleDeleteClient(client.id)} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
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
        </div>
    );
}
