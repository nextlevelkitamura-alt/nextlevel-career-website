"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "./auth";

// Get unread counts for admin navigation badges
export async function getAdminNotificationCounts() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { applications: 0, inquiries: 0, users: 0 };

    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { applications: 0, inquiries: 0, users: 0 };

    // Get IDs already read by this admin
    const { data: readItems } = await supabase
        .from("admin_notification_reads")
        .select("resource_id, resource_type")
        .eq("admin_id", user.id);

    const readIds = readItems?.map(item => item.resource_id) || [];
    const userReadIds = readItems?.filter(item => item.resource_type === "user").map(item => item.resource_id) || [];

    // Count pending applications not read by this admin
    let appQuery = supabase
        .from("applications")
        .select("*", { count: 'exact', head: true })
        .eq("status", "pending");

    if (readIds.length > 0) {
        appQuery = appQuery.not("id", "in", `(${readIds.join(",")})`);
    }
    const { count: appCount } = await appQuery;

    // Count unhandled inquiries not read by this admin
    let inquiryQuery = supabase
        .from("client_inquiries")
        .select("*", { count: 'exact', head: true })
        .eq("status", "未対応");

    if (readIds.length > 0) {
        inquiryQuery = inquiryQuery.not("id", "in", `(${readIds.join(",")})`);
    }
    const { count: inquiryCount } = await inquiryQuery;

    // Count new users not read by this admin (exclude admins themselves)
    let userQuery = supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .eq("is_admin", false);

    if (userReadIds.length > 0) {
        userQuery = userQuery.not("id", "in", `(${userReadIds.join(",")})`);
    }
    const { count: userCount } = await userQuery;

    return {
        applications: appCount || 0,
        inquiries: inquiryCount || 0,
        users: userCount || 0
    };
}

// Get unread new users for notification popup
export async function getUnreadNewUsers() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return [];

    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get user IDs already read by this admin
    const { data: readItems } = await supabase
        .from("admin_notification_reads")
        .select("resource_id")
        .eq("admin_id", user.id)
        .eq("resource_type", "user");

    const readIds = readItems?.map(item => item.resource_id) || [];

    // Get non-admin profiles not yet read
    let query = supabase
        .from("profiles")
        .select("id, last_name, first_name, email, created_at")
        .eq("is_admin", false)
        .order("created_at", { ascending: false });

    if (readIds.length > 0) {
        query = query.not("id", "in", `(${readIds.join(",")})`);
    }

    const { data: users, error } = await query;
    if (error) return [];
    return users || [];
}

// Mark all unread new users as read by the current admin
export async function markAllNewUsersAsRead() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "User not found" };

    const unreadUsers = await getUnreadNewUsers();
    if (unreadUsers.length === 0) return { success: true };

    const records = unreadUsers.map(u => ({
        admin_id: user.id,
        resource_type: "user" as const,
        resource_id: u.id,
        read_at: new Date().toISOString()
    }));

    const { error } = await supabase
        .from("admin_notification_reads")
        .upsert(records, { onConflict: "admin_id,resource_id" });

    if (error) return { error: error.message };

    revalidatePath("/admin/users");
    return { success: true };
}

// Mark a resource as read by the current admin
export async function markAsRead(resourceType: "application" | "inquiry" | "user", resourceId: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "User not found" };

    const { error } = await supabase
        .from("admin_notification_reads")
        .upsert({
            admin_id: user.id,
            resource_type: resourceType,
            resource_id: resourceId,
            read_at: new Date().toISOString()
        }, { onConflict: "admin_id,resource_id" });

    if (error) return { error: error.message };

    revalidatePath("/admin/applications");
    revalidatePath("/admin/corporate-inquiries");
    revalidatePath("/admin/users");
    return { success: true };
}
