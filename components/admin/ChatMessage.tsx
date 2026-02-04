"use client";

import { Bot } from "lucide-react";

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type: 'text' | 'refinement_preview';
    refinementData?: {
        originalFields: Record<string, unknown>;
        proposedFields: Record<string, unknown>;
        changedFields: string[];
    };
}

interface ChatMessageProps {
    message: ChatMessage;
}

function formatTimestamp(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "たった今";
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}時間前`;
    return `${Math.floor(diffMins / 1440)}日前`;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    if (isUser) {
        return (
            <div className="flex justify-end mb-4">
                <div className="max-w-[80%]">
                    <div className="bg-purple-600 text-white px-4 py-2 rounded-2xl rounded-br-md">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 text-right">
                        {formatTimestamp(message.timestamp)}
                    </p>
                </div>
            </div>
        );
    }

    // Assistant message
    return (
        <div className="flex justify-start mb-4">
            <div className="max-w-[80%]">
                <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md">
                        {message.type === 'text' ? (
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{message.content}</p>
                        ) : (
                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{message.content}</p>
                        )}
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-1 ml-10">
                    {formatTimestamp(message.timestamp)}
                </p>
            </div>
        </div>
    );
}
