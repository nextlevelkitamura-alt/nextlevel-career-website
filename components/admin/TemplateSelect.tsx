"use client";

import { useState, useEffect } from "react";
import { getJobOptions } from "@/app/admin/actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TemplateSelectProps {
    category: string;
    onSelect: (value: string) => void;
    label?: string;
}

export default function TemplateSelect({ category, onSelect, label = "テンプレートから入力" }: TemplateSelectProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [options, setOptions] = useState<any[]>([]);

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const data = await getJobOptions(category);
                setOptions(data || []);
            } catch (e) {
                console.error("Failed to load options", e);
            }
        };
        loadOptions();
    }, [category]);

    if (options.length === 0) return null;

    return (
        <div className="mb-2">
            <Select onValueChange={onSelect}>
                <SelectTrigger className="w-full md:w-[300px] h-9 text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.id} value={opt.value} className="text-xs">
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
