"use client";

import { ATTIRE_TYPES, HAIR_STYLES } from "./data";
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
                <Select value={hairValue} onValueChange={onHairChange}>
                    <SelectTrigger className="bg-white" id="hair-style">
                        <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                        {HAIR_STYLES.map((style) => (
                            <SelectItem key={style} value={style}>
                                {style}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
