"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "./auth";

export interface Banner {
    id: string;
    title: string;
    image_url: string;
    link_url: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// 管理画面用: 全バナー取得
export async function getBanners(): Promise<Banner[]> {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
}

// トップページ用: 有効バナーのみ
export async function getActiveBanners(): Promise<Pick<Banner, "id" | "title" | "image_url" | "link_url">[]> {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("banners")
        .select("id, title, image_url, link_url")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
}

// バナー画像アップロード
export async function uploadBannerImage(formData: FormData) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
        return { error: "ファイルが選択されていません。" };
    }

    if (file.size > 5 * 1024 * 1024) {
        return { error: "ファイルサイズは5MB以下にしてください。" };
    }

    const supabase = createSupabaseClient();
    const extension = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

    const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(fileName, file);

    if (uploadError) {
        return { error: `アップロードに失敗しました: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage
        .from("banners")
        .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
}

// バナー作成
export async function createBanner(data: {
    title: string;
    image_url: string;
    link_url?: string;
    display_order?: number;
    is_active?: boolean;
}) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase.from("banners").insert({
        title: data.title,
        image_url: data.image_url,
        link_url: data.link_url || null,
        display_order: data.display_order ?? 0,
        is_active: data.is_active ?? true,
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true };
}

// バナー更新
export async function updateBanner(id: string, data: {
    title?: string;
    image_url?: string;
    link_url?: string | null;
    display_order?: number;
    is_active?: boolean;
}) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("banners")
        .update(data)
        .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true };
}

// バナー削除（Storage画像も削除）
export async function deleteBanner(id: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    const { data: banner, error: fetchError } = await supabase
        .from("banners")
        .select("image_url")
        .eq("id", id)
        .single();

    if (fetchError || !banner) {
        return { error: "バナーが見つかりません。" };
    }

    // Storage から画像を削除
    const pathParts = banner.image_url.split("banners/");
    const filePath = pathParts[pathParts.length - 1];
    if (filePath) {
        await supabase.storage.from("banners").remove([filePath]);
    }

    const { error } = await supabase
        .from("banners")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true };
}

// 表示順の一括更新
export async function updateBannerOrders(orders: { id: string; display_order: number }[]) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    for (const order of orders) {
        const { error } = await supabase
            .from("banners")
            .update({ display_order: order.display_order })
            .eq("id", order.id);

        if (error) return { error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/banners");
    return { success: true };
}
