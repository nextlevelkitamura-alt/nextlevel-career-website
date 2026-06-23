"use client";

import type { ConsultationJobCard } from "@/app/consult-jobs/actions";
import { cn, getEmploymentTypeStyle, getJobTagStyle } from "@/lib/utils";
import { ArrowRight, Banknote, Briefcase, Clock, MapPin, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ConsultationJobListProps = {
  jobs: ConsultationJobCard[];
  disableNavigation?: boolean;
  onJobDetailClick: (jobId: string) => Promise<void>;
};

export default function ConsultationJobList({
  jobs,
  disableNavigation = false,
  onJobDetailClick,
}: ConsultationJobListProps) {
  const router = useRouter();
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);

  useEffect(() => {
    setPendingJobId(null);
  }, [jobs]);

  const handleDetailClick = async (job: ConsultationJobCard) => {
    if (disableNavigation) {
      await onJobDetailClick(job.id);
      return;
    }

    setPendingJobId(job.id);
    try {
      await onJobDetailClick(job.id);
    } finally {
      router.push(job.detailUrl);
    }
  };

  return (
    <section className="mt-8">
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold tracking-normal text-slate-950">相談可能な求人一覧</h2>
        <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
          選んだ内容に合わせたおすすめ求人
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
          <p className="text-sm font-bold text-slate-700">この条件に紐づく求人はまだ登録されていません</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            日付ごとの求人を `consultation_date_jobs` に登録すると表示されます。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm transition hover:border-primary-200 hover:shadow-md sm:p-4"
            >
              <div className="flex gap-2.5 sm:gap-4">
                <div className="relative h-28 w-[34%] max-w-[180px] shrink-0 overflow-hidden rounded-md bg-slate-100 sm:h-36 sm:w-[38%]">
                  {job.imageUrl ? (
                    <Image
                      src={job.imageUrl}
                      alt={job.title}
                      fill
                      sizes="(max-width: 640px) 38vw, 180px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                      <Briefcase className="h-10 w-10" aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center rounded px-2 py-1 text-[11px] font-bold leading-none sm:text-xs",
                        getEmploymentTypeStyle(job.type),
                      )}
                    >
                      {job.type}
                    </span>
                    {job.isFeatured && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-50 px-2 py-1 text-[10px] font-bold text-primary-700">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        優先
                      </span>
                    )}
                  </div>

                  <h3 className="line-clamp-2 text-[17px] font-extrabold leading-snug tracking-normal text-slate-950 sm:text-xl">
                    {job.title}
                  </h3>

                  {job.highlightLabel && (
                    <p className="mt-1 line-clamp-1 text-xs font-bold text-primary-700">{job.highlightLabel}</p>
                  )}

                  <div className="mt-2 space-y-1.5 text-xs font-semibold text-slate-600 sm:text-sm">
                    {job.areaText && (
                      <div className="flex min-w-0 items-center gap-1.5">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        <span className="truncate">{job.areaText}</span>
                      </div>
                    )}
                    {job.salaryText && (
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Banknote className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        <span className="truncate">{job.salaryText}</span>
                      </div>
                    )}
                    {job.workingHours && (
                      <div className="hidden min-w-0 items-center gap-1.5 sm:flex">
                        <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        <span className="truncate">{job.workingHours}</span>
                      </div>
                    )}
                  </div>

                  {job.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3">
                      {job.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            "inline-flex items-center rounded border px-1.5 py-1 text-[10px] font-bold leading-none sm:px-2 sm:text-[11px]",
                            getJobTagStyle(job.type),
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDetailClick(job)}
                disabled={pendingJobId === job.id}
                className="mt-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-primary-500 bg-white px-4 text-base font-extrabold text-primary-600 transition hover:bg-primary-50 disabled:cursor-wait disabled:border-slate-300 disabled:text-slate-400 sm:mt-3"
              >
                <span>{pendingJobId === job.id ? "移動しています" : "求人詳細を見る"}</span>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
