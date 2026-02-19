"use client";

import { Plus, X } from "lucide-react";
import AreaSelect from "./AreaSelect";

interface MultiAreaSelectProps {
    values: string[];
    onChange: (values: string[]) => void;
}

export default function MultiAreaSelect({ values, onChange }: MultiAreaSelectProps) {
    const handleAreaChange = (index: number, newValue: string) => {
        const updated = [...values];
        updated[index] = newValue;
        onChange(updated);
    };

    const handleAdd = () => {
        onChange([...values, ""]);
    };

    const handleRemove = (index: number) => {
        const updated = values.filter((_, i) => i !== index);
        onChange(updated.length === 0 ? [""] : updated);
    };

    return (
        <div className="space-y-2">
            {values.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                        <AreaSelect value={value} onChange={(v) => handleAreaChange(index, v)} />
                    </div>
                    {index === 0 && values.length > 1 && (
                        <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">メイン</span>
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
