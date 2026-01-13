"use client";

import { useState, useEffect, KeyboardEvent, useRef } from "react";
import { X, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllUniqueTags } from "@/app/admin/actions";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TagManagerProps {
    value?: string; // Space separated string
    onChange?: (value: string) => void;
    placeholder?: string;
    name?: string;
}

export default function TagManager({ value = "", onChange, name }: TagManagerProps) {
    // Determine if we are in controlled or uncontrolled mode
    // Ideally this component should be controlled.

    // Internal state for tags
    const [tags, setTags] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [open, setOpen] = useState(false);

    // Parse initial value synchronously if provided (like we did for AreaSelect)
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!isInitialized.current && value) {
            const initialTags = value.split(/[,\s\u3000]+/).map(t => t.trim()).filter(Boolean);
            setTags(initialTags);
            isInitialized.current = true;
        } else if (!isInitialized.current && !value) {
            isInitialized.current = true;
        }
    }, [value]);

    // Fetch suggestions
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const uniqueTags = await getAllUniqueTags();
                setSuggestions(uniqueTags);
            } catch (error) {
                console.error("Failed to fetch tags", error);
            }
        };
        fetchTags();
    }, []);

    const updateTags = (newTags: string[]) => {
        setTags(newTags);
        // Space separated string for form compatibility
        const stringValue = newTags.join(" ");
        if (onChange) {
            onChange(stringValue);
        }
    };

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            updateTags([...tags, trimmed]);
        }
        setInputValue("");
        setOpen(false);
    };

    const removeTag = (tagToRemove: string) => {
        updateTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(inputValue);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-300 rounded-lg min-h-[48px]">
                {tags.length === 0 && (
                    <span className="text-slate-400 text-sm self-center">タグが選択されていません</span>
                )}
                {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 gap-1 flex items-center">
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-slate-500 hover:text-red-500 ml-1 focus:outline-none"
                        >
                            <X size={14} />
                        </button>
                    </Badge>
                ))}
            </div>

            <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            {inputValue ? inputValue : "既存のタグから選択または新規入力..."}
                            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                            <CommandInput
                                placeholder="タグを検索または作成..."
                                value={inputValue}
                                onValueChange={setInputValue}
                                onKeyDown={handleKeyDown}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    <button
                                        className="w-full text-left px-2 py-1.5 text-sm cursor-pointer hover:bg-slate-100 rounded text-primary-600 font-bold"
                                        onClick={() => addTag(inputValue)}
                                    >
                                        &quot;{inputValue}&quot; を新規作成
                                    </button>
                                </CommandEmpty>
                                <CommandGroup heading="既存のタグ">
                                    {suggestions.filter(s => !tags.includes(s)).map((suggestion) => (
                                        <CommandItem
                                            key={suggestion}
                                            value={suggestion}
                                            onSelect={(currentValue: string) => {
                                                addTag(currentValue);
                                            }}
                                        >
                                            <Tag className="mr-2 h-4 w-4" />
                                            {suggestion}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Hidden Input for Form Submission */}
            <input type="hidden" name={name} value={tags.join(" ")} />
        </div>
    );
}
