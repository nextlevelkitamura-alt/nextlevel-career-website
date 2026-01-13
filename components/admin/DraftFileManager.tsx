"use client";

import { useState, useEffect, useRef } from "react";
import { uploadDraftFile, getDraftFiles, deleteDraftFile } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Loader2, UploadCloud, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function DraftFileManager() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [files, setFiles] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const result = await uploadDraftFile(formData);
            if (result.success) {
                toast.success("ファイルをアップロードしました");
                fetchFiles();
            } else {
                toast.error(result.error || "アップロードに失敗しました");
            }
        } catch (error) {
            console.error(error);
            toast.error("アップロード中にエラーが発生しました");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

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
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 transition-colors hover:border-primary-300">
                <div className="flex flex-col items-center justify-center text-center">
                    <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-2">求人票・画像をアップロード</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-sm">
                        求人内容の記載されたPDFや画像を事前に登録しておくと、求人作成時に参照したり紐付けたりできます。
                    </p>
                    <div>
                        <Button
                            onClick={triggerFileInput}
                            disabled={isUploading}
                            className="bg-primary-600 hover:bg-primary-700 text-white min-w-[160px]"
                        >
                            {isUploading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <UploadCloud className="w-4 h-4 mr-2" />
                            )}
                            ファイルを選択
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleUpload}
                            accept=".pdf,image/jpeg,image/png"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-slate-50 font-bold text-slate-700">
                    登録済みファイル一覧 ({files.length})
                </div>
                {files.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        登録されているファイルはありません。
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {files.map((file) => (
                            <li key={file.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
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
