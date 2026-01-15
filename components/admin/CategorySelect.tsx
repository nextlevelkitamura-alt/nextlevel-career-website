"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface CategorySelectProps {
    value: string;
    onChange: (value: string) => void;
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
                .insert({ category: "category", value: newCategory.trim() });

            if (!error) {
                setCategories(prev => [...prev, newCategory.trim()].sort());
                onChange(newCategory.trim());
                setNewCategory("");
                setIsAdding(false);
            }
        } catch (e) {
            console.error("Error adding category:", e);
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <div className="flex-1">
                    <Select value={value} onValueChange={onChange}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="職種を選択" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex-shrink-0"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            {isAdding && (
                <div className="flex gap-2">
                    <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="新しいカテゴリ名"
                        className="flex-1"
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
            {name && <input type="hidden" name={name} value={value} />}
        </div>
    );
}
