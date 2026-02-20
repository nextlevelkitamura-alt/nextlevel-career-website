"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "./auth";

// Get unread counts for admin navigation badges
export async function getAdminNotificationCounts() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { applications: 0, inquiries: 0 };

    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { applications: 0, inquiries: 0 };

    // Get IDs already read by this admin
    const { data: readItems } = await supabase
        .from("admin_notification_reads")
        .select("resource_id")
        .eq("admin_id", user.id);

    const readIds = readItems?.map(item => item.resource_id) || [];

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

    return {
        applications: appCount || 0,
        inquiries: inquiryCount || 0
    };
}

// Mark a resource as read by the current admin
export async function markAsRead(resourceType: "application" | "inquiry", resourceId: string) {
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
    return { success: true };
}
