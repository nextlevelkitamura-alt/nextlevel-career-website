import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchFormProps {
    onSearch: (filters: {
        area: string;
        type: string;
        category: string;
        keyword: string;
    }) => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSearch({
            area: formData.get("area") as string,
            type: formData.get("type") as string,
            category: formData.get("category") as string,
            keyword: formData.get("keyword") as string,
        });
    };

    return (
        <div className="bg-primary-600 rounded-2xl p-6 shadow-lg text-white">
            <h2 className="text-xl font-bold mb-6 flex items-center">
                <Search className="w-5 h-5 mr-2" />
                求人を検索する
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="area" className="text-sm font-medium text-primary-100">
                            エリア
                        </label>
                        <select
                            id="area"
                            name="area"
                            className="w-full h-10 rounded-md border-0 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/20"
                        >
                            <option value="" className="text-slate-900">すべて</option>
                            <option value="東京" className="text-slate-900">東京</option>
                            <option value="大阪" className="text-slate-900">大阪</option>
                            <option value="リモート" className="text-slate-900">リモート</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="type" className="text-sm font-medium text-primary-100">
                            雇用形態
                        </label>
                        <select
                            id="type"
                            name="type"
                            className="w-full h-10 rounded-md border-0 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/20"
                        >
                            <option value="" className="text-slate-900">すべて</option>
                            <option value="正社員" className="text-slate-900">正社員</option>
                            <option value="派遣" className="text-slate-900">派遣</option>
                            <option value="紹介予定派遣" className="text-slate-900">紹介予定派遣</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-medium text-primary-100">
                            職種
                        </label>
                        <select
                            id="category"
                            name="category"
                            className="w-full h-10 rounded-md border-0 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/20"
                        >
                            <option value="" className="text-slate-900">すべて</option>
                            <option value="事務" className="text-slate-900">事務</option>
                            <option value="営業" className="text-slate-900">営業</option>
                            <option value="コールセンター" className="text-slate-900">コールセンター</option>
                            <option value="クリエイティブ" className="text-slate-900">クリエイティブ</option>
                            <option value="IT・エンジニア" className="text-slate-900">IT・エンジニア</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="keyword" className="text-sm font-medium text-primary-100">
                        キーワード
                    </label>
                    <input
                        type="text"
                        id="keyword"
                        name="keyword"
                        placeholder="例：駅チカ、長期、在宅など"
                        className="w-full h-10 rounded-md border-0 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/20"
                    />
                </div>

                <div className="pt-2">
                    <Button type="submit" className="w-full bg-white text-primary-600 hover:bg-white/90 font-bold">
                        この条件で検索
                    </Button>
                </div>
            </form>
        </div>
    );
}
