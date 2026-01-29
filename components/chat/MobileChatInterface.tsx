/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Send, Image as ImageIcon, Loader2, X, Phone, Menu } from "lucide-react";
import Link from "next/link";

export default function MobileChatInterface({
    initialMessages,
    targetUserId,
    currentUserId,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialMessages: any[],
    targetUserId: string,
    currentUserId: string,
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
        handleSubmit
    } = useChat({
        initialMessages,
        targetUserId,
        currentUserId,
        isAdminView: false
    });

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, imagePreview]); // Also scroll when image preview appears

    return (
        <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col">
            {/* 1. Fixed Header */}
            <div className="flex items-center justify-between p-3 bg-white border-b border-slate-200 shadow-sm shrink-0 h-16">
                {/* Left: Logo (Home Link) */}
                <Link href="/" className="flex items-center">
                    <img
                        src="/logo.png"
                        alt="Next Level Career"
                        className="h-8 w-auto object-contain"
                        onError={(e) => {
                            // Fallback if logo fails
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerText = 'ホーム';
                        }}
                    />
                </Link>

                {/* Center: Title */}
                <h1 className="text-base font-bold text-slate-800">サポートチャット</h1>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Phone Button */}
                    <a href="tel:0120-000-000" className="flex flex-col items-center justify-center text-primary-600 hover:text-primary-700 bg-primary-50 p-1.5 px-3 rounded-lg overflow-hidden">
                        <Phone className="w-4 h-4" />
                        <span className="text-[10px] font-bold leading-none mt-0.5">電話</span>
                    </a>

                    {/* Hamburger Menu Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-full"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg p-4 flex flex-col gap-4 z-40 animate-in slide-in-from-top-5">
                    <Link href="/jobs" className="text-base font-bold text-slate-600 py-2 border-b border-slate-100" onClick={() => setIsMenuOpen(false)}>
                        求人を探す
                    </Link>
                    <Link href="/flow" className="text-base font-bold text-slate-600 py-2 border-b border-slate-100" onClick={() => setIsMenuOpen(false)}>
                        サービスの流れ
                    </Link>
                    <Link href="/mypage" className="text-base font-bold text-slate-600 py-2 border-b border-slate-100" onClick={() => setIsMenuOpen(false)}>
                        マイページトップ
                    </Link>
                    <Link href="/" className="text-base font-bold text-slate-600 py-2 border-b border-slate-100" onClick={() => setIsMenuOpen(false)}>
                        トップページへ戻る
                    </Link>
                </div>
            )}

            {/* 2. Scrollable Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 pb-20">
                {messages.length === 0 ? (
                    <div className="text-center text-slate-400 py-10 flex flex-col items-center">
                        <div className="bg-slate-100 p-4 rounded-full mb-3">
                            <Send className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm">メッセージを入力して<br />相談を始めましょう</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = !msg.is_admin_message; // User view always

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && (
                                    <div className="mr-2 flex-shrink-0 mt-auto">
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-white">
                                            <img src="/admin-icon.jpg" alt="Admin" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                )}
                                <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${isMe
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                    }`}>

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
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                                            {msg.content}
                                        </div>
                                    )}

                                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                                        {new Date(msg.created_at).toLocaleString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 3. Fixed Input Area */}
            <div className="shrink-0 bg-white p-3 border-t border-slate-200 pb-safe">
                {/* Image Preview */}
                {imagePreview && (
                    <div className="relative inline-block mb-2">
                        <img src={imagePreview} alt="Preview" className="h-16 rounded-lg border border-slate-200" />
                        <button
                            type="button"
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 bg-slate-500 text-white rounded-full p-0.5"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex gap-2 items-center">
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
                        className="text-slate-500"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="w-6 h-6" />
                    </Button>

                    <input
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="メッセージを入力"
                        className="flex-1 py-2 px-3 bg-slate-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                    // Prevent zoom on focus by ensuring font-size is 16px+ (text-base is usually 16px)
                    />

                    <Button
                        type="submit"
                        disabled={isSending || (!content.trim() && !selectedImage)}
                        className="bg-primary-600 rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0"
                    >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}
