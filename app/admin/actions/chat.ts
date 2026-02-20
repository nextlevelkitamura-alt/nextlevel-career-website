"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "./auth";

// Get Chat Inbox (Users contacted)
export async function getChatInbox() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    // Use Service Role client to bypass RLS if key is available, otherwise fall back to standard client (which will fail if RLS is strict)
    // Note: In strict RLS setup, standard client only sees own messages.
    // We assume SUPABASE_SERVICE_ROLE_KEY is set in env for this to work fully.
    let supabase;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceRoleKey) {
        const { createClient } = await import("@supabase/supabase-js");
        supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
        );
    } else {
        supabase = createSupabaseClient();
    }

    try {
        // Fetch unique user_ids from chat_messages
        const { data: messages, error } = await supabase
            .from("chat_messages")
            .select("user_id, created_at, content, is_read, sender_id, is_admin_message")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Chat messages fetch error:", error.message);
            // If service role missing and RLS blocks, we might get error or empty
            return [];
        }

        if (!messages || messages.length === 0) return [];

        // Group by user_id
        const chatsMap = new Map();
        const userIds = new Set();

        messages.forEach(msg => {
            if (!chatsMap.has(msg.user_id)) {
                chatsMap.set(msg.user_id, msg);
                userIds.add(msg.user_id);
            }
        });

        if (userIds.size === 0) return [];

        // Get User Profiles (Need to use same client or ensure public read access)
        // Profiles are usually public read, so standard client is fine, but service role is safer if policies change.
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url")
            .in("id", Array.from(userIds));

        if (!profiles) return [];

        // Combine
        const inbox = profiles.map(profile => {
            const lastMsg = chatsMap.get(profile.id);

            // Determine status
            let status = "read";
            if (lastMsg.is_admin_message) {
                status = "replied"; // Last message was from admin
            } else if (!lastMsg.is_read) {
                status = "action_required"; // Last message from user AND not read
            }

            return {
                user: profile,
                lastMessage: lastMsg,
                status // "action_required", "replied", "read"
            };
        }).sort((a, b) => {
            // Sort: Action Required first, then by date
            if (a.status === 'action_required' && b.status !== 'action_required') return -1;
            if (a.status !== 'action_required' && b.status === 'action_required') return 1;
            return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
        });

        return inbox;
    } catch (err) {
        console.error("getChatInbox error:", err);
        return [];
    }
}

// Delete all chat messages for a specific user (Admin only)
export async function deleteChatConversation(userId: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) throw new Error("Unauthorized");

    const supabase = createSupabaseClient();

    const { error } = await supabase
        .from("chat_messages")
        .delete()
        .eq("user_id", userId);

    if (error) return { error: error.message };

    revalidatePath("/admin/chat");
    return { success: true };
}
