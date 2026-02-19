"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MapPin, Banknote, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchJobsByArea } from "@/app/jobs/actions";

type AreaJob = {
    id: string;
    title: string;
    area: string | null;
    salary: string | null;
    type: string | null;
    category: string | null;
    hourly_wage: number | null;
    fulltime_job_details: { annual_salary_min: number | null; annual_salary_max: number | null }[] | null;
};

const PREFECTURES = ["東京都", "神奈川県", "埼玉県", "千葉県", "大阪府", "愛知県", "福岡県", "北海道"];
const TOKYO_WARDS = ["千代田区", "中央区", "港区", "新宿区", "渋谷区", "文京区", "台東区", "墨田区", "江東区", "品川区", "目黒区", "大田区", "世田谷区", "中野区", "杉並区", "豊島区", "北区", "荒川区", "板橋区", "練馬区", "足立区", "葛飾区", "江戸川区"];
const OSAKA_CITIES = ["大阪市北区", "大阪市中央区", "大阪市西区", "大阪市淀川区", "大阪市浪速区", "大阪市天王寺区", "大阪市阿倍野区", "大阪市福島区", "大阪市都島区", "大阪市城東区", "堺市堺区", "堺市北区", "豊中市", "吹田市", "高槻市", "枚方市", "茨木市", "東大阪市"];

export default function AreaJobSearch({
    currentJobId,
    currentPrefecture,
}: {
    currentJobId: string;
    currentPrefecture: string;
}) {
    const [selectedType, setSelectedType] = useState<string>("");
    const [selectedArea, setSelectedArea] = useState<string>("");
    const [results, setResults] = useState<AreaJob[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSearch = (area: string, type: string) => {
        setSelectedArea(area);
        setSelectedType(type);
        setHasSearched(true);

        startTransition(async () => {
            const data = await searchJobsByArea(area, type, currentJobId, 10);
            setResults(data as AreaJob[]);
        });
    };

    const handleTypeChange = (type: string) => {
        const newType = selectedType === type ? "" : type;
        if (selectedArea) {
            handleSearch(selectedArea, newType);
        } else {
            setSelectedType(newType);
        }
    };

    const handleAreaSelect = (area: string) => {
        handleSearch(area, selectedType);
    };

    return (
        <section className="bg-slate-50 border-t border-slate-200 py-10">
            <div className="container mx-auto px-4">
                <h2 className="text-xl font-bold text-slate-900 mb-6">エリアで求人を探す</h2>

                {/* 雇用形態で絞り込み（一番上） */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">雇用形態で絞り込む</h3>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleTypeChange("正社員")}
                            className={cn(
                                "flex-1 py-2.5 rounded-xl text-center text-sm font-bold transition-colors border-2",
                                selectedType === "正社員"
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-blue-600 border-blue-200 hover:border-blue-400"
                            )}
                        >
                            正社員
                        </button>
                        <button
                            onClick={() => handleTypeChange("派遣")}
                            className={cn(
                                "flex-1 py-2.5 rounded-xl text-center text-sm font-bold transition-colors border-2",
                                selectedType === "派遣"
                                    ? "bg-pink-600 text-white border-pink-600"
                                    : "bg-white text-pink-600 border-pink-200 hover:border-pink-400"
                            )}
                        >
                            派遣
                        </button>
                    </div>
                </div>

                {/* 都道府県リンク */}
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">都道府県から探す</h3>
                    <div className="flex flex-wrap gap-2">
                        {PREFECTURES.map((pref) => (
                            <button
                                key={pref}
                                onClick={() => handleAreaSelect(pref)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                                    selectedArea === pref
                                        ? "bg-primary-600 text-white border-primary-600"
                                        : currentPrefecture === pref
                                            ? "bg-primary-50 text-primary-700 border-primary-200"
                                            : "bg-white text-slate-700 border-slate-200 hover:border-primary-300 hover:text-primary-600"
                                )}
                            >
                                {pref}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 東京23区 */}
                {(selectedArea === "東京都" || (!selectedArea && currentPrefecture === "東京都")) && (
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-700 mb-3">東京都の区から探す</h3>
                        <div className="flex flex-wrap gap-2">
                            {TOKYO_WARDS.map((ward) => {
                                const fullArea = "東京都 " + ward;
                                return (
                                    <button
                                        key={ward}
                                        onClick={() => handleAreaSelect(fullArea)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                                            selectedArea === fullArea
                                                ? "bg-primary-600 text-white border-primary-600"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-600"
                                        )}
                                    >
                                        {ward}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 大阪の区・市 */}
                {(selectedArea === "大阪府" || (!selectedArea && currentPrefecture === "大阪府")) && (
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-700 mb-3">大阪府の区・市から探す</h3>
                        <div className="flex flex-wrap gap-2">
                            {OSAKA_CITIES.map((city) => {
                                const fullArea = "大阪府 " + city;
                                return (
                                    <button
                                        key={city}
                                        onClick={() => handleAreaSelect(fullArea)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                                            selectedArea === fullArea
                                                ? "bg-primary-600 text-white border-primary-600"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-600"
                                        )}
                                    >
                                        {city}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 検索結果：横スクロールカルーセル */}
                {isPending && (
                    <div className="flex items-center justify-center py-8 text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        検索中...
                    </div>
                )}

                {!isPending && hasSearched && results.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-sm font-bold text-slate-700 mb-3">
                            {selectedArea}{selectedType ? `の${selectedType}` : ""}の求人
                            <span className="text-primary-600 ml-2">{results.length}件</span>
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
                            {results.map((rJob) => {
                                const rIsDispatch = rJob.type?.includes("派遣");
                                const rFt = rJob.fulltime_job_details?.[0];
                                return (
                                    <Link
                                        key={rJob.id}
                                        href={`/jobs/${rJob.id}`}
                                        className="flex-shrink-0 w-[280px] snap-start bg-white rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all p-4 space-y-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-full text-white",
                                                rIsDispatch ? "bg-pink-600" : "bg-blue-600"
                                            )}>
                                                {rJob.type}
                                            </span>
                                            {rJob.category && (
                                                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{rJob.category}</span>
                                            )}
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{rJob.title}</h3>
                                        <div className="space-y-1 text-xs text-slate-600">
                                            {rJob.area && (
                                                <p className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-slate-400" />
                                                    {rJob.area}
                                                </p>
                                            )}
                                            {rJob.salary && (
                                                <p className="flex items-center gap-1">
                                                    <Banknote className="w-3 h-3 text-slate-400" />
                                                    <span className="font-bold text-slate-800">{rJob.salary}</span>
                                                </p>
                                            )}
                                            {!rIsDispatch && rFt?.annual_salary_min && rFt?.annual_salary_max && (
                                                <p className="text-primary-600 font-bold">年収 {rFt.annual_salary_min}万〜{rFt.annual_salary_max}万</p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {!isPending && hasSearched && results.length === 0 && (
                    <div className="mt-6 text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-200">
                        {selectedArea}{selectedType ? `の${selectedType}` : ""}の求人は見つかりませんでした
                    </div>
                )}
            </div>
        </section>
    );
}
