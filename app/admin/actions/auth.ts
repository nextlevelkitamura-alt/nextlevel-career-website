"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";

// Check if current user is admin
export async function checkAdmin() {
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return false;
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    return profile?.is_admin === true;
}
