"use client";

import { useState, useEffect } from "react";
import { getListingSources } from "@/app/admin/actions/listing-sources";
import type { ListingSource } from "@/app/admin/actions/listing-sources";

interface ListingSourceSelectProps {
    value: string;
    onChange: (name: string) => void;
    onSourceSelected?: (defaultBenefits: string[]) => void;
}

export default function ListingSourceSelect({ value, onChange, onSourceSelected }: ListingSourceSelectProps) {
    const [sources, setSources] = useState<ListingSource[]>([]);

    useEffect(() => {
        getListingSources().then(setSources).catch(console.error);
    }, []);

    const handleChange = (newValue: string) => {
        onChange(newValue);
        const matched = sources.find(s => s.name === newValue);
        if (matched && matched.default_benefits.length > 0 && onSourceSelected) {
            onSourceSelected(matched.default_benefits);
        }
    };

    return (
        <select
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-900"
        >
            <option value="">選択してください</option>
            {sources.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
            ))}
        </select>
    );
}
