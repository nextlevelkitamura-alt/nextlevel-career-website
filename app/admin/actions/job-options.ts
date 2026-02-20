"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { checkAdmin } from "./auth";

// Get Job Options (used by MastersTagManager)
export async function getJobOptions(category?: string) {
    const supabase = createSupabaseClient();
    let query = supabase.from("job_options").select("*").order("created_at", { ascending: true });

    if (category) {
        query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
}

// Create Job Option (used by MastersTagManager)
export async function createJobOption(category: string, label: string, value: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("job_options")
        .insert({ category, label, value })
        .select()
        .single();

    if (error) return { error: error.message };
    return { success: true, option: data };
}

// Delete Job Option (used by MastersTagManager)
export async function deleteJobOption(id: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("job_options")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };
    return { success: true };
}
