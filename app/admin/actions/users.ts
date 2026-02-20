"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "./auth";

const SUPER_ADMIN_EMAIL = "nextlevel.kitamura@gmail.com";

// Get all users for administration
export async function getAdminUsers() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    // Fetch profiles. Assuming 'email' column exists based on auth actions.
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return profiles;
}

// Update user role (isAdmin status)
export async function updateUserRole(targetUserId: string, makeAdmin: boolean) {
    // 1. Security Check: Operator must be an admin
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    if (!currentUser) throw new Error("Unauthorized");

    // 2. Safety Lock: Prevent self-demotion
    if (currentUser.id === targetUserId && !makeAdmin) {
        return { error: "自分自身の管理者権限は解除できません（安全装置）" };
    }

    // 3. Super Admin Protection: Prevent editing the Owner
    // Fetch target user's profile to check email
    const { data: targetProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", targetUserId)
        .single();

    if (targetProfile && targetProfile.email === SUPER_ADMIN_EMAIL) {
        return { error: "オーナー（Super Admin）の権限は変更できません" };
    }

    const { error } = await supabase
        .from("profiles")
        .update({ is_admin: makeAdmin })
        .eq("id", targetUserId);

    if (error) return { error: error.message };

    revalidatePath("/admin/users");
    return { success: true };
}

// Delete user (Owner Only)
// Requires SUPABASE_SERVICE_ROLE_KEY in .env
export async function deleteUser(targetUserId: string) {
    const supabase = createSupabaseClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // 1. Verify Admin (Any admin can delete users, but restricted targets)
    const isAdmin = await checkAdmin();
    if (!isAdmin || !currentUser) {
        throw new Error("Unauthorized: Only Admins can delete users.");
    }

    // 2. Prevent self-deletion and Owner deletion
    if (currentUser.id === targetUserId) {
        return { error: "自分自身を削除することはできません。" };
    }

    // Check if target is the Super Admin
    // We need to fetch the target user's email to verify if they are the owner
    // Since we are using admin client later, we can check it then, or assume the ID check is enough if we knew the ID.
    // But email is safer.
    // However, for efficiency, let's proceed to create admin client and then check target user details if needed,
    // OR just rely on the UI hiding it and this being a "good enough" check for now?
    // Better to be safe. We can check if targetUserId matches the owner's ID if we knew it, but we don't.
    // So let's just proceed. If the target IS the owner, we should block it.
    // But `deleteUser` implementation below uses `adminClient.auth.admin.deleteUser`.
    // We should probably check the target user's email before deleting.

    // Let's check target user email via Admin Client
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return { error: "サーバー設定エラー: Service Role Keyが見つかりません。" };
    }

    const adminClient = createSupabaseAdmin(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    const { data: { user: targetUser }, error: fetchError } = await adminClient.auth.admin.getUserById(targetUserId);
    if (fetchError || !targetUser) {
        return { error: "ユーザーが見つかりません。" };
    }

    if (targetUser.email === SUPER_ADMIN_EMAIL) {
        return { error: "オーナー（Super Admin）を削除することはできません。" };
    }

    // Proceed to delete
    // 4. Delete from Auth (This should cascade to profiles usually, but we check)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
        console.error("Delete user error:", deleteError);
        return { error: "削除に失敗しました: " + deleteError.message };
    }

    revalidatePath("/admin/users");
    return { success: true };
}
