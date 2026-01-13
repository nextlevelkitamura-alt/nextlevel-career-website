"use client";

import { useState } from "react";
import { PREFECTURES, TOKYO_WARDS } from "./data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface AreaSelectProps {
    value: string;
    onChange: (value: string) => void;
}

// Parse area value into prefecture and city
function parseAreaValue(value: string): { pref: string; city: string } {
    if (!value) return { pref: "", city: "" };

    const matchedPref = PREFECTURES.find(p => value.startsWith(p));
    if (matchedPref) {
        return {
            pref: matchedPref,
            city: value.replace(matchedPref, "")
        };
    }
    return { pref: "", city: value };
}

export default function AreaSelect({ value, onChange }: AreaSelectProps) {
    // Parse initial value synchronously at component creation
    const initialParsed = parseAreaValue(value);
    const [pref, setPref] = useState(initialParsed.pref);
    const [city, setCity] = useState(initialParsed.city);

    const handlePrefChange = (newPref: string) => {
        setPref(newPref);
        setCity(""); // Reset city when pref changes
        onChange(newPref);
    };

    const handleCityChange = (newCity: string) => {
        setCity(newCity);
        onChange(`${pref}${newCity}`);
    };

    return (
        <div className="flex gap-2 items-center">
            <div className="w-[140px]">
                <Select value={pref} onValueChange={handlePrefChange}>
                    <SelectTrigger className="bg-white">
                        <SelectValue placeholder="都道府県" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {PREFECTURES.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {pref === "東京都" ? (
                <div className="w-[160px]">
                    <Select value={city} onValueChange={handleCityChange}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="市区町村" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {TOKYO_WARDS.map(w => (
                                <SelectItem key={w} value={w}>{w}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : pref !== "" && (
                <div className="flex-1">
                    <Input
                        value={city}
                        onChange={(e) => handleCityChange(e.target.value)}
                        placeholder="市区町村・詳細"
                        className="bg-white border-slate-300"
                    />
                </div>
            )}
        </div>
    );
}
