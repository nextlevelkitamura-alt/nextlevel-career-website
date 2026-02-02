/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import JobCard from "@/components/JobCard";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { calculateJobMatchScore } from "@/app/diagnosis/actions";

const TYPE_TITLE_MAP: Record<string, string> = {
    "A": "安定重視のあなたへ",
    "B": "プライベート重視のあなたへ",
    "C": "収入アップを目指すのあなたへ",
    "D": "すぐに働きたいあなたへ"
};

const TYPE_SCORE_MAP: Record<string, string> = {
    "A": "A_stability",
    "B": "B_private_life",
    "C": "C_income_growth",
    "D": "D_speed_immediate"
};

interface JobWithScore {
    id: string;
    title: string;
    category: string;
    salary: string;
    area: string;
    type: string;
    tags: string[];
    description?: string;
    ai_analysis?: {
        generated_tags: string[];
        suitability_scores: {
            A_stability: number;
            B_private_life: number;
            C_income_growth: number;
            D_speed_immediate: number;
        };
        employment_type_normalized?: string;
        salary_analysis?: {
            min: number;
            max: number;
            is_annual: boolean;
        };
        summary?: string;
    };
    matchScore?: number;
    matchReason?: string;
    isLoading?: boolean;
}

export default function RecommendedJobs({ type, answers }: { type: string; answers?: Record<string, string> }) {
    const [jobs, setJobs] = useState<JobWithScore[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadJobs = async () => {
            setIsLoading(true);
            const supabase = createClient();

            const { data: jobsData } = await supabase
                .from("jobs")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .limit(50);

            if (!jobsData || jobsData.length === 0) {
                setJobs([]);
                setIsLoading(false);
                return;
            }

            const targetScoreKey = TYPE_SCORE_MAP[type];

            // Process jobs with pre-calculated scores or mark for real-time analysis
            const processedJobs: JobWithScore[] = jobsData.map(job => {
                const aiAnalysis = job.ai_analysis as JobWithScore['ai_analysis'];
                const preScore = aiAnalysis?.suitability_scores?.[targetScoreKey as keyof typeof aiAnalysis.suitability_scores];

                return {
                    ...job,
                    matchScore: preScore || undefined,
                    isLoading: !preScore
                };
            });

            // Sort: jobs with pre-calculated scores first, then by score
            processedJobs.sort((a, b) => {
                if (a.matchScore && b.matchScore) {
                    return b.matchScore - a.matchScore;
                }
                if (a.matchScore && !b.matchScore) return -1;
                if (!a.matchScore && b.matchScore) return 1;
                return 0;
            });

            setJobs(processedJobs.slice(0, 6));
            setIsLoading(false);

            // Calculate real-time scores for jobs without pre-calculated scores
            if (answers) {
                const jobsToAnalyze = processedJobs.filter(j => j.isLoading);

                for (const job of jobsToAnalyze) {
                    try {
                        const result = await calculateJobMatchScore(
                            {
                                id: job.id,
                                title: job.title,
                                category: job.category,
                                salary: job.salary,
                                area: job.area,
                                description: job.description
                            },
                            type,
                            answers
                        );

                        if (result) {
                            setJobs(prev => {
                                const updated = prev.map(j =>
                                    j.id === job.id
                                        ? { ...j, matchScore: result.score, matchReason: result.reason, isLoading: false }
                                        : j
                                );
                                // Re-sort with new scores
                                return [...updated].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
                            });
                        }
                    } catch (error) {
                        console.error('Failed to calculate score for job:', job.id, error);
                        setJobs(prev => prev.map(j =>
                            j.id === job.id ? { ...j, isLoading: false } : j
                        ));
                    }
                }
            }
        };

        loadJobs();
    }, [type, answers]);

    if (isLoading) {
        return (
            <div className="mt-12 text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
                <p className="text-slate-500">AIがあなたに最適な求人をマッチング中...</p>
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="mt-12 text-center py-12">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-orange-400" />
                <p className="text-slate-600 font-medium">現在マッチする求人を準備中です。</p>
                <p className="text-slate-400 text-sm mt-2">求人が登録され次第、AIマッチングでおすすめをご案内します。</p>
            </div>
        );
    }

    return (
        <div className="mt-12 animate-in slide-in-from-bottom-10 duration-700 delay-300">
            <div className="flex flex-col items-center justify-center gap-2 mb-8">
                <Badge className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-4 py-1.5 text-sm font-bold shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AIマッチング
                </Badge>
                <h3 className="text-2xl font-bold text-slate-900">
                    {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                    {TYPE_TITLE_MAP[type] || "おすすめの求人"}
                </h3>
                <p className="text-slate-500 text-sm max-w-md text-center">
                    あなたの診断タイプ「{type}」に高い適合率を持つ求人をAIが厳選しました
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                    <div key={job.id} className="relative group h-full">
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-500 blur-sm"></div>
                        <JobCard job={job} />

                        {/* AI Score Badge */}
                        <div className="absolute -top-2 -right-2 z-10">
                            {job.isLoading ? (
                                <div className="bg-slate-200 text-slate-500 text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    分析中
                                </div>
                            ) : job.matchScore !== undefined ? (
                                <div className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg ${job.matchScore >= 80 ? 'bg-green-500 text-white' :
                                    job.matchScore >= 60 ? 'bg-green-400 text-white' :
                                        job.matchScore >= 40 ? 'bg-yellow-400 text-white' :
                                            job.matchScore >= 20 ? 'bg-orange-400 text-white' :
                                                'bg-red-400 text-white'
                                    }`}>
                                    {job.matchScore}%
                                </div>
                            ) : null}
                        </div>

                        {/* Match Reason Tooltip */}
                        {job.matchReason && !job.isLoading && (
                            <div className="absolute -bottom-8 left-0 right-0 bg-slate-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-center shadow-lg">
                                {job.matchReason}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
