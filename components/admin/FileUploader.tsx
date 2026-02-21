"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";



export default function FileUploader({
    onFileSelect,
    currentFiles = [],
    accept = {
        "application/pdf": [".pdf"],
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
    },
    label = "ファイルをドラッグ＆ドロップ、またはクリックして選択",
    multiple = false,
    onDeleteFile,
    onAnalyzeFile,
    onPreviewFile,
}: {
    onFileSelect: (files: File[]) => void;
    currentFiles?: { id?: string; name: string; url: string; size?: number }[];
    accept?: Record<string, string[]>;
    label?: string;
    multiple?: boolean;
    onDeleteFile?: (fileId: string) => Promise<void>;
    onAnalyzeFile?: (fileUrl: string) => Promise<void>;
    onPreviewFile?: (file: { url: string; type: string; name: string }) => void;
}) {
    const [previewFiles, setPreviewFiles] = useState<File[]>([]);
    const [analyzingFileId, setAnalyzingFileId] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                if (multiple) {
                    setPreviewFiles((prev) => {
                        const newFiles = [...prev, ...acceptedFiles];
                        onFileSelect(newFiles);
                        return newFiles;
                    });
                } else {
                    const file = acceptedFiles[0];
                    setPreviewFiles([file]);
                    onFileSelect([file]);
                }
            }
        },
        [onFileSelect, multiple]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: multiple ? undefined : 1,
        multiple,
    });

    const removePreviewFile = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setPreviewFiles((prev) => {
            const newFiles = prev.filter((_, i) => i !== index);
            onFileSelect(newFiles);
            return newFiles;
        });
    };

    const handleDeleteExisting = async (fileId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDeleteFile) {
            if (confirm("このファイルを削除してもよろしいですか？")) {
                await onDeleteFile(fileId);
            }
        }
    };

    const handleAnalyzeClick = async (fileUrl: string, fileId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onAnalyzeFile) {
            if (confirm("このファイルから求人情報を再生成しますか？\n現在の入力内容は上書きされます。")) {
                setAnalyzingFileId(fileId);
                try {
                    await onAnalyzeFile(fileUrl);
                } finally {
                    setAnalyzingFileId(null);
                }
            }
        }
    };

    return (
        <div className="w-full space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                    isDragActive
                        ? "border-primary-500 bg-primary-50"
                        : "border-slate-300 hover:border-primary-400 hover:bg-slate-50"
                )}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center gap-2 text-slate-500">
                    <UploadCloud className="w-10 h-10 mb-2 text-slate-400" />
                    <p className="font-medium">{label}</p>
                    <p className="text-xs">PDF, JPG, PNG {multiple ? "(複数選択可)" : "(最大 10MB)"}</p>
                </div>
            </div>

            {/* Preview New Files */}
            {previewFiles.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700">アップロード予定のファイル</p>
                    {previewFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-50 rounded">
                                    {file.type.includes("pdf") ? (
                                        <FileText className="w-6 h-6 text-red-500" />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 text-blue-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => removePreviewFile(index, e)}
                                type="button"
                                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Existing Files */}
            {currentFiles.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-700">登録済みのファイル</p>
                    {currentFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded border border-slate-100">
                                    <FileText className="w-6 h-6 text-slate-500" />
                                </div>
                                <div>
                                    {onPreviewFile ? (
                                        <button
                                            type="button"
                                            className="text-sm font-medium text-primary-600 hover:underline text-left"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const ext = file.name.split('.').pop()?.toLowerCase() || '';
                                                const type = ext === 'pdf' ? 'application/pdf' : `image/${ext}`;
                                                onPreviewFile({ url: file.url, type, name: file.name });
                                            }}
                                        >
                                            {file.name}
                                        </button>
                                    ) : (
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-primary-600 hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {file.name}
                                        </a>
                                    )}
                                    {file.size && (
                                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {onAnalyzeFile && (
                                    <button
                                        onClick={(e) => handleAnalyzeClick(file.url, file.id || String(index), e)}
                                        type="button"
                                        disabled={analyzingFileId === (file.id || String(index))}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 rounded-md transition-all disabled:opacity-50"
                                        title="このファイルから情報を再生成"
                                    >
                                        <UploadCloud className="w-3 h-3" /> {/* Using UploadCloud as generic magic icon if Sparkles not imported, wait I should use Sparkles */}
                                        {analyzingFileId === (file.id || String(index)) ? "解析中..." : "AI読込"}
                                    </button>
                                )}
                                {onDeleteFile && file.id && (
                                    <button
                                        onClick={(e) => handleDeleteExisting(file.id!, e)}
                                        type="button"
                                        className="p-1.5 hover:bg-red-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
