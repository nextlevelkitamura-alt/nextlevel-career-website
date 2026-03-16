"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient, hasBrowserSupabaseEnv } from "@/utils/supabase/client";
import { getUnreadNewUsers, markAllNewUsersAsRead } from "@/app/admin/actions/notifications";
import { X, UserPlus } from "lucide-react";

interface UnreadUser {
    id: string;
    last_name: string | null;
    first_name: string | null;
    email: string | null;
    created_at: string;
}

export default function NewUserNotificationPopup() {
    const [unreadUsers, setUnreadUsers] = useState<UnreadUser[]>([]);
    const [visible, setVisible] = useState(false);
    const [dismissedTemporarily, setDismissedTemporarily] = useState(false);
    const supabase = hasBrowserSupabaseEnv() ? createClient() : null;

    const fetchUnreadUsers = useCallback(async () => {
        const users = await getUnreadNewUsers();
        setUnreadUsers(users);
        if (users.length > 0 && !dismissedTemporarily) {
            setVisible(true);
        }
    }, [dismissedTemporarily]);

    useEffect(() => {
        fetchUnreadUsers();
    }, [fetchUnreadUsers]);

    // Supabase Realtime: 新規ユーザー登録を監視
    useEffect(() => {
        if (!supabase) return;

        const channel = supabase
            .channel("new-user-popup")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "profiles" },
                () => {
                    // 新規登録があったら再取得して表示
                    setDismissedTemporarily(false);
                    fetchUnreadUsers();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, fetchUnreadUsers]);

    const handleConfirm = async () => {
        await markAllNewUsersAsRead();
        setUnreadUsers([]);
        setVisible(false);
        setDismissedTemporarily(false);
    };

    const handleDismiss = () => {
        setVisible(false);
        setDismissedTemporarily(true);
    };

    if (!visible || unreadUsers.length === 0) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-slate-900">
                            新規ユーザー登録のお知らせ
                        </h3>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User count */}
                <div className="px-6 pb-3">
                    <p className="text-sm text-slate-500">
                        <span className="font-bold text-blue-600">{unreadUsers.length}名</span>の新規登録があります
                    </p>
                </div>

                {/* User list */}
                <div className="px-6 max-h-64 overflow-y-auto">
                    <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                        {unreadUsers.map((user) => (
                            <div key={user.id} className="px-4 py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">
                                        {user.last_name || ""} {user.first_name || ""}
                                        {!user.last_name && !user.first_name && (user.email || "名前未登録")}
                                    </p>
                                    {(user.last_name || user.first_name) && user.email && (
                                        <p className="text-xs text-slate-400">{user.email}</p>
                                    )}
                                </div>
                                <span className="text-xs text-slate-400 whitespace-nowrap ml-3">
                                    {new Date(user.created_at).toLocaleString("ja-JP", {
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Confirm button */}
                <div className="px-6 py-4">
                    <button
                        onClick={handleConfirm}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                        確認しました
                    </button>
                </div>
            </div>
        </div>
    );
}
