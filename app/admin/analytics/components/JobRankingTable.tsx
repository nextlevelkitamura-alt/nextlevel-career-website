"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink } from "lucide-react";

interface JobRanking {
  id: string;
  title: string;
  area: string | null;
  type: string | null;
  category: string | null;
  views: number;
  applications: number;
  cvr: number;
  applyClicks: number;
  consultClicks: number;
}

interface Props {
  data: JobRanking[];
  isPending: boolean;
}

type SortKey = "views" | "applyClicks" | "consultClicks" | "applications" | "cvr" | "totalClicks";
type SortDir = "asc" | "desc";

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
  return dir === "desc"
    ? <ArrowDown className="w-3 h-3 text-slate-700" />
    : <ArrowUp className="w-3 h-3 text-slate-700" />;
}

export default function JobRankingTable({ data, isPending }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("totalClicks");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...data].sort((a, b) => {
    let aVal: number, bVal: number;
    if (sortKey === "totalClicks") {
      aVal = a.applyClicks + a.consultClicks;
      bVal = b.applyClicks + b.consultClicks;
    } else {
      aVal = a[sortKey];
      bVal = b[sortKey];
    }
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  const headers: { key: SortKey; label: string; color?: string }[] = [
    { key: "views", label: "閲覧" },
    { key: "totalClicks", label: "総CL", color: "text-amber-600" },
    { key: "applyClicks", label: "応募CL", color: "text-rose-600" },
    { key: "consultClicks", label: "相談CL", color: "text-teal-600" },
    { key: "applications", label: "応募", color: "text-blue-600" },
    { key: "cvr", label: "CVR", color: "text-purple-600" },
  ];

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 transition-opacity ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <h3 className="text-base font-semibold text-slate-900 mb-4">
        求人別パフォーマンス
      </h3>
      {sorted.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          データがありません
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-2 text-slate-500 font-medium w-10">
                  #
                </th>
                <th className="text-left py-3 px-2 text-slate-500 font-medium">
                  タイトル
                </th>
                <th className="text-left py-3 px-2 text-slate-500 font-medium hidden md:table-cell">
                  エリア
                </th>
                <th className="text-left py-3 px-2 text-slate-500 font-medium hidden md:table-cell">
                  種別
                </th>
                {headers.map((h) => (
                  <th
                    key={h.key}
                    className="text-right py-3 px-2 text-slate-500 font-medium cursor-pointer select-none hover:text-slate-800 transition-colors"
                    onClick={() => toggleSort(h.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {h.label}
                      <SortIcon active={sortKey === h.key} dir={sortDir} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((job, index) => (
                <tr
                  key={job.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => window.open(`/jobs/${job.id}`, "_blank")}
                >
                  <td className="py-3 px-2 text-slate-400 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-slate-900 font-medium line-clamp-1 flex items-center gap-1">
                      {job.title}
                      <ExternalLink className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    </span>
                  </td>
                  <td className="py-3 px-2 text-slate-500 hidden md:table-cell">
                    {job.area || "-"}
                  </td>
                  <td className="py-3 px-2 hidden md:table-cell">
                    {job.type && (
                      <Badge variant="secondary" className="text-xs">
                        {job.type}
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-slate-900">
                    {job.views.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-amber-600">
                    {(job.applyClicks + job.consultClicks).toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-rose-600">
                    {job.applyClicks.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-teal-600">
                    {job.consultClicks.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-blue-600">
                    {job.applications.toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-purple-600">
                    {job.cvr.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
