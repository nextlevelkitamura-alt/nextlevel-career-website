"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { checkAdmin } from "./auth";

export interface ListingSource {
    id: string;
    name: string;
    default_benefits: string[];
    created_at: string;
}

export async function getListingSources(): Promise<ListingSource[]> {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("listing_sources")
        .select("*")
        .order("name", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
}

export async function createListingSource(name: string, defaultBenefits: string[]) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("listing_sources")
        .insert({ name, default_benefits: defaultBenefits })
        .select()
        .single();

    if (error) return { error: error.message };
    return { success: true, listingSource: data };
}

export async function updateListingSource(id: string, name: string, defaultBenefits: string[]) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("listing_sources")
        .update({ name, default_benefits: defaultBenefits })
        .eq("id", id);

    if (error) return { error: error.message };
    return { success: true };
}

export async function deleteListingSource(id: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("listing_sources")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };
    return { success: true };
}
