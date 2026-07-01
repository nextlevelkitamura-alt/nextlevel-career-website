"use client";

import type { BannerClickDailyPoint, BannerPerformanceRow } from "../actions";
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
  performance: BannerPerformanceRow[] | null;
  daily: BannerClickDailyPoint[] | null;
  selectedBannerId: string | null;
  onSelectBanner: (bannerId: string | null) => void;
  isPending: boolean;
};

function formatDateOnly(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return format(date, "yyyy/M/d", { locale: ja });
}

function formatPublishPeriod(startsAt: string | null, endsAt: string | null) {
  const start = formatDateOnly(startsAt);
  const end = formatDateOnly(endsAt);
  if (!start && !end) return "常時公開";
  return `${start ?? "〜"} 〜 ${end ?? ""}`.trim();
}

export default function BannerPerformancePanel({
  performance,
  daily,
  selectedBannerId,
  onSelectBanner,
  isPending,
}: Props) {
  if (!performance) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        データを読み込んでいます...
      </div>
    );
  }

  const selectedBanner = performance.find((row) => row.bannerId === selectedBannerId) || null;
  const chartTitle = selectedBanner ? `日別クリック：${selectedBanner.title}` : "日別クリック：全バナー合算";

  return (
    <div className={`space-y-6 transition-opacity ${isPending ? "opacity-60" : ""}`}>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-900">バナー別成績</h3>
          {selectedBannerId && (
            <button
              type="button"
              onClick={() => onSelectBanner(null)}
              className="text-xs font-medium text-primary-600 hover:underline"
            >
              選択を解除
            </button>
          )}
        </div>

        {performance.length === 0 ? (
          <div className="py-12 text-center text-slate-400">バナーが登録されていません</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-2 py-3 text-left font-medium text-slate-500">バナー名</th>
                  <th className="px-2 py-3 text-left font-medium text-slate-500">公開期間</th>
                  <th className="px-2 py-3 text-left font-medium text-slate-500">状態</th>
                  <th className="px-2 py-3 text-right font-medium text-slate-500">クリック数</th>
                  <th className="px-2 py-3 text-right font-medium text-slate-500">構成比</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((row) => {
                  const isSelected = row.bannerId === selectedBannerId;
                  return (
                    <tr
                      key={row.bannerId}
                      onClick={() => onSelectBanner(isSelected ? null : row.bannerId)}
                      className={`cursor-pointer border-b border-slate-100 transition-colors ${
                        isSelected ? "bg-primary-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="px-2 py-3 font-semibold text-slate-900">{row.title}</td>
                      <td className="whitespace-nowrap px-2 py-3 text-slate-500">
                        {formatPublishPeriod(row.startsAt, row.endsAt)}
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            row.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {row.isActive ? "公開中" : "非公開"}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-right font-semibold text-cyan-700">
                        {row.clicks.toLocaleString()}
                      </td>
                      <td className="px-2 py-3 text-right font-semibold text-slate-700">
                        {row.clickShare.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-900">{chartTitle}</h3>
        {!daily || daily.length === 0 ? (
          <div className="flex h-[240px] items-center justify-center text-slate-400">
            クリックデータがありません
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickFormatter={(value) => format(parseISO(value), "M/d", { locale: ja })}
              />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
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
                type="monotone"
                dataKey="clicks"
                name="クリック数"
                stroke="#0891b2"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
