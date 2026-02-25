"use client";

import type { EmploymentSegment, Period } from "../actions";
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
  segment: EmploymentSegment;
  onSegmentChange: (segment: EmploymentSegment) => void;
  isPending: boolean;
}

const segments: { value: EmploymentSegment; label: string }[] = [
  { value: "all", label: "全体" },
  { value: "fulltime", label: "正社員" },
  { value: "dispatch", label: "派遣" },
];

export default function PeriodSelector({
  value,
  onChange,
  segment,
  onSegmentChange,
  isPending,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        {segments.map((s) => (
          <button
            key={s.value}
            onClick={() => onSegmentChange(s.value)}
            disabled={isPending}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              segment === s.value
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
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
    </div>
  );
}
