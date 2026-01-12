import { getAdminUsers } from "../actions";
import UsersTable from "./UsersTable";
import { createClient } from "@/utils/supabase/server";

export default async function AdminUsersPage() {
    const users = await getAdminUsers();

    // Get current user ID for UI identification
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">ユーザー管理</h1>
                {/* Future: Invite button */}
            </div>

            <p className="text-sm text-slate-500 bg-white p-4 rounded-lg border border-slate-200">
                <span className="font-bold">管理者権限について:</span><br />
                管理者は「求人の追加・編集」「応募者のステータス変更」「ユーザーの権限変更」が可能です。<br />
                <span className="text-red-600 font-bold">※自分自身やオーナーの権限は変更できません。</span>
            </p>

            <UsersTable initialUsers={users || []} currentUserId={user?.id || ""} />
        </div>
    );
}
