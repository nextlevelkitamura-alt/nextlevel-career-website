"use client";

import { useState, useEffect } from "react";
import { PREFECTURES, TOKYO_WARDS, KANAGAWA_CITIES, SAITAMA_CITIES, CHIBA_CITIES, OSAKA_CITIES } from "./data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface AreaSelectProps {
    value: string;
    onChange: (value: string) => void;
}

// Get city options based on prefecture
function getCityOptions(pref: string): string[] {
    switch (pref) {
        case "東京都":
            return TOKYO_WARDS;
        case "神奈川県":
            return KANAGAWA_CITIES;
        case "埼玉県":
            return SAITAMA_CITIES;
        case "千葉県":
            return CHIBA_CITIES;
        case "大阪府":
            return OSAKA_CITIES;
        default:
            return [];
    }
}

// Parse area value into prefecture and city
function parseAreaValue(value: string): { pref: string; city: string } {
    if (!value) return { pref: "", city: "" };

    const matchedPref = PREFECTURES.find(p => value.startsWith(p));
    if (matchedPref) {
        return {
            pref: matchedPref,
            city: value.replace(matchedPref, "").trim()
        };
    }
    return { pref: "", city: value };
}

export default function AreaSelect({ value, onChange }: AreaSelectProps) {
    // Parse initial value synchronously at component creation
    const initialParsed = parseAreaValue(value);
    const [pref, setPref] = useState(initialParsed.pref);
    const [city, setCity] = useState(initialParsed.city);

    // Update when value prop changes (e.g., from AI extraction)
    useEffect(() => {
        const parsed = parseAreaValue(value);
        setPref(parsed.pref);
        setCity(parsed.city);
    }, [value]);

    const handlePrefChange = (newPref: string) => {
        setPref(newPref);
        setCity(""); // Reset city when pref changes
        onChange(newPref);
    };

    const handleCityChange = (newCity: string) => {
        setCity(newCity);
        onChange(`${pref} ${newCity}`.trim());
    };

    const cityOptions = getCityOptions(pref);
    const hasCityDropdown = cityOptions.length > 0;

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

            {hasCityDropdown ? (
                <div className="w-[180px]">
                    <Select value={city} onValueChange={handleCityChange}>
                        <SelectTrigger className="bg-white">
                            <SelectValue placeholder="市区町村" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {cityOptions.map(w => (
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
