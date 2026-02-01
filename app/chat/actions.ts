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
    const isAdminSending = formData.get("isAdminSending") === "true"; // Explicit flag from UI

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
    // Use the explicit isAdminSending flag from the UI
    // This ensures admin panel messages are always marked correctly, even if admin is viewing their own chat
    const isAdminMessage = isAdmin && isAdminSending;

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

    const { data: newMessage, error } = await supabase.from("chat_messages").insert({
        user_id: targetUserId, // The conversation belongs to this user
        sender_id: user.id,
        content: content,
        image_url: imageUrl,
        is_admin_message: isAdminMessage,
        is_read: false
    }).select().single();

    if (error) return { error: "送信エラー: " + error.message };

    revalidatePath("/mypage/chat");
    revalidatePath(`/admin/users/${targetUserId}`); // Assuming we put chat there
    return { success: true, message: newMessage };
}

export async function deleteMessage(messageId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "認証されていません" };

    const isAdmin = await isUserAdmin();

    // Only admin can delete individual messages for now (or potentially own messages if we wanted)
    // Request specifically asked for "Operating side can delete sent text"
    // We'll allow admins to delete any message.
    if (!isAdmin) {
        return { error: "権限がありません" };
    }

    const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("id", messageId);

    if (error) return { error: error.message };

    // Since we don't know the exact path context here (user or admin page), 
    // we might need to revalidate broadly or let the client handle it.
    // For now, revalidate likely paths
    revalidatePath("/admin/chat");
    revalidatePath("/mypage/chat"); // If user is viewing
    return { success: true };
}
