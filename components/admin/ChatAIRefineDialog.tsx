"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, Send, X, Maximize2, Minimize2 } from "lucide-react";
import ChatMessageComponent, { ChatMessage } from "./ChatMessage";
import RefinementPreview from "./RefinementPreview";
import { ExtractedJobData, chatRefineJobWithAI } from "@/app/admin/actions";

interface ChatAIRefineDialogProps {
    currentData: ExtractedJobData;
    onRefined: (data: ExtractedJobData) => void;
    disabled?: boolean;
}

export default function ChatAIRefineDialog({
    currentData,
    onRefined,
    disabled
}: ChatAIRefineDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [pendingRefinement, setPendingRefinement] = useState<{
        originalFields: Record<string, unknown>;
        proposedFields: Record<string, unknown>;
        changedFields: string[];
    } | null>(null);
    const [isApplying, setIsApplying] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, pendingRefinement]);

    const handleSend = async () => {
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: trimmedInput,
            timestamp: new Date(),
            type: 'text'
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Call the server action
            const result = await chatRefineJobWithAI(currentData, trimmedInput, messages);

            if (result.error) {
                // Error case - add error message
                const errorMessage: ChatMessage = {
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: `エラーが発生しました：\n${result.error}\n\nもう一度試すか、別の表現でやり直してみてください。`,
                    timestamp: new Date(),
                    type: 'text'
                };
                setMessages(prev => [...prev, errorMessage]);
            } else if (result.data && result.changedFields) {
                // Success - show refinement preview
                const originalFields: Record<string, unknown> = {};
                const proposedFields: Record<string, unknown> = {};

                for (const field of result.changedFields) {
                    originalFields[field] = currentData[field as keyof ExtractedJobData];
                    proposedFields[field] = result.data![field as keyof ExtractedJobData];
                }

                setPendingRefinement({
                    originalFields,
                    proposedFields,
                    changedFields: result.changedFields
                });
            }

        } catch (error) {
            console.error("AI refinement error:", error);
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `エラーが発生しました：${error instanceof Error ? error.message : "Unknown error"}\n\nもう一度試すか、別の表現でやり直してみてください。`,
                timestamp: new Date(),
                type: 'text'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = async () => {
        if (!pendingRefinement) return;

        setIsApplying(true);

        try {
            // Apply the refinement
            const refinedData: ExtractedJobData = {
                ...currentData,
                ...pendingRefinement.proposedFields
            };

            onRefined(refinedData);

            // Add success message
            const successMessage: ChatMessage = {
                id: `success-${Date.now()}`,
                role: 'assistant',
                content: "✅ 修正を適用しました！",
                timestamp: new Date(),
                type: 'text'
            };

            setMessages(prev => [...prev, successMessage]);
            setPendingRefinement(null);

            // Close dialog after short delay
            setTimeout(() => {
                setIsOpen(false);
            }, 1500);

        } catch (error) {
            console.error("Apply error:", error);
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `適用中にエラーが発生しました：${error instanceof Error ? error.message : "Unknown error"}`,
                timestamp: new Date(),
                type: 'text'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsApplying(false);
        }
    };

    const handleRedo = () => {
        setPendingRefinement(null);

        // Add hint message
        const hintMessage: ChatMessage = {
            id: `hint-${Date.now()}`,
            role: 'assistant',
            content: "修正案を破棄しました。別の指示を入力してください。",
            timestamp: new Date(),
            type: 'text'
        };

        setMessages(prev => [...prev, hintMessage]);
    };

    const handleCancelPreview = () => {
        setPendingRefinement(null);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const resetChat = () => {
        setMessages([]);
        setInput("");
        setPendingRefinement(null);
    };

    if (!isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                disabled={disabled}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Wand2 className="w-4 h-4" />
                AIで修正・追加
            </button>
        );
    }

    return (
        <div className={`fixed ${isMaximized ? 'inset-4' : 'inset-auto'} bg-white rounded-2xl shadow-2xl z-50 flex flex-col ${isMaximized ? '' : 'h-[600px] w-[500px] right-4 bottom-4'}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    <span className="font-bold">AIで求人を修正</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsMaximized(!isMaximized)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title={isMaximized ? "縮小" : "拡大"}
                    >
                        {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title="閉じる"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
                <div className="space-y-4">
                    {/* Welcome message */}
                    {messages.length === 0 && !pendingRefinement && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Wand2 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-2">AIで求人を修正</h3>
                            <p className="text-sm text-slate-500 mb-4">
                                自然言語で修正したい項目を指定してください
                            </p>
                            <div className="text-left bg-slate-50 rounded-lg p-3 space-y-2">
                                <p className="text-xs font-bold text-slate-500">例:</p>
                                <p className="text-sm text-slate-700">• 「タイトルと仕事内容を修正して」</p>
                                <p className="text-sm text-slate-700">• 「給与関連を見直して」</p>
                                <p className="text-sm text-slate-700">• 「未経験OKを強調して」</p>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map(message => (
                        <ChatMessageComponent key={message.id} message={message} />
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                    <span className="text-sm text-slate-600">考え中...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending refinement preview */}
                    {pendingRefinement && (
                        <RefinementPreview
                            originalFields={pendingRefinement.originalFields}
                            proposedFields={pendingRefinement.proposedFields}
                            changedFields={pendingRefinement.changedFields}
                            onApply={handleApply}
                            onRedo={handleRedo}
                            onCancel={handleCancelPreview}
                            isApplying={isApplying}
                        />
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="修正したい項目や内容を入力..."
                        disabled={isLoading || !!pendingRefinement}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Button
                        type="button"
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading || !!pendingRefinement}
                        className="px-4 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>

                {/* Reset button */}
                {messages.length > 0 && !pendingRefinement && (
                    <button
                        type="button"
                        onClick={resetChat}
                        className="mt-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        会話をリセット
                    </button>
                )}
            </div>
        </div>
    );
}
