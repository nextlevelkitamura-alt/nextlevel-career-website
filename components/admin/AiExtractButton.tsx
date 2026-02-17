"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { extractJobDataFromFile, processExtractedJobData, ExtractedJobData, TagMatchResult } from "@/app/admin/actions";

interface AiExtractButtonProps {
    fileUrl: string | null;
    fileName?: string;
    onExtracted: (data: ExtractedJobData, matchResults: {
        requirements: TagMatchResult[];
        holidays: TagMatchResult[];
        benefits: TagMatchResult[];
    }, options?: { mode: 'standard' | 'anonymous' }) => void;
    disabled?: boolean;
    jobType?: string;
}

export default function AiExtractButton({
    fileUrl,
    fileName,
    onExtracted,
    disabled,
    jobType
}: AiExtractButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleExtract = async (mode: 'standard' | 'anonymous') => {
        if (!fileUrl) return;

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Step 1: Extract data from file
            const extractResult = await extractJobDataFromFile(fileUrl, mode, jobType);

            if (extractResult.error) {
                setError(extractResult.error);
                return;
            }

            if (!extractResult.data) {
                setError("No data extracted from file");
                return;
            }

            // Step 2: Process and match tags with existing options
            const { processedData, matchResults } = await processExtractedJobData(extractResult.data);

            // Step 3: Call the callback with extracted data + mode info
            onExtracted(processedData, matchResults, { mode });
            setSuccess(true);

            // Reset success state after 3 seconds
            setTimeout(() => setSuccess(false), 3000);

        } catch (err) {
            console.error("AI extraction error:", err);
            setError(err instanceof Error ? err.message : "Unknown error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    if (!fileUrl) {
        return null;
    }

    // 雇用形態に応じたモード判定
    const isDispatch = jobType === '派遣' || jobType === '紹介予定派遣';
    const isFulltime = jobType === '正社員' || jobType === '契約社員';

    return (
        <div className="space-y-3">
            {isDispatch ? (
                // 派遣: 匿名生成のみ（企業名は常に非公開）
                <Button
                    type="button"
                    onClick={() => handleExtract('anonymous')}
                    disabled={disabled || isLoading || !fileUrl}
                    className={`
                        w-full h-12 font-bold text-sm transition-all
                        ${success
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                        }
                        text-white shadow-md hover:shadow-lg
                    `}
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : success ? (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                    ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? "解析中..." : success ? "完了" : "派遣求人として生成"}
                </Button>
            ) : isFulltime ? (
                // 正社員: 2ボタン（企業情報あり / 企業名非公開）
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        type="button"
                        onClick={() => handleExtract('standard')}
                        disabled={disabled || isLoading || !fileUrl}
                        className={`
                            h-12 font-bold text-sm transition-all
                            ${success
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            }
                            text-white shadow-md hover:shadow-lg
                        `}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : success ? (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                        ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        {isLoading ? "解析中..." : success ? "完了" : "企業情報あり"}
                    </Button>
                    <Button
                        type="button"
                        onClick={() => handleExtract('anonymous')}
                        disabled={disabled || isLoading || !fileUrl}
                        variant="outline"
                        className={`
                            h-12 font-bold text-sm transition-all border-2 border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400
                            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <span className="flex items-center">
                                <span className="text-lg mr-1.5">🔒</span>
                                企業名非公開
                            </span>
                        )}
                    </Button>
                </div>
            ) : (
                // 未選択: 従来の2ボタン
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        type="button"
                        onClick={() => handleExtract('standard')}
                        disabled={disabled || isLoading || !fileUrl}
                        className={`
                            h-12 font-bold text-sm transition-all
                            ${success
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                            }
                            text-white shadow-md hover:shadow-lg
                        `}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : success ? (
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                        ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        {isLoading ? "解析中..." : success ? "完了" : "通常生成 (会社名あり)"}
                    </Button>

                    <Button
                        type="button"
                        onClick={() => handleExtract('anonymous')}
                        disabled={disabled || isLoading || !fileUrl}
                        variant="outline"
                        className={`
                            h-12 font-bold text-sm transition-all border-2 border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400
                            ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <span className="flex items-center">
                                <span className="text-xl mr-2">😶</span>
                                匿名生成 (伏せ字)
                            </span>
                        )}
                    </Button>
                </div>
            )}

            {fileName && !error && !success && (
                <p className="text-xs text-slate-500 text-center">
                    「{fileName}」から求人情報を自動抽出します
                </p>
            )}

            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-bold">エラーが発生しました</p>
                        <p className="text-xs mt-1">{error}</p>
                    </div>
                </div>
            )}

            {success && (
                <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <p className="font-bold">自動入力しました！</p>
                </div>
            )}
        </div>
    );
}
