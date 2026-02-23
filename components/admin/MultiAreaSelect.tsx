"use client";

import { useState } from "react";
import { Plus, X, AlertCircle } from "lucide-react";
import AreaSelect from "./AreaSelect";

interface MultiAreaSelectProps {
    values: string[];
    onChange: (values: string[]) => void;
}

export default function MultiAreaSelect({ values, onChange }: MultiAreaSelectProps) {
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

    const handleAdd = () => {
        onChange([...values, ""]);
    };

    const handleRemove = (index: number) => {
        setDuplicateIndex(null);
        const updated = values.filter((_, i) => i !== index);
        onChange(updated.length === 0 ? [""] : updated);
    };

    return (
        <div className="space-y-2">
            {values.map((value, index) => (
                <div key={index} className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <AreaSelect value={value} onChange={(v) => handleAreaChange(index, v)} />
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
