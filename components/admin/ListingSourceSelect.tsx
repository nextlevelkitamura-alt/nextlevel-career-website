"use client";

import { useState, useEffect } from "react";
import { getClients } from "@/app/admin/actions";

interface Client {
    id: string;
    name: string;
    default_benefits?: string[];
}

interface ListingSourceSelectProps {
    value: string;
    onChange: (name: string) => void;
    onSourceSelected?: (defaultBenefits: string[]) => void;
}

export default function ListingSourceSelect({ value, onChange, onSourceSelected }: ListingSourceSelectProps) {
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        getClients().then(setClients).catch(console.error);
    }, []);

    const handleChange = (newValue: string) => {
        onChange(newValue);
        const matched = clients.find(c => c.name === newValue);
        if (matched && matched.default_benefits && matched.default_benefits.length > 0 && onSourceSelected) {
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
            {clients.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
            ))}
        </select>
    );
}
