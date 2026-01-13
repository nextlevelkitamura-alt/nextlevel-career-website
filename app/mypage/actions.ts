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
    const gender = formData.get("gender") as string;
    const zip_code = formData.get("zip_code") as string;
    const address = formData.get("address") as string;
    const education = formData.get("education") as string;
    const work_history = formData.get("work_history") as string;
    const qualification = formData.get("qualification") as string;
    const motivation = formData.get("motivation") as string;
    const desired_conditions = formData.get("desired_conditions") as string;

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
            gender,
            zip_code,
            address,
            education,
            work_history,
            qualification,
            motivation,
            desired_conditions,
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

export async function uploadAvatar(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const file = formData.get("file") as File;
    if (!file) return { error: "No file uploaded" };

    if (file.size > 2 * 1024 * 1024) {
        return { error: "ファイルサイズは2MB以下にしてください" };
    }

    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
            upsert: true
        });

    if (uploadError) return { error: uploadError.message };

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

    // Update profile with avatar_url
    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (updateError) return { error: updateError.message };

    revalidatePath("/mypage");
    revalidatePath("/mypage/profile");
    return { success: true, publicUrl };
}
