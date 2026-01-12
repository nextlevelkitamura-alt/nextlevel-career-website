"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUserApplications() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("applications")
        .select(`
            *,
            jobs (
                id,
                title,
                type,
                area,
                salary,
                category
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching applications:", error);
        return [];
    }
    return data;
}

export async function getUserProfile() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
    return data;
}

export async function updateUserProfile(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const last_name = formData.get("last_name") as string;
    const first_name = formData.get("first_name") as string;
    const last_name_kana = formData.get("last_name_kana") as string;
    const first_name_kana = formData.get("first_name_kana") as string;
    const birth_date = formData.get("birth_date") as string;
    const prefecture = formData.get("prefecture") as string;
    const phone_number = formData.get("phone_number") as string;
    // const employment_period = formData.get("employment_period") as string;

    const { data, error } = await supabase
        .from("profiles")
        .update({
            last_name,
            first_name,
            last_name_kana,
            first_name_kana,
            birth_date: birth_date || null,
            prefecture,
            phone_number,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select();

    if (error) return { error: error.message };
    if (!data || data.length === 0) return { error: "更新対象が見つかりませんでした。権限がない可能性があります。" };

    revalidatePath("/mypage");
    revalidatePath("/mypage/profile");
    return { success: true };
}
