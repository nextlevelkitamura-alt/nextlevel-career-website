"use client";

import { useState } from "react";
import { analyzeJobWithAI } from "@/app/actions/analyzeJob";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw, BarChart3, Tag } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface AIAnalysisPanelProps {
    jobId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    aiAnalysis: any; // Using any for flexibility with JSONB, but matches Job['ai_analysis']
}

export default function AIAnalysisPanel({ jobId, aiAnalysis }: AIAnalysisPanelProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [data, setData] = useState(aiAnalysis);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const result = await analyzeJobWithAI(jobId);
            if (result.success) {
                setData(result.data);
                toast.success("AI分析が完了しました");
            } else {
                toast.error("分析に失敗しました: " + result.error);
            }
        } catch {
            toast.error("エラーが発生しました");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    AI 求人分析 (Gemini 3.0)
                </h2>
                <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 hover:opacity-90"
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            分析中...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {data ? "再分析する" : "分析を実行"}
                        </>
                    )}
                </Button>
            </div>

            {!data ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p>まだ分析データがありません</p>
                    <p className="text-xs mt-1">ボタンを押して構造化データを生成します</p>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in duration-500">

                    {/* Summary */}
                    {data.summary && (
                        <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700">
                            <span className="font-bold block text-xs text-slate-400 mb-1">AI要約</span>
                            {data.summary}
                        </div>
                    )}

                    {/* Scores */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" />
                            タイプ適合度
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <ScoreBar label="TYPE A (安定)" score={data.suitability_scores?.A_stability} color="bg-blue-500" />
                            <ScoreBar label="TYPE B (私生活)" score={data.suitability_scores?.B_private_life} color="bg-green-500" />
                            <ScoreBar label="TYPE C (収入)" score={data.suitability_scores?.C_income_growth} color="bg-orange-500" />
                            <ScoreBar label="TYPE D (速度)" score={data.suitability_scores?.D_speed_immediate} color="bg-red-500" />
                        </div>
                    </div>

                    {/* Keywords */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            生成タグ
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {data.generated_tags?.map((tag: string, i: number) => (
                                <Badge key={i} variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ScoreBar({ label, score, color }: { label: string, score: number, color: string }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-600">{label}</span>
                <span className="font-bold text-slate-900">{score || 0}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-1000 ease-out`}
                    style={{ width: `${score || 0}%` }}
                />
            </div>
        </div>
    );
}
