"use client";

import { useMemo, useState, useTransition } from "react";
import type { LeadManagementData, LeadPeriod, LeadRow } from "./actions";
import { getLeadManagementData, updateConsultationBooking } from "./actions";
import { Loader2, CalendarDays, ExternalLink, User, Search, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  initialData: LeadManagementData;
}

const periods: { value: LeadPeriod; label: string }[] = [
  { value: "7d", label: "7日" },
  { value: "30d", label: "30日" },
  { value: "90d", label: "90日" },
  { value: "all", label: "全期間" },
];

const consultStatuses = [
  { value: "booked", label: "予約済み" },
  { value: "confirmed", label: "確定" },
  { value: "rescheduled", label: "日程変更" },
  { value: "completed", label: "実施済み" },
  { value: "canceled", label: "キャンセル" },
  { value: "no_show", label: "不参加" },
];

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ja-JP");
}

export default function AnalyticsDashboard({ initialData }: Props) {
  const [period, setPeriod] = useState<LeadPeriod>("30d");
  const [data, setData] = useState(initialData);
  const [keyword, setKeyword] = useState("");
  const [accountFilter, setAccountFilter] = useState<"all" | "registered" | "guest">("all");
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  const handlePeriodChange = (next: LeadPeriod) => {
    setPeriod(next);
    startTransition(async () => {
      const nextData = await getLeadManagementData(next);
      setData(nextData);
      setSelectedLead(null);
    });
  };

  const filteredLeads = useMemo(() => {
    return data.leads.filter((lead) => {
      if (accountFilter !== "all" && lead.accountType !== accountFilter) return false;
      if (!keyword.trim()) return true;
      const q = keyword.trim().toLowerCase();
      return [
        lead.displayName,
        lead.email || "",
        lead.phone || "",
        lead.prefecture || "",
        lead.jobTitle || "",
        lead.jobType || "",
      ].some((value) => value.toLowerCase().includes(q));
    });
  }, [data.leads, accountFilter, keyword]);

  const openLead = (lead: LeadRow) => {
    setSelectedLead(lead);
  };

  const updateLocalConsultation = (leadId: string, status: string, meetingUrl: string) => {
    setData((prev) => ({
      ...prev,
      leads: prev.leads.map((lead) => (
        lead.id === leadId
          ? { ...lead, latestConsultationStatus: status, meetingUrl: meetingUrl || null }
          : lead
      )),
      consultations: prev.consultations.map((consult) => (
        selectedLead && consult.id === selectedLead.events.find((event) => event.kind === "consultation")?.id.replace("consultation-", "")
          ? { ...consult, status, meeting_url: meetingUrl || null }
          : consult
      )),
    }));
  };

  const handleSaveConsultation = async (status: string, meetingUrl: string, note: string) => {
    if (!selectedLead) return;
    const consultationEvent = selectedLead.events.find((event) => event.kind === "consultation");
    if (!consultationEvent) return;
    const consultationId = consultationEvent.id.replace("consultation-", "");

    setIsSaving(true);
    const result = await updateConsultationBooking(consultationId, {
      status,
      meetingUrl,
      adminNote: note,
    });
    setIsSaving(false);

    if (result.error) {
      alert(`更新に失敗しました: ${result.error}`);
      return;
    }

    updateLocalConsultation(selectedLead.id, status, meetingUrl);
    setSelectedLead({
      ...selectedLead,
      latestConsultationStatus: status,
      meetingUrl: meetingUrl || null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {periods.map((item) => (
            <button
              key={item.value}
              onClick={() => handlePeriodChange(item.value)}
              disabled={isPending}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === item.value
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
          {isPending && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <MetricCard label="応募クリック" value={data.summary.applyClicks} color="text-rose-700" />
          <MetricCard label="相談クリック" value={data.summary.consultClicks} color="text-teal-700" />
          <MetricCard label="応募数" value={data.summary.applications} color="text-blue-700" />
          <MetricCard label="予約成立" value={data.summary.bookedConsultations} color="text-emerald-700" />
          <MetricCard label="相談実施" value={data.summary.completedConsultations} color="text-indigo-700" />
          <MetricCard label="応募→予約率" value={`${data.summary.applyToBookedRate}%`} color="text-purple-700" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="氏名・メール・求人名で検索"
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={accountFilter}
              onChange={(event) => setAccountFilter(event.target.value as "all" | "registered" | "guest")}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              <option value="all">全アカウント</option>
              <option value="registered">登録済み</option>
              <option value="guest">ゲスト</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-3">ユーザー</th>
                  <th className="text-left py-3 px-3">求人</th>
                  <th className="text-right py-3 px-3">応募CL</th>
                  <th className="text-right py-3 px-3">相談CL</th>
                  <th className="text-right py-3 px-3">応募</th>
                  <th className="text-left py-3 px-3">相談ステータス</th>
                  <th className="text-left py-3 px-3">次回予約</th>
                  <th className="text-left py-3 px-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">対象データがありません</td>
                  </tr>
                )}
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{lead.displayName}</div>
                      <div className="text-xs text-slate-500">{lead.email || "メール未登録"}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {lead.prefecture || "都道府県未登録"}
                        {lead.age !== null ? ` / ${lead.age}歳` : ""}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800">{lead.jobTitle || "-"}</div>
                      {lead.jobType ? <Badge variant="secondary" className="mt-1 text-xs">{lead.jobType}</Badge> : null}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-700 font-semibold">{lead.applyClicks}</td>
                    <td className="py-3 px-3 text-right text-teal-700 font-semibold">{lead.consultClicks}</td>
                    <td className="py-3 px-3 text-right text-blue-700 font-semibold">{lead.applications}</td>
                    <td className="py-3 px-3">
                      {lead.latestConsultationStatus ? (
                        <Badge variant="outline">{lead.latestConsultationStatus}</Badge>
                      ) : (
                        <span className="text-slate-400">未予約</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {formatDateTime(lead.nextConsultationAt)}
                    </td>
                    <td className="py-3 px-3">
                      <Button size="sm" variant="outline" onClick={() => openLead(lead)}>詳細</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          {!selectedLead ? (
            <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center text-slate-400">
              <User className="w-8 h-8 mb-3" />
              <p>左の一覧からユーザーを選択すると、</p>
              <p>プロフィール・予約URL・行動履歴を表示します。</p>
            </div>
          ) : (
            <LeadDetailPanel
              key={selectedLead.id}
              lead={selectedLead}
              isSaving={isSaving}
              onSave={handleSaveConsultation}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{typeof value === "number" ? value.toLocaleString() : value}</div>
    </div>
  );
}

function LeadDetailPanel({
  lead,
  isSaving,
  onSave,
}: {
  lead: LeadRow;
  isSaving: boolean;
  onSave: (status: string, meetingUrl: string, note: string) => Promise<void>;
}) {
  const consultationEvent = lead.events.find((event) => event.kind === "consultation");
  const [status, setStatus] = useState(lead.latestConsultationStatus || "booked");
  const [meetingUrl, setMeetingUrl] = useState(lead.meetingUrl || "");
  const [note, setNote] = useState(consultationEvent?.note || "");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-900">{lead.displayName}</h3>
        <p className="text-sm text-slate-500">{lead.email || "メール未登録"}</p>
        <p className="text-sm text-slate-500">{lead.phone || "電話番号未登録"}</p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
        <div className="font-medium text-slate-800">現在の応募ステータス</div>
        <div className="mt-1">{lead.latestApplicationStatus || "未応募"}</div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">相談ステータス</label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
        >
          {consultStatuses.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">オンライン相談URL</label>
        <input
          value={meetingUrl}
          onChange={(event) => setMeetingUrl(event.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        {meetingUrl ? (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
          >
            URLを開く
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">管理メモ</label>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="w-full min-h-24 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="相談予定、注意事項、連絡履歴など"
        />
      </div>

      <Button
        onClick={() => onSave(status, meetingUrl, note)}
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarDays className="w-4 h-4 mr-2" />}
        相談情報を保存
      </Button>

      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2">行動履歴</h4>
        <div className="space-y-2 max-h-64 overflow-auto pr-1">
          {lead.events.length === 0 ? (
            <div className="text-sm text-slate-400">履歴がありません</div>
          ) : (
            lead.events.map((event) => (
              <div key={event.id} className="border border-slate-200 rounded-lg p-2">
                <div className="text-xs text-slate-400">{formatDateTime(event.at)}</div>
                <div className="text-sm font-medium text-slate-800">{event.status}</div>
                <div className="text-xs text-slate-500">{event.title}</div>
                {event.note ? <div className="text-xs text-slate-500 mt-1">{event.note}</div> : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
