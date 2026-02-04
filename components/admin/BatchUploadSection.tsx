"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, Image as ImageIcon, X, Sparkles, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { startBatchExtraction } from "@/app/admin/actions";

interface BatchUploadSectionProps {
    onExtractionStarted: (batchId: string) => void;
}

type ExtractionMode = 'standard' | 'anonymous';

export default function BatchUploadSection({ onExtractionStarted }: BatchUploadSectionProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [mode, setMode] = useState<ExtractionMode>('standard');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFiles((prev) => [...prev, ...acceptedFiles]);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
        },
        multiple: true,
    });

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleStartExtraction = async () => {
        if (files.length === 0) {
            setError("ファイルが選択されていません");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const result = await startBatchExtraction(files, mode);

            if (result.error) {
                setError(result.error);
            } else if (result.batchId) {
                onExtractionStarted(result.batchId);
                setFiles([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            {/* Mode Selection */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">抽出モード選択</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Standard Mode */}
                    <button
                        type="button"
                        onClick={() => setMode('standard')}
                        className={cn(
                            "p-4 rounded-lg border-2 text-left transition-all",
                            mode === 'standard'
                                ? "border-primary-500 bg-primary-50"
                                : "border-slate-200 hover:border-slate-300"
                        )}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                                "p-2 rounded-lg",
                                mode === 'standard' ? "bg-primary-100" : "bg-slate-100"
                            )}>
                                <Sparkles className={cn(
                                    "w-5 h-5",
                                    mode === 'standard' ? "text-primary-600" : "text-slate-500"
                                )} />
                            </div>
                            <span className="font-semibold text-slate-900">通常モード</span>
                        </div>
                        <p className="text-sm text-slate-600">
                            企業名を具体的に出力します。求人票のまま情報を抽出したい場合に選択してください。
                        </p>
                    </button>

                    {/* Anonymous Mode */}
                    <button
                        type="button"
                        onClick={() => setMode('anonymous')}
                        className={cn(
                            "p-4 rounded-lg border-2 text-left transition-all",
                            mode === 'anonymous'
                                ? "border-primary-500 bg-primary-50"
                                : "border-slate-200 hover:border-slate-300"
                        )}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn(
                                "p-2 rounded-lg",
                                mode === 'anonymous' ? "bg-primary-100" : "bg-slate-100"
                            )}>
                                <EyeOff className={cn(
                                    "w-5 h-5",
                                    mode === 'anonymous' ? "text-primary-600" : "text-slate-500"
                                )} />
                            </div>
                            <span className="font-semibold text-slate-900">匿名モード</span>
                        </div>
                        <p className="text-sm text-slate-600">
                            企業名を伏せて抽出します。「大手通信企業」など、業種・業態で伝えます。
                        </p>
                    </button>
                </div>
            </div>

            {/* File Upload Area */}
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
                    <UploadCloud className="w-12 h-12 mb-2 text-slate-400" />
                    <p className="font-medium text-lg">
                        ファイルをドラッグ＆ドロップ、またはクリックして選択
                    </p>
                    <p className="text-sm">
                        PDF, JPG, PNG (複数選択可)
                    </p>
                </div>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900">
                            選択されたファイル ({files.length}件)
                        </h3>
                        <button
                            type="button"
                            onClick={() => setFiles([])}
                            className="text-sm text-red-600 hover:text-red-700"
                        >
                            すべてクリア
                        </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="p-2 bg-white rounded border border-slate-100 flex-shrink-0">
                                        {file.type.includes("pdf") ? (
                                            <FileText className="w-5 h-5 text-red-500" />
                                        ) : (
                                            <ImageIcon className="w-5 h-5 text-blue-500" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-900 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="p-1.5 hover:bg-red-100 rounded-full text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Start Extraction Button */}
                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={handleStartExtraction}
                            disabled={isProcessing || files.length === 0}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all",
                                isProcessing || files.length === 0
                                    ? "bg-slate-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90"
                            )}
                        >
                            <Sparkles className="w-5 h-5" />
                            {isProcessing ? "処理中..." : "AI抽出を開始"}
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <p className="font-medium">エラー</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            )}
        </div>
    );
}
