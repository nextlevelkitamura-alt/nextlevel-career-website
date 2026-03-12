"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategorySelectProps {
    value: string[];
    onChange: (value: string[]) => void;
    name?: string;
}

// Default categories (will be overwritten by DB data)
const DEFAULT_CATEGORIES = [
    "事務",
    "コールセンター",
    "営業",
    "IT・エンジニア",
    "クリエイティブ",
    "販売・接客",
    "製造・軽作業",
    "医療・介護",
    "リモート",
    "その他"
];

export default function CategorySelect({ value, onChange, name }: CategorySelectProps) {
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Fetch categories from job_options table
    useEffect(() => {
        const fetchCategories = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { data, error } = await supabase
                .from("job_options")
                .select("value")
                .eq("category", "category")
                .order("value");

            if (!error && data && data.length > 0) {
                setCategories(data.map((d: { value: string }) => d.value));
            }
        };

        fetchCategories();
    }, []);

    const toggleCategory = (cat: string) => {
        if (value.includes(cat)) {
            // 最低1つは残す
            if (value.length > 1) {
                onChange(value.filter(v => v !== cat));
            }
        } else {
            onChange([...value, cat]);
        }
    };

    const displayCategories = Array.from(
        new Set([
            ...categories,
            ...value.filter(Boolean),
        ])
    );

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;

        setIsLoading(true);
        try {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { error } = await supabase
                .from("job_options")
                .insert({ category: "category", label: newCategory.trim(), value: newCategory.trim() });

            if (error) {
                alert(`カテゴリの追加に失敗しました: ${error.message}`);
            } else {
                setCategories(prev => [...prev, newCategory.trim()].sort());
                onChange([...value, newCategory.trim()]);
                setNewCategory("");
                setIsAdding(false);
            }
        } catch (e) {
            console.error("Error adding category:", e);
            alert("カテゴリの追加中にエラーが発生しました");
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {displayCategories.map(cat => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                            value.includes(cat)
                                ? "bg-primary-600 text-white border-primary-600"
                                : "bg-white text-slate-600 border-slate-300 hover:border-primary-400 hover:text-primary-600"
                        )}
                    >
                        {cat}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-slate-300 text-slate-400 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center gap-1"
                    title="カテゴリを追加"
                >
                    <Plus className="w-3.5 h-3.5" />
                    追加
                </button>
                <Link
                    href="/admin/jobs/masters?tab=category"
                    target="_blank"
                    className="px-3 py-1.5 rounded-full text-sm font-medium border border-slate-300 text-slate-400 hover:text-primary-600 hover:border-primary-300 transition-colors flex items-center gap-1"
                    title="カテゴリを管理・削除"
                >
                    <Settings className="w-3.5 h-3.5" />
                    管理
                </Link>
            </div>

            {isAdding && (
                <div className="flex gap-2">
                    <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="新しいカテゴリ名"
                        className="flex-1 bg-white text-slate-900 border-slate-300"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCategory();
                            }
                        }}
                    />
                    <Button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={isLoading || !newCategory.trim()}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                        追加
                    </Button>
                </div>
            )}

            {/* Hidden input for form submission */}
            {name && <input type="hidden" name={name} value={JSON.stringify(value)} />}
        </div>
    );
}
