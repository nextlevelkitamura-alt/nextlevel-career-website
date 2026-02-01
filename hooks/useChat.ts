"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage, deleteMessage } from "@/app/chat/actions";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type UseChatProps = {
    initialMessages: any[];
    targetUserId: string;
    currentUserId: string;
    isAdminView?: boolean;
};

export function useChat({
    initialMessages,
    targetUserId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentUserId,
    isAdminView = false
}: UseChatProps) {
    const [messages, setMessages] = useState(initialMessages);
    const [content, setContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    // UI Refs that might be needed by the consumer for resetting
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel(`chat:${targetUserId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `user_id=eq.${targetUserId}`,
                },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (payload: any) => {
                    const newMessage = payload.new;
                    setMessages((prev: any[]) => {
                        if (prev.find(m => m.id === newMessage.id)) return prev;
                        return [...prev, newMessage];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [targetUserId, supabase]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!content.trim() && !selectedImage) || isSending) return;

        setIsSending(true);

        const tempId = `temp-${Date.now()}`;
        const currentContent = content;
        const currentImagePreview = imagePreview; // Capture current state

        // Optimistic UI Update
        const optimisticMessage = {
            id: tempId,
            content: content,
            image_url: imagePreview, // Use preview as temporary image
            created_at: new Date().toISOString(),
            is_admin_message: isAdminView, // Assuming current view matches sending role
            pending: true // Flag for UI to show spinner
        };

        setMessages((prev: any[]) => [...prev, optimisticMessage]);

        // Clear input immediately for snappy feel
        setContent("");
        clearImage();

        const formData = new FormData();
        formData.append("content", currentContent);
        formData.append("targetUserId", targetUserId);
        formData.append("isAdminSending", isAdminView ? "true" : "false");
        if (selectedImage) {
            formData.append("image", selectedImage);
        }

        const res = await sendMessage(formData);

        if (res.error) {
            alert(res.error);
            // Revert optimistic update on error
            setMessages((prev: any[]) => prev.filter(m => m.id !== tempId));
            // Restore content if you want, but might be annoying if they typed new stuff. 
            // For now just error alert is enough, or we could restore to state.
            setContent(currentContent);
            // We can't easily restore file input programmatically security-wise, but we can restore preview state if we kept the file object.
        } else if (res.message) {
            // Success: Replace optimistic message with real message
            setMessages((prev: any[]) => prev.map(m => m.id === tempId ? res.message : m));
            router.refresh();
        }

        setIsSending(false);
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm("このメッセージを削除しますか？")) return;

        // Optimistic update
        setMessages(prev => prev.filter(m => m.id !== messageId));

        const res = await deleteMessage(messageId);
        if (res.error) {
            alert(res.error);
            router.refresh(); // Revert optimistic update on fail
        }
    };

    return {
        messages,
        content,
        setContent,
        isSending,
        selectedImage,
        imagePreview,
        fileInputRef,
        handleImageSelect,
        clearImage,
        handleSubmit,
        handleDeleteMessage
    };
}
