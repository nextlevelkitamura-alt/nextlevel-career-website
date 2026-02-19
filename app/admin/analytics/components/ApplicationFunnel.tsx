"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface StatusBreakdown {
  pending: number;
  reviewed: number;
  interview: number;
  hired: number;
  rejected: number;
}

interface Props {
  data: StatusBreakdown;
  isPending: boolean;
}

const statusConfig = [
  { key: "pending", label: "選考中", color: "#94a3b8" },
  { key: "reviewed", label: "確認済", color: "#3b82f6" },
  { key: "interview", label: "面接", color: "#f59e0b" },
  { key: "hired", label: "採用", color: "#22c55e" },
  { key: "rejected", label: "不採用", color: "#ef4444" },
] as const;

export default function ApplicationFunnel({ data, isPending }: Props) {
  const chartData = statusConfig.map((s) => ({
    name: s.label,
    value: data[s.key],
    color: s.color,
  }));

  const total = Object.values(data).reduce((sum, v) => sum + v, 0);

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 transition-opacity ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <h3 className="text-base font-semibold text-slate-900 mb-4">
        応募ステータス
      </h3>
      {total === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-slate-400">
          データがありません
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: "#64748b" }}
              width={60}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            />
            <Bar dataKey="value" name="件数" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
