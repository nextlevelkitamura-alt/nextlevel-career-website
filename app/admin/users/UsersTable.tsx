"use client";

import { useState } from "react";
import { updateUserRole } from "../actions";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, ShieldOff, CheckCircle2, User } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function UsersTable({ initialUsers, currentUserId }: { initialUsers: any[], currentUserId: string }) {
    const [users, setUsers] = useState(initialUsers);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleRoleUpdate = async (userId: string, makeAdmin: boolean) => {
        if (!confirm(makeAdmin
            ? "このユーザーに管理者権限を付与しますか？\n（管理画面へのアクセスが可能になります）"
            : "このユーザーの管理者権限を解除しますか？\n（管理画面にアクセスできなくなります）")) {
            return;
        }

        setUpdatingId(userId);
        const result = await updateUserRole(userId, makeAdmin);

        if (result.success) {
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, is_admin: makeAdmin } : u
            ));
            alert("権限を更新しました");
        } else {
            alert("エラー: " + result.error);
        }
        setUpdatingId(null);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-4 whitespace-nowrap">氏名 / メール</th>
                            <th className="p-4 whitespace-nowrap w-24">権限</th>
                            <th className="p-4 whitespace-nowrap w-40 text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => {
                            const isMe = user.id === currentUserId;
                            // Checking super admin by email in client side just for UI display (optional)
                            const isOwner = user.email === "nextlevel.kitamura@gmail.com";

                            return (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900 flex items-center gap-2">
                                            {user.last_name} {user.first_name}
                                            {isMe && <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">あなた</span>}
                                            {isOwner && <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">オーナー</span>}
                                        </div>
                                        <div className="text-slate-500 text-xs">{user.email}</div>
                                    </td>
                                    <td className="p-4">
                                        {user.is_admin ? (
                                            <div className="flex items-center text-green-600 font-bold">
                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                管理者
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-slate-400">
                                                <User className="w-4 h-4 mr-1" />
                                                一般
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        {/* Hide buttons for self or owner (double safety: UI + backend) */}
                                        {isMe || isOwner ? (
                                            <span className="text-xs text-slate-400">操作不可</span>
                                        ) : (
                                            updatingId === user.id ? (
                                                <Loader2 className="animate-spin w-5 h-5 text-slate-400 mx-auto" />
                                            ) : user.is_admin ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                    onClick={() => handleRoleUpdate(user.id, false)}
                                                >
                                                    <ShieldOff className="w-4 h-4 mr-1" />
                                                    解除
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="bg-slate-800 hover:bg-slate-900 text-white"
                                                    onClick={() => handleRoleUpdate(user.id, true)}
                                                >
                                                    <Shield className="w-4 h-4 mr-1" />
                                                    管理者にする
                                                </Button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
