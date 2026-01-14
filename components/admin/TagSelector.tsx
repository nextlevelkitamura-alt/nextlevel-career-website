"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Check, Loader2 } from "lucide-react";
import { getJobOptions, createJobOption } from "@/app/admin/actions";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface TagSelectorProps {
    category: "requirements" | "holidays" | "benefits" | "other";
    value: string; // JSON Array string or plain text
    onChange: (value: string) => void;
    placeholder?: string;
    description?: string;
}

export default function TagSelector({
    category,
    value,
    onChange,
    placeholder = "タグを選択または作成...",
    description
}: TagSelectorProps) {
    const [tags, setTags] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<{ id: string, label: string, value: string }[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Initial parsing
    useEffect(() => {
        if (!value) {
            setTags([]);
            return;
        }

        try {
            // Try to parse as JSON
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                setTags(parsed);
            } else {
                // If valid JSON but not array (unlikely), or just a string
                // Treat comma separated or new line separated as tags for migration convenience?
                // For now, if not array, treat as single tag if not empty
                if (typeof parsed === 'string') setTags([parsed]);
            }
        } catch {
            // Not JSON, assume plain text.
            // Split by comma or newlines to help migration?
            // Or just treat as one big tag?
            // User requirement says "Input selection style".
            // Let's assume we want to split by newlines if it looks like a list?
            // For safety, let's just make it a single tag for now if it's not empty
            if (value.trim()) {
                setTags([value]);
            } else {
                setTags([]);
            }
        }
    }, [value]);

    // Load Options
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const data = await getJobOptions(category);
                setOptions(data || []);
            } catch (e) {
                console.error("Failed to load options", e);
            }
        };
        if (open) {
            loadOptions();
        }
    }, [category, open]);

    const updateTags = (newTags: string[]) => {
        // Remove duplicates and empty strings
        const uniqueTags = Array.from(new Set(newTags.filter(Boolean)));
        setTags(uniqueTags);
        // Save as JSON string
        onChange(JSON.stringify(uniqueTags));
    };

    const addTag = (tag: string) => {
        if (!tags.includes(tag)) {
            updateTags([...tags, tag]);
        }
        setOpen(false);
        setInputValue("");
    };

    const removeTag = (tagToRemove: string) => {
        updateTags(tags.filter(t => t !== tagToRemove));
    };

    const handleCreateOption = async () => {
        if (!inputValue.trim()) return;
        setIsCreating(true);
        try {
            // Check if exists locally to avoid duplicates
            if (options.some(o => o.label === inputValue)) {
                addTag(inputValue);
                return;
            }

            // Create in DB
            const res = await createJobOption(category, inputValue, inputValue);
            if (res.error) {
                alert(res.error);
            } else {
                // Add to current selection
                addTag(inputValue);
                // Reload options in background
                const data = await getJobOptions(category);
                setOptions(data || []);
            }
        } catch (e) {
            console.error(e);
            alert("作成に失敗しました");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-white rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                {tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1.5 md:text-sm text-slate-700 bg-slate-100 border-slate-200 hover:bg-slate-200 gap-1 rounded-lg">
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="p-0.5 rounded-full hover:bg-slate-300 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                    </Badge>
                ))}

                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all ${tags.length === 0 ? 'w-full justify-center md:w-auto' : ''}`}
                        >
                            <Plus className="w-4 h-4" />
                            {tags.length === 0 ? placeholder : "追加"}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[300px]" align="start">
                        <Command>
                            <CommandInput
                                placeholder="タグを検索または作成..."
                                value={inputValue}
                                onValueChange={setInputValue}
                            />
                            <CommandList>
                                <CommandEmpty className="py-2 px-2 text-center text-sm">
                                    {inputValue ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-slate-500">&quot;{inputValue}&quot; は見つかりませんでした</p>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCreateOption}
                                                disabled={isCreating}
                                                className="w-full text-primary-600 border-primary-200 hover:bg-primary-50"
                                            >
                                                {isCreating ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Plus className="w-3 h-3 mr-2" />}
                                                &quot;{inputValue}&quot; を新規作成
                                            </Button>
                                        </div>
                                    ) : (
                                        "タグが見つかりません"
                                    )}
                                </CommandEmpty>
                                <CommandGroup heading="テンプレート">
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option.id}
                                            value={option.label}
                                            onSelect={() => addTag(option.label)}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span>{option.label}</span>
                                                {tags.includes(option.label) && <Check className="w-4 h-4 text-primary-600" />}
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
            {description && (
                <p className="text-xs text-slate-500">{description}</p>
            )}

            {/* Hidden Input for Form Submission */}
            <input type="hidden" name={category} value={JSON.stringify(tags)} />
        </div>
    );
}
