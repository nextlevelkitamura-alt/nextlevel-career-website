import { createClient } from "@/utils/supabase/server";
import JobCard from "@/components/JobCard";
import { Badge } from "@/components/ui/badge";

const TYPE_SCORE_MAP: Record<string, string> = {
    "A": "A_stability",
    "B": "B_private_life",
    "C": "C_income_growth",
    "D": "D_speed_immediate"
};

const TYPE_Title_MAP: Record<string, string> = {
    "A": "安定重視のあなたへ",
    "B": "プライベート重視のあなたへ",
    "C": "収入アップを目指すのあなたへ",
    "D": "すぐに働きたいあなたへ"
};

export default async function RecommendedJobs({ type }: { type: string }) {
    const supabase = createClient();

    // Fetch more jobs to sort on client side (MVP approach)
    // Eventually this should be an RPC or indexed query
    const { data: jobs } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50);

    if (!jobs || jobs.length === 0) {
        return (
            <div className="text-center py-10 opacity-70">
                <p>現在マッチする求人を準備中です。</p>
            </div>
        );
    }

    // Sort by AI Score
    const targetScoreKey = TYPE_SCORE_MAP[type] || "A_stability";

    const sortedJobs = [...jobs].sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scoreA = (a.ai_analysis as any)?.suitability_scores?.[targetScoreKey] || 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const scoreB = (b.ai_analysis as any)?.suitability_scores?.[targetScoreKey] || 0;
        return scoreB - scoreA;
    });

    const topJobs = sortedJobs.slice(0, 6);

    return (
        <div className="mt-12 animate-in slide-in-from-bottom-10 duration-700 delay-300">
            <div className="flex flex-col items-center justify-center gap-2 mb-8">
                <Badge className="bg-orange-100 text-orange-600 px-3 py-1 text-sm">
                    AIマッチング
                </Badge>
                <h3 className="text-2xl font-bold text-slate-900">
                    {TYPE_Title_MAP[type] || "おすすめの求人"}
                </h3>
                <p className="text-slate-500 text-sm">
                    あなたの診断タイプ「{type}」に高い適合率を持つ求人をAIが厳選しました
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topJobs.map((job) => (
                    <div key={job.id} className="relative group h-full">
                        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-500 blur-sm"></div>
                        <JobCard job={job} />

                        {/* AI Score Badge overlay (Optional, but cool) */}
                        <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            マッチ度 {(job.ai_analysis as any)?.suitability_scores?.[targetScoreKey]}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
