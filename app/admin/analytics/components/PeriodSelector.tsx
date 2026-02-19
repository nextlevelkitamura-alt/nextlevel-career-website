"use client";

import type { Period } from "../actions";
import { Loader2 } from "lucide-react";

const periods: { value: Period; label: string }[] = [
  { value: "7d", label: "7日" },
  { value: "30d", label: "30日" },
  { value: "90d", label: "90日" },
  { value: "all", label: "全期間" },
];

interface Props {
  value: Period;
  onChange: (period: Period) => void;
  isPending: boolean;
}

export default function PeriodSelector({ value, onChange, isPending }: Props) {
  return (
    <div className="flex items-center gap-2">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          disabled={isPending}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            value === p.value
              ? "bg-primary-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          {p.label}
        </button>
      ))}
      {isPending && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
    </div>
  );
}
