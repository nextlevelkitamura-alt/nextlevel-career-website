"use client";

import { useState, useEffect } from "react";
import { getClients, createClient, deleteClient, updateClient } from "../../actions";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import Link from "next/link";

export default function ClientsMasterPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [clients, setClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newClientName, setNewClientName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const data = await getClients();
            setClients(data || []);
        } catch (e) {
            console.error(e);
            alert("データの取得に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleCreate = async () => {
        if (!newClientName.trim()) return;
        setIsCreating(true);
        try {
            const res = await createClient(newClientName);
            if (res.error) {
                alert(res.error);
            } else {
                setNewClientName("");
                fetchClients();
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
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

    const startEdit = (client: { id: string, name: string }) => {
        setEditingId(client.id);
        setEditName(client.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
    };

    const saveEdit = async (id: string) => {
        if (!editName.trim()) return;
        try {
            const res = await updateClient(id, editName);
            if (res.error) {
                alert(res.error);
            } else {
                setClients(prev => prev.map(c => c.id === id ? { ...c, name: editName } : c));
                setEditingId(null);
            }
        } catch (e) {
            console.error(e);
            alert("更新に失敗しました");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">取引先管理</h1>
                <Link href="/admin/masters">
                    <Button variant="outline">戻る</Button>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <h2 className="font-bold text-slate-900 mb-4">新規登録</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="取引先名を入力..."
                        className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                    />
                    <Button onClick={handleCreate} disabled={isCreating || !newClientName.trim()} className="bg-primary-600 hover:bg-primary-700 text-white">
                        {isCreating ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4 mr-2" />}
                        登録
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="animate-spin w-8 h-8 mx-auto text-slate-300" />
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                            <tr>
                                <th className="p-4">取引先名</th>
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
                                <tr key={client.id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        {editingId === client.id ? (
                                            <input
                                                className="w-full border border-slate-300 rounded px-2 py-1"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                            />
                                        ) : (
                                            <span className="font-medium text-slate-900">{client.name}</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {editingId === client.id ? (
                                            <div className="flex justify-center gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => saveEdit(client.id)} className="text-green-600 hover:bg-green-50">
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={cancelEdit} className="text-slate-500 hover:bg-slate-100">
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => startEdit(client)} className="text-slate-500 hover:text-primary-600 hover:bg-primary-50">
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleDelete(client.id)} className="text-slate-500 hover:text-red-600 hover:bg-red-50">
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
        </div>
    );
}
