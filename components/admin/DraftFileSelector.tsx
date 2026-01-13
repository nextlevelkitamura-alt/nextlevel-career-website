"use client";

import { useState, useEffect } from "react";
import { getDraftFiles } from "@/app/admin/actions";
import { FileText, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface DraftFileSelectorProps {
    onSelectionChange: (selectedIds: string[]) => void;
    initialSelectedIds?: string[];
}

export default function DraftFileSelector({ onSelectionChange, initialSelectedIds = [] }: DraftFileSelectorProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [files, setFiles] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setSelectedIds(initialSelectedIds);
    }, [initialSelectedIds]);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const data = await getDraftFiles();
                setFiles(data || []);
            } catch (error) {
                console.error(error);
                toast.error("事前登録ファイルの取得に失敗しました");
            } finally {
                setIsLoading(false);
            }
        };
        fetchFiles();
    }, []);

    const toggleSelection = (id: string) => {
        const newSelection = selectedIds.includes(id)
            ? selectedIds.filter(selectedId => selectedId !== id)
            : [...selectedIds, id];

        setSelectedIds(newSelection);
        onSelectionChange(newSelection);
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>読み込み中...</span>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="text-sm text-slate-500 italic py-2 border border-dashed border-slate-200 rounded-lg px-4 bg-slate-50">
                事前登録されたファイルはありません。
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <p className="text-xs text-slate-500 font-medium">
                事前登録済みファイルから選択 ({selectedIds.length}個選択中)
            </p>
            <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${selectedIds.includes(file.id)
                            ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                        onClick={() => toggleSelection(file.id)}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-1.5 rounded ${selectedIds.includes(file.id) ? "bg-primary-100 text-primary-600" : "bg-slate-100 text-slate-500"
                                }`}>
                                <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 truncate" title={file.file_name}>
                                {file.file_name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                            <a
                                href={file.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 px-2 text-xs text-slate-400 hover:text-primary-600 flex items-center gap-1 bg-white border border-slate-200 rounded hover:border-primary-300 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ExternalLink className="w-3 h-3" />
                                表示
                            </a>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedIds.includes(file.id) ? "bg-primary-600 border-primary-600" : "bg-white border-slate-300"
                                }`}>
                                {selectedIds.includes(file.id) && (
                                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-none stroke-current stroke-3">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Hidden inputs for form data */}
            {selectedIds.map(id => (
                <input key={id} type="hidden" name="draft_file_ids" value={id} />
            ))}
        </div>
    );
}
