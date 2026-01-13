"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Helper to check admin status (duplicated to avoid import issues for now)
async function isUserAdmin() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    return profile?.is_admin === true;
}

export async function getChatMessages(userId: string) {
    const supabase = createClient();

    // Security check: Only allow if it's the own user OR an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const isAdmin = await isUserAdmin();
    if (user.id !== userId && !isAdmin) {
        throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

    if (error) return []; // Return empty on error to avoid crashing UI for non-existent table
    return data;
}

export async function sendMessage(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "認証されていません" };

    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File;
    const targetUserId = formData.get("targetUserId") as string;

    if (!targetUserId) return { error: "送信先が指定されていません" };

    // Check permissions
    const isAdmin = await isUserAdmin();

    // Logic:
    // If I am the user, I can only send to my own chat (targetUserId must be me)
    // If I am admin, I can send to anyone.

    if (!isAdmin && user.id !== targetUserId) {
        return { error: "不正な操作です" };
    }

    // Determine if it's an admin message
    // If sender is admin AND target is NOT sender (admin sending to user) -> is_admin_message = true
    // If sender is user (target is self) -> is_admin_message = false
    // Edge case: Admin talking to themselves? Let's say false.
    const isAdminMessage = isAdmin && user.id !== targetUserId;

    let imageUrl = null;

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${targetUserId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('chat-images')
            .upload(fileName, imageFile);

        if (uploadError) return { error: "画像のアップロードに失敗しました: " + uploadError.message };

        const { data: urlData } = supabase.storage
            .from('chat-images')
            .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
    }

    if ((!content || !content.trim()) && !imageUrl) {
        return { error: "メッセージまたは画像を入力してください" };
    }

    const { error } = await supabase.from("chat_messages").insert({
        user_id: targetUserId, // The conversation belongs to this user
        sender_id: user.id,
        content: content,
        image_url: imageUrl,
        is_admin_message: isAdminMessage,
        is_read: false
    });

    if (error) return { error: "送信エラー: " + error.message };

    revalidatePath("/mypage/chat");
    revalidatePath(`/admin/users/${targetUserId}`); // Assuming we put chat there
    return { success: true };
}
