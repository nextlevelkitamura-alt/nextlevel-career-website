"use client";

import { useState, useMemo } from "react";
import { SALARY_TYPES, HOURLY_WAGES } from "./data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface SalaryInputProps {
    value: string;
    onChange: (value: string) => void;
}

// Parse salary value into type and amount
function parseSalaryValue(value: string): { type: string; amount: string } {
    if (!value) return { type: "時給", amount: "" };

    // Flexible matching:
    // Group 1: Type (時給 etc)
    // Group 2: Amount (numbers, commas, maybe spaces)
    const match = value.match(/^(時給|月給|年俸|日給)\s*([0-9,]+)/);
    if (match) {
        // Remove commas for internal state
        const cleanAmount = match[2].replace(/,/g, "");
        return { type: match[1], amount: cleanAmount };
    }

    // Fallback for custom formats
    const knownType = SALARY_TYPES.find(t => value.startsWith(t));
    if (knownType) {
        const remainder = value.replace(knownType, "").replace(/[円〜,]/g, "").trim();
        return { type: knownType, amount: remainder };
    }

    return { type: "時給", amount: "" };
}

export default function SalaryInput({ value, onChange }: SalaryInputProps) {
    // Parse initial value synchronously at component creation
    const initialParsed = parseSalaryValue(value);
    const [type, setType] = useState(initialParsed.type);
    const [amount, setAmount] = useState(initialParsed.amount);

    const updateValue = (newType: string, newAmount: string) => {
        setType(newType);
        setAmount(newAmount);

        let formattedCurrency = newAmount;
        // Check if number-like
        if (!isNaN(Number(newAmount)) && newAmount !== "") {
            formattedCurrency = Number(newAmount).toLocaleString();
        }

        onChange(`${newType} ${formattedCurrency}円〜`);
    };

    const handleTypeChange = (val: string) => {
        updateValue(val, amount);
    };

    const handleAmountChange = (val: string) => {
        updateValue(type, val);
    };

    // Prepare display options for Hourly Wage
    // If the current 'amount' is valid and not in the standard list, add it temporarily so it shows up
    const hourlyOptions = useMemo(() => {
        const options = [...HOURLY_WAGES];
        const numericAmount = parseInt(amount, 10);
        if (amount && !isNaN(numericAmount) && !options.includes(numericAmount)) {
            return [numericAmount, ...options].sort((a, b) => a - b);
        }
        return options;
    }, [amount]);

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
                            <SelectValue placeholder="金額を選択" />
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
