"use client";

import { useState, useEffect } from "react";
import { MONTHLY_SALARY_OPTIONS } from "./data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface MonthlySalarySelectorProps {
    value: string;
    onChange: (value: string) => void;
}

// Parse salary value (e.g., "月給 30万円〜" => { min: "30", max: "" })
function parseSalaryValue(value: string): { min: string; max: string } {
    if (!value) return { min: "", max: "" };

    // Match patterns like "月給 30〜40万円" or "月給 30万円〜"
    const rangeMatch = value.match(/月給\s*([0-9,]+)\s*[〜~\-]\s*([0-9,]*)万/);
    if (rangeMatch) {
        const cleanMin = rangeMatch[1].replace(/,/g, "");
        const cleanMax = rangeMatch[2] ? rangeMatch[2].replace(/,/g, "") : "";
        return { min: cleanMin, max: cleanMax };
    }

    const singleMatch = value.match(/月給\s*([0-9,]+)万/);
    if (singleMatch) {
        return { min: singleMatch[1].replace(/,/g, ""), max: "" };
    }

    return { min: "", max: "" };
}

export default function MonthlySalarySelector({ value, onChange }: MonthlySalarySelectorProps) {
    const initialParsed = parseSalaryValue(value);
    const [minAmount, setMinAmount] = useState(initialParsed.min);
    const [maxAmount, setMaxAmount] = useState(initialParsed.max);
    const [useCustomMin, setUseCustomMin] = useState(false);
    const [useCustomMax, setUseCustomMax] = useState(false);

    useEffect(() => {
        const parsed = parseSalaryValue(value);
        setMinAmount(parsed.min);
        setMaxAmount(parsed.max);
        setUseCustomMin(!!(parsed.min && !MONTHLY_SALARY_OPTIONS.includes(Number(parsed.min))));
        setUseCustomMax(!!(parsed.max && !MONTHLY_SALARY_OPTIONS.includes(Number(parsed.max))));
    }, [value]);

    const updateValue = (newMin: string, newMax: string) => {
        setMinAmount(newMin);
        setMaxAmount(newMax);

        if (newMax && newMax !== newMin) {
            onChange(`月給 ${Number(newMin).toLocaleString()}〜${Number(newMax).toLocaleString()}万円`);
        } else if (newMin) {
            onChange(`月給 ${Number(newMin).toLocaleString()}万円〜`);
        } else {
            onChange("");
        }
    };

    const handleMinChange = (val: string) => {
        const numVal = Number(val);
        setUseCustomMin(!MONTHLY_SALARY_OPTIONS.includes(numVal));
        updateValue(val, maxAmount);
    };

    const handleMaxChange = (val: string) => {
        const numVal = Number(val);
        setUseCustomMax(!MONTHLY_SALARY_OPTIONS.includes(numVal));
        updateValue(minAmount, val);
    };

    return (
        <div className="flex gap-2 items-center flex-wrap">
            {/* Min Amount */}
            <div className="flex-1 min-w-[100px] max-w-[150px]">
                {useCustomMin ? (
                    <Input
                        type="number"
                        value={minAmount}
                        onChange={(e) => updateValue(e.target.value, maxAmount)}
                        placeholder="下限（万）"
                        className="bg-white text-slate-900 dark:bg-white dark:text-slate-900 border-slate-300"
                    />
                ) : (
                    <Select value={minAmount} onValueChange={handleMinChange}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="下限" />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHLY_SALARY_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option.toString()}>
                                    {option}万円
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <span className="text-slate-600 font-bold">〜</span>

            {/* Max Amount */}
            <div className="flex-1 min-w-[100px] max-w-[150px]">
                {useCustomMax ? (
                    <Input
                        type="number"
                        value={maxAmount}
                        onChange={(e) => updateValue(minAmount, e.target.value)}
                        placeholder="上限（万）"
                        className="bg-white text-slate-900 dark:bg-white dark:text-slate-900 border-slate-300"
                    />
                ) : (
                    <Select value={maxAmount || "none"} onValueChange={(val) => handleMaxChange(val === "none" ? "" : val)}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="上限（任意）" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">なし</SelectItem>
                            {MONTHLY_SALARY_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option.toString()}>
                                    {option}万円
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <span className="text-slate-600 font-bold text-sm">万円</span>
        </div>
    );
}
