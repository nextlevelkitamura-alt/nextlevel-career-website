"use client";

import { useState, useEffect, useMemo } from "react";
import { HOURLY_WAGES } from "./data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface HourlyWageInputProps {
    value: string;
    onChange: (value: string) => void;
}

// Parse hourly wage value (e.g., "時給 1,550円〜" => { min: "1550", max: "" })
function parseWageValue(value: string): { min: string; max: string } {
    if (!value) return { min: "", max: "" };

    // Match patterns like "時給 1,550〜1,600円" or "時給 1550~1600円"
    const rangeMatch = value.match(/時給\s*([0-9,]+)\s*[〜~\-]\s*([0-9,]*)円/);
    if (rangeMatch) {
        const cleanMin = rangeMatch[1].replace(/,/g, "");
        const cleanMax = rangeMatch[2] ? rangeMatch[2].replace(/,/g, "") : "";
        return { min: cleanMin, max: cleanMax };
    }

    const singleMatch = value.match(/時給\s*([0-9,]+)円/);
    if (singleMatch) {
        return { min: singleMatch[1].replace(/,/g, ""), max: "" };
    }

    return { min: "", max: "" };
}

export default function HourlyWageInput({ value, onChange }: HourlyWageInputProps) {
    const initialParsed = parseWageValue(value);
    const [minAmount, setMinAmount] = useState(initialParsed.min);
    const [maxAmount, setMaxAmount] = useState(initialParsed.max);
    const [useCustomMin, setUseCustomMin] = useState(false);
    const [useCustomMax, setUseCustomMax] = useState(false);

    useEffect(() => {
        const parsed = parseWageValue(value);
        setMinAmount(parsed.min);
        setMaxAmount(parsed.max);
        const numericMin = Number(parsed.min);
        const numericMax = Number(parsed.max);
        setUseCustomMin(!!(parsed.min && (!HOURLY_WAGES.includes(numericMin) || isNaN(numericMin))));
        setUseCustomMax(!!(parsed.max && (!HOURLY_WAGES.includes(numericMax) || isNaN(numericMax))));
    }, [value]);

    // Dynamic options including custom values
    const hourlyOptions = useMemo(() => {
        const options = [...HOURLY_WAGES];
        const numericMin = Number(minAmount);
        const numericMax = Number(maxAmount);

        const toAdd: number[] = [];
        if (minAmount && !isNaN(numericMin) && !options.includes(numericMin)) {
            toAdd.push(numericMin);
        }
        if (maxAmount && !isNaN(numericMax) && !options.includes(numericMax)) {
            toAdd.push(numericMax);
        }

        if (toAdd.length > 0) {
            return Array.from(new Set([...toAdd, ...options])).sort((a, b) => a - b);
        }
        return options;
    }, [minAmount, maxAmount]);

    const updateValue = (newMin: string, newMax: string) => {
        setMinAmount(newMin);
        setMaxAmount(newMax);

        const numericMin = Number(newMin);
        const numericMax = Number(newMax);
        setUseCustomMin(!!(newMin && (!HOURLY_WAGES.includes(numericMin) || isNaN(numericMin))));
        setUseCustomMax(!!(newMax && (!HOURLY_WAGES.includes(numericMax) || isNaN(numericMax))));

        if (newMax && newMax !== newMin) {
            onChange(`時給 ${Number(newMin).toLocaleString()}〜${Number(newMax).toLocaleString()}円`);
        } else if (newMin) {
            onChange(`時給 ${Number(newMin).toLocaleString()}円〜`);
        } else {
            onChange("");
        }
    };

    const handleMinChange = (val: string) => {
        updateValue(val, maxAmount);
    };

    const handleMaxChange = (val: string) => {
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
                        placeholder="下限"
                        className="bg-white text-slate-900 dark:bg-white dark:text-slate-900 border-slate-300"
                    />
                ) : (
                    <Select value={minAmount} onValueChange={handleMinChange}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="下限" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {hourlyOptions.map((wage) => (
                                <SelectItem key={wage} value={wage.toString()}>
                                    {wage.toLocaleString()}
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
                        placeholder="上限（任意）"
                        className="bg-white text-slate-900 dark:bg-white dark:text-slate-900 border-slate-300"
                    />
                ) : (
                    <Select value={maxAmount || "none"} onValueChange={(val) => handleMaxChange(val === "none" ? "" : val)}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="上限（任意）" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            <SelectItem value="none">なし</SelectItem>
                            {hourlyOptions.map((wage) => (
                                <SelectItem key={wage} value={wage.toString()}>
                                    {wage.toLocaleString()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <span className="text-slate-600 font-bold text-sm">円</span>
        </div>
    );
}
