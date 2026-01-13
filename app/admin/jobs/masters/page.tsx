"use client";

import { useState, useEffect } from "react";
import { getClients, createClient, deleteClient, updateClient, getAllUniqueTags } from "../../actions";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Edit2, Check, X, Building2, Tag, ChevronLeft } from "lucide-react";
import Link from "next/link";

type Tab = "clients" | "tags";

export default function MastersPage() {
    const [activeTab, setActiveTab] = useState<Tab>("clients");

    // Clients State
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [clients, setClients] = useState<any[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [newClientName, setNewClientName] = useState("");
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [editingClientId, setEditingClientId] = useState<string | null>(null);
    const [editClientName, setEditClientName] = useState("");

    // Tags State
    const [tags, setTags] = useState<string[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(true);

    // Fetch Clients
    const fetchClients = async () => {
        setIsLoadingClients(true);
        try {
            const data = await getClients();
            setClients(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingClients(false);
        }
    };

    // Fetch Tags
    const fetchTags = async () => {
        setIsLoadingTags(true);
        try {
            const data = await getAllUniqueTags();
            setTags(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingTags(false);
        }
    };

    useEffect(() => {
        fetchClients();
        fetchTags();
    }, []);

    // Client Handlers
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
        if (!confirm("本当に削除しますか？")) return;
        try {
            const res = await deleteClient(id);
            if (res.error) {
                alert(res.error);
            } else {
                setClients(prev => prev.filter(c => c.id !== id));
            }
        } catch (e) {
            console.error(e);
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
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">取引先・タグ管理</h1>
                <Link href="/admin/jobs">
                    <Button variant="outline">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        求人一覧に戻る
                    </Button>
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6">
                <button
                    onClick={() => setActiveTab("clients")}
                    className={`py-3 px-6 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 -mb-[2px] ${activeTab === "clients"
                            ? "text-primary-700 border-primary-600"
                            : "text-slate-500 border-transparent hover:text-slate-700"
                        }`}
                >
                    <Building2 className="w-4 h-4" />
                    取引先管理
                </button>
                <button
                    onClick={() => setActiveTab("tags")}
                    className={`py-3 px-6 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 -mb-[2px] ${activeTab === "tags"
                            ? "text-primary-700 border-primary-600"
                            : "text-slate-500 border-transparent hover:text-slate-700"
                        }`}
                >
                    <Tag className="w-4 h-4" />
                    タグ一覧
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                {activeTab === "clients" && (
                    <div className="space-y-6">
                        {/* Create Client */}
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="新しい取引先名を入力..."
                                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={newClientName}
                                onChange={(e) => setNewClientName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateClient()}
                            />
                            <Button onClick={handleCreateClient} disabled={isCreatingClient || !newClientName.trim()} className="bg-primary-600 hover:bg-primary-700 text-white">
                                {isCreatingClient ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4 mr-2" />}
                                登録
                            </Button>
                        </div>

                        {/* Client List */}
                        {isLoadingClients ? (
                            <div className="py-8 text-center">
                                <Loader2 className="animate-spin w-8 h-8 mx-auto text-slate-300" />
                            </div>
                        ) : clients.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">登録された取引先はありません</p>
                        ) : (
                            <ul className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                                {clients.map((client) => (
                                    <li key={client.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                                        {editingClientId === client.id ? (
                                            <input
                                                className="flex-1 border border-slate-300 rounded px-3 py-2 mr-2"
                                                value={editClientName}
                                                onChange={(e) => setEditClientName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEditClient(client.id)}
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="font-medium text-slate-800">{client.name}</span>
                                        )}
                                        <div className="flex gap-1">
                                            {editingClientId === client.id ? (
                                                <>
                                                    <Button size="sm" variant="ghost" onClick={() => saveEditClient(client.id)} className="text-green-600 hover:bg-green-50">
                                                        <Check className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={cancelEditClient} className="text-slate-500 hover:bg-slate-100">
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button size="sm" variant="ghost" onClick={() => startEditClient(client)} className="text-slate-500 hover:text-primary-600 hover:bg-primary-50">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteClient(client.id)} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {activeTab === "tags" && (
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500">
                            タグは求人登録・編集画面で追加できます。現在登録されているタグの一覧です。
                        </p>
                        {isLoadingTags ? (
                            <div className="py-8 text-center">
                                <Loader2 className="animate-spin w-8 h-8 mx-auto text-slate-300" />
                            </div>
                        ) : tags.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">登録されたタグはありません</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span key={tag} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                        <Tag className="w-3 h-3 mr-1.5 text-slate-400" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
