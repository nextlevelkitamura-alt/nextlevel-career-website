"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { checkAdmin } from "./auth";

// Get all clients
export async function getClients() {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data;
}

// Create new client
export async function createClient(name: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("clients")
        .insert({ name })
        .select()
        .single();

    if (error) return { error: error.message };
    return { success: true, client: data };
}

// Delete client
export async function deleteClient(id: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };
    return { success: true };
}

// Update client
export async function updateClient(id: string, name: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("clients")
        .update({ name })
        .eq("id", id);

    if (error) return { error: error.message };
    return { success: true };
}
