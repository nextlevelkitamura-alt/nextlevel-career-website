"use client";

import { useState, useEffect, useCallback } from "react";
import { uploadDraftFile, getDraftFiles, deleteDraftFile } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Loader2, UploadCloud, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useDropzone } from "react-dropzone";

// Helper for class names
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function DraftFileManager() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [files, setFiles] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFiles = async () => {
        try {
            const data = await getDraftFiles();
            setFiles(data || []);
        } catch (error) {
            console.error(error);
            toast.error("ファイルの取得に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        if (acceptedFiles.length > 15) {
            toast.error("一度にアップロードできるファイルは15件までです");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        acceptedFiles.forEach(file => {
            formData.append("files", file); // Use "files" key for multiple
        });

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result: any = await uploadDraftFile(formData);
            if (result.success) {
                if (result.message) {
                    toast(result.message); // Partial success case
                } else {
                    toast.success(`${result.count}件のファイルをアップロードしました`);
                }
                fetchFiles();
            } else {
                toast.error(result.error || "アップロードに失敗しました");
            }
        } catch (error) {
            console.error(error);
            toast.error("アップロード中にエラーが発生しました");
        } finally {
            setIsUploading(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'application/pdf': []
        },
        maxFiles: 15,
        disabled: isUploading
    });

    const handleDelete = async (id: string) => {
        if (!confirm("このファイルを削除しますか？")) return;

        try {
            const result = await deleteDraftFile(id);
            if (result.success) {
                toast.success("ファイルを削除しました");
                setFiles(files.filter(f => f.id !== id));
            } else {
                toast.error(result.error || "削除に失敗しました");
            }
        } catch (error) {
            console.error(error);
            toast.error("削除中にエラーが発生しました");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div
                {...getRootProps()}
                className={classNames(
                    "bg-slate-50 border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer",
                    isDragActive ? "border-primary-500 bg-primary-50" : "border-slate-200 hover:border-primary-300",
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                )}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-center">
                    {isUploading ? (
                        <Loader2 className="w-12 h-12 text-primary-500 mb-4 animate-spin" />
                    ) : (
                        <UploadCloud className={classNames("w-12 h-12 mb-4", isDragActive ? "text-primary-500" : "text-slate-400")} />
                    )}
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {isUploading ? "アップロード中..." : "求人票・画像をアップロード"}
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-sm">
                        ここにファイルをドラッグ＆ドロップ、またはクリックして選択<br />
                        <span className="text-xs text-slate-400">（最大15件まで / PDF, JPG, PNG形式）</span>
                    </p>
                    <Button
                        type="button"
                        disabled={isUploading}
                        className="bg-primary-600 hover:bg-primary-700 text-white min-w-[160px] pointer-events-none" // pointer-events-none because specific click is handled by dropzone container
                    >
                        ファイルを選択
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-slate-50 font-bold text-slate-700 flex justify-between items-center">
                    <span>登録済みファイル一覧 ({files.length})</span>
                </div>
                {files.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        登録されているファイルはありません。
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {files.map((file) => (
                            <li key={file.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-medium text-slate-900 truncate" title={file.file_name}>
                                            {file.file_name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {(file.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/admin/jobs/create?draft_id=${file.id}`}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300"
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            求人作成
                                        </Button>
                                    </Link>
                                    <a
                                        href={file.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-slate-400 hover:text-primary-600 transition-colors"
                                        title="表示"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-slate-400 hover:text-red-600"
                                        onClick={() => handleDelete(file.id)}
                                        title="削除"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
