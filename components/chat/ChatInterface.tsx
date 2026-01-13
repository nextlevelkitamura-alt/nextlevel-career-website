"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage } from "@/app/chat/actions";
import { Button } from "@/components/ui/button";
import { Send, Image as ImageIcon, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ChatInterface({
    initialMessages,
    targetUserId,
    currentUserId,
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

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

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

    return (
        <div className="flex flex-col h-[600px] border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
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
                        const isMe = msg.sender_id === currentUserId;

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${isMe
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                    }`}>
                                    {!isMe && isAdminView && (
                                        <div className="text-xs text-slate-400 mb-1">User</div>
                                    )}
                                    {!isMe && !isAdminView && msg.is_admin_message && (
                                        <div className="text-xs text-primary-200 mb-1 font-bold">サポート (管理者)</div>
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
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
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
                        placeholder="メッセージを入力..."
                        className="flex-1 max-h-32 min-h-[44px] p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
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
