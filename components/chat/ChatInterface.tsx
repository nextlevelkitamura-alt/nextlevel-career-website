/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage, deleteMessage } from "@/app/chat/actions";
import { Button } from "@/components/ui/button";
import { Send, Image as ImageIcon, Loader2, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ChatInterface({
    initialMessages,
    targetUserId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentUserId, // Needed if we expand logic later
    isAdminView = false
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialMessages: any[],
    targetUserId: string,
    currentUserId: string,
    isAdminView?: boolean
}) {
    const [messages, setMessages] = useState(initialMessages);
    const [content, setContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // supabase client for realtime
    const supabase = createClient();

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
                    // Add to list if not already there
                    setMessages((prev: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
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

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

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

        const formData = new FormData();
        formData.append("content", content);
        formData.append("targetUserId", targetUserId);
        formData.append("isAdminSending", isAdminView ? "true" : "false");
        if (selectedImage) {
            formData.append("image", selectedImage);
        }

        const res = await sendMessage(formData);

        if (res.error) {
            alert(res.error);
        } else {
            setContent("");
            clearImage();
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (isAdminView) {
            // Admin on PC: Enter to send, Shift+Enter for newline
            // Check for IME composition to prevent sending when confirming text
            if (e.key === 'Enter' && !e.shiftKey) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((e.nativeEvent as any).isComposing) {
                    return;
                }
                e.preventDefault();
                // We need to bypass the form submission prevention if calling handleSubmit directly
                // Actually handleSubmit calculates e.preventDefault(), so we need to pass a fake event or just call logic?
                // handleSubmit expects React.FormEvent.
                handleSubmit(e as unknown as React.FormEvent);
            }
        }
        // User view: Default behavior (Enter = Newline)
    };

    return (
        <div className="flex flex-col flex-1 h-full md:h-[600px] border md:border border-slate-200 rounded-none md:rounded-xl bg-slate-50 overflow-hidden -mx-4 md:mx-0">
            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-400 py-10 flex flex-col items-center">
                        <div className="bg-slate-100 p-4 rounded-full mb-3">
                            <Send className="w-6 h-6 text-slate-300" />
                        </div>
                        <p>{isAdminView ? "まだメッセージはありません" : "管理者へのメッセージを送信できます"}</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = isAdminView ? msg.is_admin_message : !msg.is_admin_message;

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm group relative ${isMe
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                    }`}>

                                    {/* Delete Button for Admin */}
                                    {isAdminView && isMe && (
                                        <button
                                            onClick={() => handleDeleteMessage(msg.id)}
                                            className="absolute -top-2 -right-2 bg-slate-200 text-slate-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-300 hover:text-red-600 z-10"
                                            title="削除"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}

                                    {!isMe && isAdminView && (
                                        <div className="text-xs text-slate-400 mb-1">ユーザー</div>
                                    )}
                                    {!isMe && !isAdminView && msg.is_admin_message && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src="/admin-icon.jpg" alt="Admin" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">NEXT LEVEL CAREER 運営</span>
                                        </div>
                                    )}

                                    {msg.image_url && (
                                        <div className="mb-2 rounded-lg overflow-hidden bg-black/10">
                                            <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={msg.image_url}
                                                    alt="Attached"
                                                    className="max-w-full h-auto max-h-[200px] object-contain"
                                                />
                                            </a>
                                        </div>
                                    )}

                                    {msg.content && (
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {(() => {
                                                const urlRegex = /(https?:\/\/[^\s]+)/g;
                                                const parts = msg.content.split(urlRegex);
                                                return parts.map((part: string, i: number) => {
                                                    if (part.match(urlRegex)) {
                                                        return (
                                                            <a
                                                                key={i}
                                                                href={part}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`underline ${isMe ? 'text-white hover:text-gray-200' : 'text-primary-600 hover:text-primary-800'}`}
                                                            >
                                                                {part}
                                                            </a>
                                                        );
                                                    }
                                                    return part;
                                                });
                                            })()}
                                        </div>
                                    )}

                                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                                        {new Date(msg.created_at).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-slate-200">
                {/* Image Preview */}
                {imagePreview && (
                    <div className="relative inline-block mb-2">
                        <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-slate-200" />
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 bg-slate-500 text-white rounded-full p-0.5 hover:bg-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-slate-500 hover:text-primary-600"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="w-5 h-5" />
                    </Button>

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={isAdminView ? "メッセージを入力 (Enterで送信 / Shift+Enterで改行)" : "メッセージを入力..."}
                        className="flex-1 max-h-32 min-h-[44px] p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                        rows={1}
                        onKeyDown={handleKeyDown}
                    />

                    <Button
                        type="submit"
                        disabled={isSending || (!content.trim() && !selectedImage)}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                        size="icon"
                    >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
