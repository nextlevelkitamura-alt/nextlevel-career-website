"use client";

import { useState } from "react";
import { updateUserRole, deleteUser } from "../actions";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, ShieldOff, CheckCircle2, User, Search, Trash2, Filter, UserSearch, MapPin } from "lucide-react";
import UserDetailModal from "./UserDetailModal";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function UsersTable({ initialUsers, currentUserId }: { initialUsers: any[], currentUserId: string }) {
    const [users, setUsers] = useState(initialUsers);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [ageFilter, setAgeFilter] = useState("");
    const [prefectureFilter, setPrefectureFilter] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

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

    const handleDelete = async (userId: string) => {
        if (!confirm("【警告】\n本当にこのユーザーを削除しますか？\nこの操作は取り消せません。")) {
            return;
        }

        setDeletingId(userId);
        const result = await deleteUser(userId);

        if (result.success) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            alert("ユーザーを削除しました");
        } else {
            alert("エラー: " + result.error);
        }
        setDeletingId(null);
    };

    const filteredUsers = users.filter(user => {
        // Search Filter
        const searchText = searchQuery.toLowerCase();
        const fullName = `${user.last_name || ""} ${user.first_name || ""}`.toLowerCase();
        const email = (user.email || "").toLowerCase();
        const matchesSearch = fullName.includes(searchText) || email.includes(searchText);

        // Age Filter
        let matchesAge = true;
        if (ageFilter) {
            const age = user.birth_date ? Math.floor((new Date().getTime() - new Date(user.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
            if (!age) {
                matchesAge = false;
            } else {
                const decade = Math.floor(age / 10) * 10;
                if (ageFilter === "60+") {
                    matchesAge = age >= 60;
                } else {
                    matchesAge = decade === parseInt(ageFilter);
                }
            }
        }

        // Prefecture Filter
        const matchesPrefecture = !prefectureFilter || user.prefecture === prefectureFilter;

        return matchesSearch && matchesAge && matchesPrefecture;
    });

    // Check if current user is the owner (Super Admin)
    // In a real app we might pass this as a prop, but for now checking email on client is acceptable for UI hiding.
    // The backend `deleteUser` action does the real security check.
    // const currentUserEmail = users.find(u => u.id === currentUserId)?.email;
    // Checking super admin by email in client side just for UI display (optional)
    // const isCurrentOwner = currentUserEmail === "nextlevel.kitamura@gmail.com";

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Search and Filters */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="氏名またはメールアドレスで検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={ageFilter}
                                onChange={(e) => setAgeFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white min-w-[120px]"
                            >
                                <option value="">年代すべて</option>
                                <option value="10">10代</option>
                                <option value="20">20代</option>
                                <option value="30">30代</option>
                                <option value="40">40代</option>
                                <option value="50">50代</option>
                                <option value="60+">60代以上</option>
                            </select>
                        </div>

                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={prefectureFilter}
                                onChange={(e) => setPrefectureFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white min-w-[140px]"
                            >
                                <option value="">都道府県すべて</option>
                                {["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
                                    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
                                    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
                                    "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
                                    "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
                                    "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
                                    "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"].map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-4 whitespace-nowrap">氏名 / メール</th>
                            <th className="p-4 whitespace-nowrap w-24">年齢</th>
                            <th className="p-4 whitespace-nowrap w-24">住所</th>
                            <th className="p-4 whitespace-nowrap w-24">権限</th>
                            <th className="p-4 whitespace-nowrap w-40 text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    該当するユーザーが見つかりません
                                </td>
                            </tr>
                        ) : filteredUsers.map((user) => {
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
                                        <div className="text-slate-900">
                                            {user.birth_date ? `${Math.floor((new Date().getTime() - new Date(user.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}歳` : "-"}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-slate-700 truncate max-w-[100px]" title={user.prefecture}>
                                            {user.prefecture || "-"}
                                        </div>
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
                                        {/* Allow deletion for any admin, but prevent deleting SELF or OWNER */}
                                        {isMe || isOwner ? (
                                            <span className="text-xs text-slate-400">操作不可</span>
                                        ) : (
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 font-bold"
                                                    onClick={() => setSelectedUser(user)}
                                                >
                                                    <UserSearch className="w-4 h-4 mr-1" />
                                                    詳細
                                                </Button>

                                                {updatingId === user.id ? (
                                                    <Loader2 className="animate-spin w-5 h-5 text-slate-400" />
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
                                                        権限付与
                                                    </Button>
                                                )}

                                                {/* Delete Button (Allowed for all admins, targeting non-owner/non-self) */}
                                                {deletingId === user.id ? (
                                                    <Loader2 className="animate-spin w-5 h-5 text-red-400" />
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDelete(user.id)}
                                                        title="ユーザー削除"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    );
}
