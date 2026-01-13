"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function NotificationListener({ userId, isAdmin = false }: { userId?: string, isAdmin?: boolean }) {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (!userId) return;

        console.log("Setting up notification listener for:", userId, "Is Admin:", isAdmin);

        const channel = supabase
            .channel('global-chat-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    // Filter:
                    // If user: Notify if message is for me (user_id = me) AND sender is NOT me AND is_admin_message = true
                    // If admin: Notify if message is from user (sender_id != me) AND is_admin_message = false
                    // Note: Supabase realtime filters are limited. It's better to fetch message details or filter in callback.
                    // We can filter by `user_id` column if we are the chat owner.
                    // But for Admin, they want to hear about ALL messages.
                    // Let's filter in the callback for now for flexibility, or use basic filter if possible.
                    // Since "sender_id" and "user_id" are available columns:
                    // For USER: filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const newMessage = payload.new as any;

                    // console.log("New message received:", newMessage);

                    // Logic for User
                    if (!isAdmin) {
                        // Notify if message is sent TO me (I am user_id) AND it is from Admin (is_admin_message=true)
                        // Wait, user_id is the "owner" of the chat.
                        // If I am the user, user_id should be me.
                        if (newMessage.user_id === userId && newMessage.is_admin_message) {
                            toast("新着メッセージ", {
                                description: "運営からメッセージが届きました",
                                action: {
                                    label: "見る",
                                    onClick: () => router.push("/mypage/chat")
                                }
                            });
                        }
                    }
                    // Logic for Admin
                    else {
                        // Notify if message is NOT from me (I am sending admin messages? No, admin sends is_admin_message=true)
                        // Ideally checking sender_id != currentUserId, but we might not know currentUserId in this context easily if not passed.
                        // Simpler: If is_admin_message is FALSE, it's from a user.
                        if (newMessage.is_admin_message === false) {
                            // Fetch user name would be nice, but for now generic notification
                            toast("新着メッセージ", {
                                description: "ユーザーからメッセージが届きました",
                                action: {
                                    label: "確認",
                                    onClick: () => router.push(`/admin/chat/${newMessage.user_id}`)
                                }
                            });
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, isAdmin, router, supabase]);

    return null;
}
