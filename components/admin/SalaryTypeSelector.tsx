"use client";

import { SALARY_TYPE_OPTIONS } from "./data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SalaryTypeSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SalaryTypeSelector({ value, onChange }: SalaryTypeSelectorProps) {
    return (
        <div className="w-[150px]">
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="bg-white">
                    <SelectValue placeholder="選択" />
                </SelectTrigger>
                <SelectContent>
                    {SALARY_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
