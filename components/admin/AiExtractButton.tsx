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
    }) => void;
    disabled?: boolean;
}

export default function AiExtractButton({
    fileUrl,
    fileName,
    onExtracted,
    disabled
}: AiExtractButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleExtract = async () => {
        if (!fileUrl) return;

        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Step 1: Extract data from file
            const extractResult = await extractJobDataFromFile(fileUrl);

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

            // Step 3: Call the callback with extracted data
            onExtracted(processedData, matchResults);
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

    return (
        <div className="space-y-2">
            <Button
                type="button"
                onClick={handleExtract}
                disabled={disabled || isLoading || !fileUrl}
                className={`
                    w-full h-12 font-bold text-base transition-all
                    ${success
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    }
                    text-white shadow-lg hover:shadow-xl
                `}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        AI解析中...
                    </>
                ) : success ? (
                    <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        抽出完了！
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        AIで自動入力
                    </>
                )}
            </Button>

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
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <p>フォームに自動入力しました。内容を確認・編集してください。</p>
                </div>
            )}
        </div>
    );
}
