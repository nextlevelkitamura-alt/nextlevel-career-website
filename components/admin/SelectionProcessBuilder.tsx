"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import { SELECTION_STEPS } from "./data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectionProcessBuilderProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SelectionProcessBuilder({ value, onChange }: SelectionProcessBuilderProps) {
    const [steps, setSteps] = useState<string[]>([]);

    useEffect(() => {
        if (value) {
            // Try to parse existing string "A → B → C"
            const parts = value.split(" → ").map(s => s.trim()).filter(Boolean);
            if (parts.length > 0) {
                setSteps(parts);
            }
        }
    }, [value]); // Run once on mount if value exists, but be careful not to overwrite if user is editing

    const updateValue = (newSteps: string[]) => {
        setSteps(newSteps);
        onChange(newSteps.join(" → "));
    };

    const addStep = (step: string) => {
        if (steps.length >= 5) return; // Limit to reasonable number
        const newSteps = [...steps, step];
        updateValue(newSteps);
    };

    const removeStep = (index: number) => {
        const newSteps = steps.filter((_, i) => i !== index);
        updateValue(newSteps);
    };

    const clearSteps = () => {
        updateValue([]);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg min-h-[60px]">
                {steps.length === 0 && (
                    <span className="text-slate-400 text-sm">ステップを追加してください</span>
                )}
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center">
                        <div className="flex items-center bg-white border border-slate-300 rounded px-2 py-1 shadow-sm">
                            <span className="text-sm font-medium text-slate-700 mr-2">{step}</span>
                            <button
                                type="button"
                                onClick={() => removeStep(index)}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                        {index < steps.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-slate-400 mx-1" />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex gap-2 items-center">
                <Select onValueChange={addStep}>
                    <SelectTrigger className="w-[180px] bg-white">
                        <SelectValue placeholder="ステップを選択" />
                    </SelectTrigger>
                    <SelectContent>
                        {SELECTION_STEPS.map((step) => (
                            <SelectItem key={step} value={step}>
                                {step}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {steps.length > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={clearSteps} className="text-slate-500">
                        リセット
                    </Button>
                )}
            </div>

            <input type="hidden" name="selection_process" value={value} />
        </div>
    );
}
