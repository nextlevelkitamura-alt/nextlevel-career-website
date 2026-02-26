"use client";

import { ATTIRE_TYPES } from "./data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AttireSelectorProps {
    attireValue: string;
    hairValue: string;
    onAttireChange: (value: string) => void;
    onHairChange: (value: string) => void;
}

export default function AttireSelector({
    attireValue,
    hairValue,
    onAttireChange,
    onHairChange
}: AttireSelectorProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 服装 */}
            <div className="space-y-2">
                <label htmlFor="attire-type" className="text-sm font-bold text-slate-700">
                    服装
                </label>
                <Select value={attireValue} onValueChange={onAttireChange}>
                    <SelectTrigger className="bg-white" id="attire-type">
                        <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                        {ATTIRE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* 髪型 */}
            <div className="space-y-2">
                <label htmlFor="hair-style" className="text-sm font-bold text-slate-700">
                    髪型
                </label>
                <input
                    id="hair-style"
                    type="text"
                    value={hairValue}
                    onChange={(e) => onHairChange(e.target.value)}
                    className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="例：明るめブラウン可、インナーカラー可"
                />
            </div>
        </div>
    );
}
