"use client";

import type {
  ConsultationEmploymentJobSummary,
  ConsultationEmploymentKey,
  ConsultationJobCard,
} from "@/app/consult-jobs/actions";
import { cn, getEmploymentTypeStyle, getJobTagStyle } from "@/lib/utils";
import { ArrowRight, Banknote, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";

type ConsultationEmploymentJobPreviewProps = {
  summary: ConsultationEmploymentJobSummary;
  selectedKey: ConsultationEmploymentKey;
  onSelectedKeyChange: (key: ConsultationEmploymentKey) => void;
  disableNavigation?: boolean;
  onJobDetailClick: (jobId: string) => Promise<void>;
};

type ThemeClasses = {
  activeTab: string;
  inactiveTab: string;
  detailButton: string;
  listButton: string;
};

const THEME_CLASSES: Record<ConsultationEmploymentKey, ThemeClasses> = {
  dispatch: {
    activeTab: "bg-pink-600 text-white shadow-sm",
    inactiveTab: "bg-white text-pink-700 hover:bg-pink-50",
    detailButton: "border-pink-500 text-pink-700 hover:bg-pink-50",
    listButton: "border-pink-600 bg-pink-600 text-white shadow-sm hover:bg-pink-700",
  },
  fulltime: {
    activeTab: "bg-blue-600 text-white shadow-sm",
    inactiveTab: "bg-white text-blue-700 hover:bg-blue-50",
    detailButton: "border-blue-500 text-blue-700 hover:bg-blue-50",
    listButton: "border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700",
  },
};

function getTabLabel(summary: ConsultationEmploymentJobSummary, key: ConsultationEmploymentKey) {
  const group = summary[key];
  return `${group.label} ${group.total}件`;
}

function JobPreviewCard({
  job,
  employmentKey,
  pending,
  onDetailClick,
}: {
  job: ConsultationJobCard;
  employmentKey: ConsultationEmploymentKey;
  pending: boolean;
  onDetailClick: (event: MouseEvent<HTMLAnchorElement>, job: ConsultationJobCard) => void;
}) {
  const theme = THEME_CLASSES[employmentKey];

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded px-2.5 py-1.5 text-xs font-extrabold leading-none",
            getEmploymentTypeStyle(job.type),
          )}
        >
          {job.type}
        </span>
        <h4 className="min-w-0 flex-1 text-[17px] font-extrabold leading-snug tracking-normal text-slate-950 sm:text-lg">
          <span className="line-clamp-2">{job.title}</span>
        </h4>
      </div>

      <div className="mt-3 space-y-2 text-sm font-semibold text-slate-600">
        {job.salaryText && (
          <div className="flex min-w-0 items-center gap-2">
            <Banknote className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <span className="truncate">{job.salaryText}</span>
          </div>
        )}
        {job.areaText && (
          <div className="flex min-w-0 items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
            <span className="truncate">{job.areaText}</span>
          </div>
        )}
      </div>

      {job.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={cn(
                "inline-flex items-center rounded border px-2 py-1 text-[11px] font-bold leading-none",
                getJobTagStyle(job.type),
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <Link
        href={job.detailUrl}
        onClick={(event) => onDetailClick(event, job)}
        aria-disabled={pending}
        className={cn(
          "mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg border bg-white px-4 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          theme.detailButton,
          pending && "cursor-wait border-slate-300 text-slate-400 hover:bg-white",
        )}
      >
        <span>{pending ? "移動しています" : "求人詳細を見る"}</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}

export default function ConsultationEmploymentJobPreview({
  summary,
  selectedKey,
  onSelectedKeyChange,
  disableNavigation = false,
  onJobDetailClick,
}: ConsultationEmploymentJobPreviewProps) {
  const router = useRouter();
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const selectedGroup = summary[selectedKey];
  const theme = THEME_CLASSES[selectedKey];

  useEffect(() => {
    setPendingJobId(null);
  }, [selectedKey]);

  const handleDetailClick = async (event: MouseEvent<HTMLAnchorElement>, job: ConsultationJobCard) => {
    event.preventDefault();
    if (disableNavigation || pendingJobId) return;

    setPendingJobId(job.id);
    try {
      await onJobDetailClick(job.id);
    } finally {
      router.push(job.detailUrl);
    }
  };

  return (
    <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-label="求人も一緒に見る">
      <div>
        <h2 className="text-2xl font-extrabold tracking-normal text-slate-950">求人も一緒に見る</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">相談前に条件に合う求人を確認</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-inner">
        {(["dispatch", "fulltime"] as const).map((key) => {
          const isSelected = selectedKey === key;
          const tabTheme = THEME_CLASSES[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectedKeyChange(key)}
              className={cn(
                "flex h-10 items-center justify-center rounded-md px-2 text-sm font-extrabold tracking-normal transition sm:text-base",
                isSelected ? tabTheme.activeTab : tabTheme.inactiveTab,
              )}
              aria-pressed={isSelected}
            >
              {getTabLabel(summary, key)}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <h3 className="text-lg font-extrabold tracking-normal text-slate-950">おすすめ求人</h3>

        {selectedGroup.jobs.length > 0 ? (
          <div className="mt-3 space-y-3">
            {selectedGroup.jobs.map((job) => (
              <JobPreviewCard
                key={job.id}
                job={job}
                employmentKey={selectedKey}
                pending={pendingJobId === job.id}
                onDetailClick={handleDetailClick}
              />
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-7 text-center">
            <p className="text-sm font-bold text-slate-700">現在表示できる求人はありません</p>
            <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
              公開求人が追加されると、この枠に表示されます。
            </p>
          </div>
        )}
      </div>

      <Link
        href={selectedGroup.listUrl}
        className={cn(
          "mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-extrabold transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          theme.listButton,
        )}
      >
        <span>すべての求人を見る</span>
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>

      <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
        ※ 求人数は更新日時点の公開求人の合計件数です
      </p>
    </section>
  );
}
