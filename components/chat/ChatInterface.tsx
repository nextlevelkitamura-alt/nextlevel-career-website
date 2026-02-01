/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Send, Image as ImageIcon, Loader2, X, Trash2 } from "lucide-react";

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
    const {
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
    } = useChat({
        initialMessages,
        targetUserId,
        currentUserId,
        isAdminView
    });

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, imagePreview]);

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
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    messages.map((msg: any) => {
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

                                    <div className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                                        {msg.pending && <Loader2 className="w-3 h-3 animate-spin" />}
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
