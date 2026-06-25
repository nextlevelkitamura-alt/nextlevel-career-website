"use client";

import type { ConsultJobsBannerAnalytics } from "../actions";
import { Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: ConsultJobsBannerAnalytics | null;
  isPending: boolean;
};

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ja-JP");
}

export default function BannerAnalyticsPanel({ data, isPending }: Props) {
  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        データを読み込んでいます...
      </div>
    );
  }

  return (
    <div className={`space-y-6 transition-opacity ${isPending ? "opacity-60" : ""}`}>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-900">日別推移</h3>
        {data.daily.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-slate-400">
            データがありません
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickFormatter={(value) => format(parseISO(value), "M/d", { locale: ja })}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: "#64748b" }}
                allowDecimals={false}
              />
              <Tooltip
                labelFormatter={(value) => format(parseISO(value as string), "yyyy/M/d (E)", { locale: ja })}
                formatter={(value, name) => [
                  typeof value === "number" ? value.toLocaleString() : value,
                  name,
                ]}
                contentStyle={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="views"
                name="相談LP閲覧"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="appTransitionClicks"
                name="アプリ遷移CL"
                stroke="#0891b2"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="uniqueClickers"
                name="クリック人数"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-900">ルート別集計</h3>
        {data.routeBreakdown.length === 0 ? (
          <div className="py-12 text-center text-slate-400">データがありません</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-2 py-3 text-left font-medium text-slate-500">ルート</th>
                  <th className="px-2 py-3 text-right font-medium text-slate-500">アプリ遷移CL</th>
                  <th className="px-2 py-3 text-right font-medium text-slate-500">クリック人数</th>
                  <th className="px-2 py-3 text-right font-medium text-slate-500">構成比</th>
                  <th className="px-2 py-3 text-left font-medium text-slate-500">最新クリック</th>
                </tr>
              </thead>
              <tbody>
                {data.routeBreakdown.map((route) => (
                  <tr key={route.routeSlug} className="border-b border-slate-100">
                    <td className="px-2 py-3">
                      <div className="font-semibold text-slate-900">{route.routeLabel}</div>
                      <div className="text-xs text-slate-400">{route.routeSlug}</div>
                    </td>
                    <td className="px-2 py-3 text-right font-semibold text-cyan-700">
                      {route.appTransitionClicks.toLocaleString()}
                    </td>
                    <td className="px-2 py-3 text-right font-semibold text-violet-700">
                      {route.uniqueClickers.toLocaleString()}
                    </td>
                    <td className="px-2 py-3 text-right font-semibold text-slate-700">
                      {route.clickShare.toFixed(1)}%
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-slate-500">
                      {formatDateTime(route.latestClickAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
