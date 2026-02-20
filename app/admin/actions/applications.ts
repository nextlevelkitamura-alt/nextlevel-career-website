"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "./auth";

// Get all applications for admin
export async function getAdminApplications() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    // Separate queries to avoid relation issues between applications and profiles
    const { data: applications, error } = await supabase
        .from("applications")
        .select(`
            *,
            jobs (
                title,
                id
            )
        `)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    // Fetch profiles for these applications
    const userIds = Array.from(new Set(applications.map(app => app.user_id)));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let profiles: any[] = [];

    if (userIds.length > 0) {
        const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, last_name, first_name, last_name_kana, first_name_kana, birth_date, prefecture, phone_number")
            .in("id", userIds);
        profiles = profilesData || [];
    }

    // Merge data
    const data = applications.map(app => ({
        ...app,
        profiles: profiles.find(p => p.id === app.user_id) || null
    }));

    return data;
}

// Update application status
export async function updateApplicationStatus(id: string, newStatus: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/applications");
    return { success: true };
}

// Update application memo
export async function updateApplicationMemo(id: string, memo: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("applications")
        .update({ admin_memo: memo })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/applications");
    return { success: true };
}
