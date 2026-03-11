"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "./auth";

export interface HighlightCard {
    id: string;
    title: string;
    description: string | null;
    image_url: string;
    link_url: string | null;
    category: string;
    badge_text: string | null;
    display_order: number;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
}

// 管理画面用: 全カード取得
export async function getHighlightCards(): Promise<HighlightCard[]> {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("highlight_cards")
        .select("*")
        .order("display_order", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
}

// トップページ用: 有効かつ期限内のカードのみ
export async function getActiveHighlightCards(): Promise<
    Pick<HighlightCard, "id" | "title" | "description" | "image_url" | "link_url" | "category" | "badge_text">[]
> {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from("highlight_cards")
        .select("id, title, description, image_url, link_url, category, badge_text")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
}

// 画像アップロード
export async function uploadHighlightCardImage(formData: FormData) {
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
        .from("highlight-cards")
        .upload(fileName, file);

    if (uploadError) {
        return { error: `アップロードに失敗しました: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage
        .from("highlight-cards")
        .getPublicUrl(fileName);

    return { success: true, url: publicUrl };
}

// カード作成
export async function createHighlightCard(data: {
    title: string;
    description?: string;
    image_url: string;
    link_url?: string;
    category?: string;
    badge_text?: string;
    display_order?: number;
    is_active?: boolean;
    starts_at?: string;
    ends_at?: string;
}) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase.from("highlight_cards").insert({
        title: data.title,
        description: data.description || null,
        image_url: data.image_url,
        link_url: data.link_url || null,
        category: data.category || "news",
        badge_text: data.badge_text || null,
        display_order: data.display_order ?? 0,
        is_active: data.is_active ?? true,
        starts_at: data.starts_at || null,
        ends_at: data.ends_at || null,
    });

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/highlight-cards");
    return { success: true };
}

// カード更新
export async function updateHighlightCard(id: string, data: {
    title?: string;
    description?: string | null;
    image_url?: string;
    link_url?: string | null;
    category?: string;
    badge_text?: string | null;
    display_order?: number;
    is_active?: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
}) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();
    const { error } = await supabase
        .from("highlight_cards")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/highlight-cards");
    return { success: true };
}

// カード削除（Storage画像も削除）
export async function deleteHighlightCard(id: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    const { data: card, error: fetchError } = await supabase
        .from("highlight_cards")
        .select("image_url")
        .eq("id", id)
        .single();

    if (fetchError || !card) {
        return { error: "カードが見つかりません。" };
    }

    // Storage から画像を削除
    const pathParts = card.image_url.split("highlight-cards/");
    const filePath = pathParts[pathParts.length - 1];
    if (filePath) {
        await supabase.storage.from("highlight-cards").remove([filePath]);
    }

    const { error } = await supabase
        .from("highlight_cards")
        .delete()
        .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/");
    revalidatePath("/admin/highlight-cards");
    return { success: true };
}

// 表示順の一括更新
export async function updateHighlightCardOrders(orders: { id: string; display_order: number }[]) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    for (const order of orders) {
        const { error } = await supabase
            .from("highlight_cards")
            .update({ display_order: order.display_order })
            .eq("id", order.id);

        if (error) return { error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/highlight-cards");
    return { success: true };
}
