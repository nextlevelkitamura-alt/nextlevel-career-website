"use client";

import { useState, useEffect } from "react";
import { getClients, createClient } from "@/app/admin/actions";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Client {
    id: string;
    name: string;
}

interface ClientSelectProps {
    name: string;
    defaultValue?: string | null;
}

export default function ClientSelect({ name, defaultValue }: ClientSelectProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedId, setSelectedId] = useState<string>(defaultValue || "");
    const [isCreating, setIsCreating] = useState(false);
    const [newClientName, setNewClientName] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await getClients();
            setClients(data || []);
        } catch (_error) {
            console.error("Failed to load clients", _error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newClientName.trim()) return;

        try {
            const result = await createClient(newClientName);
            if (result.success && result.client) {
                setClients([...clients, result.client]);
                setSelectedId(result.client.id);
                setIsCreating(false);
                setNewClientName("");
            } else if (result.error) {
                alert(result.error);
            }
        } catch {
            alert("取引先の作成に失敗しました");
        }
    };

    if (isLoading) return <div className="h-12 w-full bg-slate-100 rounded-lg animate-pulse" />;

    return (
        <div className="space-y-2">
            <input type="hidden" name={name} value={selectedId} />

            {!isCreating ? (
                <div className="flex gap-2">
                    <select
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        className="flex-1 h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                        <option value="">選択してください</option>
                        {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-12 px-4"
                        onClick={() => setIsCreating(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        新規追加
                    </Button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <Input
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        placeholder="新しい取引先名を入力"
                        className="flex-1 h-12 bg-slate-900 text-white border-slate-700 placeholder:text-slate-400"
                        autoFocus
                    />
                    <Button
                        type="button"
                        className="h-12 bg-primary-600 hover:bg-primary-700 text-white"
                        onClick={handleCreate}
                    >
                        <Check className="w-4 h-4 mr-2" />
                        保存
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="h-12"
                        onClick={() => setIsCreating(false)}
                    >
                        キャンセル
                    </Button>
                </div>
            )}
        </div>
    );
}
