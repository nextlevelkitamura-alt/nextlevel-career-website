"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

interface DataPoint {
  date: string;
  views: number;
  applications: number;
  applyClicks: number;
  consultClicks: number;
}

interface Props {
  data: DataPoint[];
  isPending: boolean;
}

export default function ViewsChart({ data, isPending }: Props) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 transition-opacity ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <h3 className="text-base font-semibold text-slate-900 mb-4">
        閲覧数・クリック数推移
      </h3>
      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-slate-400">
          データがありません
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickFormatter={(value) =>
                format(parseISO(value), "M/d", { locale: ja })
              }
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: "#64748b" }}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: "#64748b" }}
              allowDecimals={false}
            />
            <Tooltip
              labelFormatter={(value) =>
                format(parseISO(value as string), "yyyy/M/d (E)", {
                  locale: ja,
                })
              }
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="views"
              name="閲覧数"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="applications"
              name="応募数"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="applyClicks"
              name="応募クリック"
              stroke="#e11d48"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="consultClicks"
              name="相談クリック"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
