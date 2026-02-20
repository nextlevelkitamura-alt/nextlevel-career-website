"use client";

import { Badge } from "@/components/ui/badge";

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

export default function JobRankingTable({ data, isPending }: Props) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-5 transition-opacity ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <h3 className="text-base font-semibold text-slate-900 mb-4">
        求人別パフォーマンス
      </h3>
      {data.length === 0 ? (
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
                <th className="text-right py-3 px-2 text-slate-500 font-medium">
                  閲覧
                </th>
                <th className="text-right py-3 px-2 text-slate-500 font-medium">
                  応募CL
                </th>
                <th className="text-right py-3 px-2 text-slate-500 font-medium">
                  相談CL
                </th>
                <th className="text-right py-3 px-2 text-slate-500 font-medium">
                  応募
                </th>
                <th className="text-right py-3 px-2 text-slate-500 font-medium">
                  CVR
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((job, index) => (
                <tr
                  key={job.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 px-2 text-slate-400 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-slate-900 font-medium line-clamp-1">
                      {job.title}
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
