"use client";

import { Button } from "@/components/ui/button";
import { Search, X, Plus, Check, Tag } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface SearchFormProps {
    availableTags: string[];
    onSearch: (filters: {
        area: string;
        type: string;
        category: string;
        tags: string[];
    }) => void;
}

export default function SearchForm({ availableTags, onSearch }: SearchFormProps) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    // Explicitly type formData state or fetch it on submit.
    // Since we're preventing default, we can just grab form data on submit.

    // However, to keep controlled state for tags, we need to manage it.

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSearch({
            area: formData.get("area") as string,
            type: formData.get("type") as string,
            category: formData.get("category") as string,
            tags: selectedTags,
        });
    };

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const removeTag = (tag: string) => {
        setSelectedTags(selectedTags.filter(t => t !== tag));
    };

    return (
        <div className="bg-primary-600 rounded-2xl p-4 md:p-6 shadow-lg text-white">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center">
                <Search className="w-5 h-5 mr-2" />
                求人を検索する
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                        <label htmlFor="area" className="text-xs md:text-sm font-medium text-primary-100">
                            エリア
                        </label>
                        <select
                            id="area"
                            name="area"
                            className="w-full h-10 md:h-10 rounded-lg md:rounded-md border-0 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/20"
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

                    <div className="space-y-1.5 md:space-y-2">
                        <label htmlFor="type" className="text-xs md:text-sm font-medium text-primary-100">
                            雇用形態
                        </label>
                        <select
                            id="type"
                            name="type"
                            className="w-full h-10 md:h-10 rounded-lg md:rounded-md border-0 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/20"
                        >
                            <option value="" className="text-slate-900">すべて</option>
                            <option value="正社員" className="text-slate-900">正社員</option>
                            <option value="派遣" className="text-slate-900">派遣</option>
                            <option value="紹介予定派遣" className="text-slate-900">紹介予定派遣</option>
                        </select>
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                        <label htmlFor="category" className="text-xs md:text-sm font-medium text-primary-100">
                            職種
                        </label>
                        <select
                            id="category"
                            name="category"
                            className="w-full h-10 md:h-10 rounded-lg md:rounded-md border-0 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/20"
                        >
                            <option value="" className="text-slate-900">すべて</option>
                            <option value="事務" className="text-slate-900">事務</option>
                            <option value="営業" className="text-slate-900">営業</option>
                            <option value="コールセンター" className="text-slate-900">コールセンター</option>
                            <option value="IT・エンジニア" className="text-slate-900">IT・エンジニア</option>
                            <option value="クリエイティブ" className="text-slate-900">クリエイティブ</option>
                            <option value="販売・接客" className="text-slate-900">販売・接客</option>
                            <option value="製造・軽作業" className="text-slate-900">製造・軽作業</option>
                            <option value="医療・介護" className="text-slate-900">医療・介護</option>
                            <option value="リモート" className="text-slate-900">リモート</option>
                            <option value="その他" className="text-slate-900">その他</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                    <label className="text-xs md:text-sm font-medium text-primary-100">
                        こだわり条件（タグ）
                    </label>

                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-white/10 rounded-lg md:rounded-md border-0 focus-within:ring-2 focus-within:ring-white/20 transition-all">
                        {selectedTags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1 text-xs md:text-sm bg-white text-primary-700 hover:bg-white/90 gap-1 rounded-md">
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="p-0.5 rounded-full hover:bg-primary-100 text-primary-600 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}

                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 text-xs md:text-sm transition-all ${selectedTags.length === 0 ? 'w-full h-full' : ''}`}
                                >
                                    <Plus className="w-4 h-4" />
                                    {selectedTags.length === 0 ? "条件を追加..." : "追加"}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-[90vw] max-w-[340px] md:w-[400px]" align="start">
                                <Command>
                                    {/* Removed CommandInput as requested to prevent keyboard popup */}
                                    <CommandList className="max-h-[300px]">
                                        <CommandEmpty>タグが見つかりません</CommandEmpty>
                                        <CommandGroup heading="利用可能なタグ">
                                            {availableTags.map((tag) => (
                                                <CommandItem
                                                    key={tag}
                                                    value={tag}
                                                    onSelect={() => {
                                                        toggleTag(tag);
                                                        // Keep open for multi-select
                                                        // setOpen(false); 
                                                    }}
                                                    className="cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between w-full py-1">
                                                        <span>{tag}</span>
                                                        <div className="flex items-center gap-2">
                                                            {selectedTags.includes(tag) && <Check className="w-4 h-4 text-primary-600" />}
                                                            {/* Added Tag icon on the right as requested */}
                                                            <Tag className="w-4 h-4 text-slate-300" />
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="pt-1 md:pt-2">
                    <Button type="submit" className="w-full h-10 md:h-10 bg-white text-primary-600 hover:bg-white/90 font-bold text-sm md:text-sm">
                        この条件で検索
                    </Button>
                </div>
            </form>
        </div>
    );
}
