"use client";

import { FileText, X } from "lucide-react";

export default function TextJobInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (text: string) => void;
}) {
    return (
        <div className="w-full space-y-2">
            <div className="relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="求人情報のテキストを貼り付けてください（求人票のコピペ、メール本文など）"
                    className="w-full min-h-[200px] p-4 border-2 border-dashed border-slate-300 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary-400 focus:ring-0 focus:outline-none resize-y bg-white"
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            {value.trim() && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{value.trim().length.toLocaleString()} 文字入力済み</span>
                </div>
            )}
        </div>
    );
}
