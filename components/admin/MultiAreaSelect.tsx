"use client";

import { useState } from "react";
import { Plus, X, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import AreaSelect from "./AreaSelect";

interface MultiAreaSelectProps {
    values: string[];
    stations?: string[];
    onChange: (values: string[]) => void;
    onStationsChange?: (stations: string[]) => void;
}

export default function MultiAreaSelect({ values, stations = [], onChange, onStationsChange }: MultiAreaSelectProps) {
    const [duplicateIndex, setDuplicateIndex] = useState<number | null>(null);

    const handleAreaChange = (index: number, newValue: string) => {
        // 空文字は許可（選択途中の状態）
        if (newValue && values.some((v, i) => i !== index && v === newValue)) {
            setDuplicateIndex(index);
            setTimeout(() => setDuplicateIndex(null), 3000);
            return;
        }
        setDuplicateIndex(null);
        const updated = [...values];
        updated[index] = newValue;
        onChange(updated);
    };

    const handleStationChange = (index: number, newStation: string) => {
        const updated = [...stations];
        // 配列の長さを合わせる
        while (updated.length <= index) updated.push("");
        updated[index] = newStation;
        onStationsChange?.(updated);
    };

    const handleAdd = () => {
        onChange([...values, ""]);
        onStationsChange?.([...stations, ""]);
    };

    const handleRemove = (index: number) => {
        setDuplicateIndex(null);
        const updated = values.filter((_, i) => i !== index);
        onChange(updated.length === 0 ? [""] : updated);
        const updatedStations = stations.filter((_, i) => i !== index);
        onStationsChange?.(updatedStations.length === 0 ? [""] : updatedStations);
    };

    return (
        <div className="space-y-2">
            {values.map((value, index) => (
                <div key={index} className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <AreaSelect value={value} onChange={(v) => handleAreaChange(index, v)} />
                        </div>
                        <div className="w-[160px] flex-shrink-0">
                            <Input
                                value={stations[index] || ""}
                                onChange={(e) => handleStationChange(index, e.target.value)}
                                placeholder="最寄り駅（任意）"
                                className="bg-white border-slate-300 text-sm"
                            />
                        </div>
                        {index === 0 && values.length > 1 && (
                            <span className="w-7 flex-shrink-0" />
                        )}
                        {index > 0 && (
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="この勤務地を削除"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    {duplicateIndex === index && (
                        <p className="flex items-center gap-1 text-xs text-red-500 pl-1">
                            <AlertCircle className="w-3 h-3" />
                            この勤務地は既に追加されています
                        </p>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={handleAdd}
                className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium py-1.5 px-3 rounded-lg hover:bg-primary-50 transition-colors"
            >
                <Plus className="w-3.5 h-3.5" />
                勤務地を追加
            </button>
        </div>
    );
}
