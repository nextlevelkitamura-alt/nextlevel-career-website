"use client";

import { useState, useEffect } from "react";
import { PREFECTURES, TOKYO_WARDS } from "./data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AreaSelectProps {
    value: string;
    onChange: (value: string) => void;
}

export default function AreaSelect({ value, onChange }: AreaSelectProps) {
    const [pref, setPref] = useState("");
    const [city, setCity] = useState("");

    // Initialize from value (e.g. "東京都千代田区")
    useEffect(() => {
        if (value) {
            // Find matching prefecture
            const matchedPref = PREFECTURES.find(p => value.startsWith(p));
            if (matchedPref) {
                setPref(matchedPref);
                const remainder = value.replace(matchedPref, "");
                setCity(remainder);
            } else {
                setPref("");
                setCity(value);
            }
        }
    }, [value]);

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

            {pref === "東京都" && (
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
            )}
        </div>
    );
}
