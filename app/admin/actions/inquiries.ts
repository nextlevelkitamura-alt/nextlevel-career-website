"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "./auth";

// Get Client Inquiries
export async function getClientInquiries() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("client_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

// Update Inquiry Status
export async function updateInquiryStatus(id: string, newStatus: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("client_inquiries")
        .update({ status: newStatus })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/corporate-inquiries");
    return { success: true };
}

// Delete Inquiry
export async function deleteInquiry(id: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("client_inquiries")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/corporate-inquiries");
    return { success: true };
}
