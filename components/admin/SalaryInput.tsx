"use client";

import { useState, useEffect } from "react";
import { SALARY_TYPES, HOURLY_WAGES } from "./data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SalaryInputProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SalaryInput({ value, onChange }: SalaryInputProps) {
    const [type, setType] = useState("時給");
    const [amount, setAmount] = useState("");

    // Try to parse existing value on mount
    useEffect(() => {
        if (value) {
            // Simple heuristic to split "時給 1,600円〜"
            const match = value.match(/^(時給|月給|年俸|日給)\s*(.*)(円〜?)$/);
            if (match) {
                setType(match[1]);
                // Remove "円", "〜", and "," so we get a raw number string
                const cleanAmount = match[2].replace(/[円〜,]/g, "");
                setAmount(cleanAmount);
            }
        }
    }, [value]);

    const updateValue = (newType: string, newAmount: string) => {
        setType(newType);
        setAmount(newAmount);

        let formattedCurnrecy = newAmount;
        // Check if number-like
        if (!isNaN(Number(newAmount)) && newAmount !== "") {
            formattedCurnrecy = Number(newAmount).toLocaleString();
        }

        onChange(`${newType} ${formattedCurnrecy}円〜`);
    };

    const handleTypeChange = (val: string) => {
        updateValue(val, amount);
    };

    const handleAmountChange = (val: string) => {
        updateValue(type, val);
    };

    return (
        <div className="flex gap-2 items-center">
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

            <div className="flex-1 max-w-[200px]">
                {type === "時給" ? (
                    <Select value={amount} onValueChange={handleAmountChange}>
                        <SelectTrigger className="bg-white">
                            {/* Display current value or raw input if not in list */}
                            <SelectValue placeholder="金額を選択" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {HOURLY_WAGES.map(wage => (
                                <SelectItem key={wage} value={wage.toString()}>
                                    {wage.toLocaleString()}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        value={amount}
                        onChange={(e) => updateValue(type, e.target.value)}
                        placeholder="金額を入力"
                        className="bg-white text-slate-900 dark:bg-white dark:text-slate-900 border-slate-300"
                    />
                )}
            </div>

            <span className="text-slate-600 font-bold">円〜</span>
        </div>
    );
}
