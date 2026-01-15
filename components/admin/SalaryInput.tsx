"use client";

import { useState, useMemo, useEffect } from "react";
import { SALARY_TYPES, HOURLY_WAGES } from "./data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SalaryInputProps {
    value: string;
    onChange: (value: string) => void;
}

// Parse salary value into type, min amount, and max amount
function parseSalaryValue(value: string): { type: string; minAmount: string; maxAmount: string } {
    if (!value) return { type: "時給", minAmount: "", maxAmount: "" };

    // Match patterns like "年俸 500〜600万円" or "月給 30〜40万円"
    const manMatch = value.match(/^(月給|年俸)\s*([0-9,]+)\s*[〜~\-]\s*([0-9,]*)万/);
    if (manMatch) {
        const cleanMin = manMatch[2].replace(/,/g, "");
        const cleanMax = manMatch[3] ? manMatch[3].replace(/,/g, "") : "";
        return { type: manMatch[1], minAmount: cleanMin, maxAmount: cleanMax };
    }

    // Match single value like "年俸 500万円〜"
    const singleManMatch = value.match(/^(月給|年俸)\s*([0-9,]+)万/);
    if (singleManMatch) {
        const cleanAmount = singleManMatch[2].replace(/,/g, "");
        return { type: singleManMatch[1], minAmount: cleanAmount, maxAmount: "" };
    }

    // Match patterns like "時給 1,550〜1,600円"
    const rangeMatch = value.match(/^(時給|月給|年俸|日給)\s*([0-9,]+)\s*[〜~\-]\s*([0-9,]*)/);
    if (rangeMatch) {
        const cleanMin = rangeMatch[2].replace(/,/g, "");
        const cleanMax = rangeMatch[3] ? rangeMatch[3].replace(/,/g, "") : "";
        return { type: rangeMatch[1], minAmount: cleanMin, maxAmount: cleanMax };
    }

    // Match single value like "時給 1,550円〜"
    const singleMatch = value.match(/^(時給|月給|年俸|日給)\s*([0-9,]+)/);
    if (singleMatch) {
        const cleanAmount = singleMatch[2].replace(/,/g, "");
        return { type: singleMatch[1], minAmount: cleanAmount, maxAmount: "" };
    }

    // Fallback for custom formats
    const knownType = SALARY_TYPES.find(t => value.startsWith(t));
    if (knownType) {
        const remainder = value.replace(knownType, "").replace(/[円万〜~,]/g, "").trim();
        const parts = remainder.split(/[〜~\-]/);
        return {
            type: knownType,
            minAmount: parts[0] || "",
            maxAmount: parts[1] || ""
        };
    }

    return { type: "時給", minAmount: "", maxAmount: "" };
}

// Check if type uses 万 (10,000) units
function usesManUnit(type: string): boolean {
    return type === "月給" || type === "年俸";
}

export default function SalaryInput({ value, onChange }: SalaryInputProps) {
    // Parse initial value synchronously at component creation
    const initialParsed = parseSalaryValue(value);
    const [type, setType] = useState(initialParsed.type);
    const [minAmount, setMinAmount] = useState(initialParsed.minAmount);
    const [maxAmount, setMaxAmount] = useState(initialParsed.maxAmount);

    // Update when value prop changes (e.g., from AI extraction)
    useEffect(() => {
        const parsed = parseSalaryValue(value);
        setType(parsed.type);
        setMinAmount(parsed.minAmount);
        setMaxAmount(parsed.maxAmount);
    }, [value]);

    const updateValue = (newType: string, newMin: string, newMax: string) => {
        setType(newType);
        setMinAmount(newMin);
        setMaxAmount(newMax);

        const formatNum = (num: string) => {
            if (!isNaN(Number(num)) && num !== "") {
                return Number(num).toLocaleString();
            }
            return num;
        };

        const isMan = usesManUnit(newType);
        const unit = isMan ? "万円" : "円";

        // Format output: "年俸 500〜600万円" or "時給 1,550〜1,600円"
        if (newMax && newMax !== newMin) {
            onChange(`${newType} ${formatNum(newMin)}〜${formatNum(newMax)}${unit}`);
        } else if (newMin) {
            onChange(`${newType} ${formatNum(newMin)}${unit}〜`);
        } else {
            onChange("");
        }
    };

    const handleTypeChange = (val: string) => {
        // Reset amounts when switching between 万 and regular units
        const wasMan = usesManUnit(type);
        const nowMan = usesManUnit(val);
        if (wasMan !== nowMan) {
            updateValue(val, "", "");
        } else {
            updateValue(val, minAmount, maxAmount);
        }
    };

    const handleMinAmountChange = (val: string) => {
        updateValue(type, val, maxAmount);
    };

    const handleMaxAmountChange = (val: string) => {
        updateValue(type, minAmount, val);
    };

    // Prepare display options for Hourly Wage
    const hourlyOptions = useMemo(() => {
        const options = [...HOURLY_WAGES];
        const numericMin = parseInt(minAmount, 10);
        const numericMax = parseInt(maxAmount, 10);

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

    const isMan = usesManUnit(type);

    return (
        <div className="flex gap-2 items-center flex-wrap">
            <div className="w-[100px]">
                <Select value={type} onValueChange={handleTypeChange}>
                    <SelectTrigger className="bg-white">
                        <SelectValue placeholder="種別" />
                    </SelectTrigger>
                    <SelectContent>
                        {SALARY_TYPES.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Min Amount (下限) */}
            <div className="flex-1 min-w-[100px] max-w-[150px]">
                {type === "時給" ? (
                    <Select value={minAmount} onValueChange={handleMinAmountChange}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="下限" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {hourlyOptions.map(wage => (
                                <SelectItem key={wage} value={wage.toString()}>
                                    {wage.toLocaleString()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        value={minAmount}
                        onChange={(e) => updateValue(type, e.target.value, maxAmount)}
                        placeholder={isMan ? "下限（万）" : "下限"}
                        className="bg-white text-slate-900 dark:bg-white dark:text-slate-900 border-slate-300"
                    />
                )}
            </div>

            <span className="text-slate-600 font-bold">〜</span>

            {/* Max Amount (上限) */}
            <div className="flex-1 min-w-[100px] max-w-[150px]">
                {type === "時給" ? (
                    <Select value={maxAmount || "none"} onValueChange={(val) => handleMaxAmountChange(val === "none" ? "" : val)}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="上限（任意）" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            <SelectItem value="none">なし</SelectItem>
                            {hourlyOptions.map(wage => (
                                <SelectItem key={wage} value={wage.toString()}>
                                    {wage.toLocaleString()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        value={maxAmount}
                        onChange={(e) => updateValue(type, minAmount, e.target.value)}
                        placeholder={isMan ? "上限（万）" : "上限（任意）"}
                        className="bg-white text-slate-900 dark:bg-white dark:text-slate-900 border-slate-300"
                    />
                )}
            </div>

            <span className="text-slate-600 font-bold text-sm">{isMan ? "万円" : "円"}</span>
        </div>
    );
}
