"use client";

import { Button } from "@/components/ui/button";
import { Search, MapPin, UserSquare2, Briefcase } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface SearchFormProps {
    initialArea?: string;
    initialType?: string;
    initialCategory?: string;
    categories?: string[];
}

export default function SearchForm({ initialArea = "", initialType = "", initialCategory = "", categories = [] }: SearchFormProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const params = new URLSearchParams();
        const area = (formData.get("area") as string) || "";
        const type = (formData.get("type") as string) || "";
        const category = (formData.get("category") as string) || "";

        if (area) params.set("area", area);
        if (type) params.set("type", type);
        if (category) params.set("category", category);

        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    };

    return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-xl rounded-2xl p-3 md:p-8">
            <h2 className="text-base md:text-2xl font-bold mb-3 md:mb-6 flex items-center text-slate-800">
                <Search className="w-5 h-5 md:w-6 md:h-6 mr-3 text-primary-500" />
                求人を検索する
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
                    <div className="space-y-1 md:space-y-2">
                        <label htmlFor="area" className="text-sm font-semibold text-slate-700 pl-1">
                            エリア
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                            <select
                                id="area"
                                name="area"
                                defaultValue={initialArea}
                                className="w-full h-9 md:h-12 rounded-xl border border-slate-200 bg-slate-50 pl-9 md:pl-11 pr-3 text-sm text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none shadow-sm"
                            >
                                <option value="" className="text-slate-900">すべて</option>
                                <option value="東京" className="text-slate-900">東京</option>
                                <option value="神奈川" className="text-slate-900">神奈川</option>
                                <option value="埼玉" className="text-slate-900">埼玉</option>
                                <option value="千葉" className="text-slate-900">千葉</option>
                                <option value="大阪" className="text-slate-900">大阪</option>
                                <option value="リモート" className="text-slate-900">リモート</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1 md:space-y-2">
                        <label htmlFor="type" className="text-sm font-semibold text-slate-700 pl-1">
                            雇用形態
                        </label>
                        <div className="relative">
                            <UserSquare2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                            <select
                                id="type"
                                name="type"
                                defaultValue={initialType}
                                className="w-full h-9 md:h-12 rounded-xl border border-slate-200 bg-slate-50 pl-9 md:pl-11 pr-3 text-sm text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none shadow-sm"
                            >
                                <option value="" className="text-slate-900">すべて</option>
                                <option value="正社員" className="text-slate-900">正社員</option>
                                <option value="派遣" className="text-slate-900">派遣</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1 md:space-y-2">
                        <label htmlFor="category" className="text-sm font-semibold text-slate-700 pl-1">
                            職種
                        </label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                            <select
                                id="category"
                                name="category"
                                defaultValue={initialCategory}
                                className="w-full h-9 md:h-12 rounded-xl border border-slate-200 bg-slate-50 pl-9 md:pl-11 pr-3 text-sm text-slate-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none shadow-sm"
                            >
                                <option value="" className="text-slate-900">すべて</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat} className="text-slate-900">{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tag Selection Removed as per request */}

                <div className="pt-1 md:pt-4">
                    <Button type="submit" className="w-full h-10 md:h-14 bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 font-bold text-sm md:text-lg rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                        <Search className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                        この条件で検索
                    </Button>
                </div>
            </form>
        </div>
    );
}
