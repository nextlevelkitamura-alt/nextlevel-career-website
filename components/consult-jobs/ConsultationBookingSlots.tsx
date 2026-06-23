"use client";

import type {
  ConsultationAvailableDateView,
  ConsultationBookingOptionView,
  ConsultationRouteView,
} from "@/app/consult-jobs/actions";
import { cn } from "@/lib/utils";
import { ArrowRight, Building2, Clock3 } from "lucide-react";
import { useState } from "react";

type ConsultationBookingSlotsProps = {
  route: ConsultationRouteView | null;
  option: ConsultationBookingOptionView | null;
  selectedDate: ConsultationAvailableDateView | null;
  disableNavigation?: boolean;
  onBeforeNavigate: () => Promise<void>;
};

function getSlotUrl(option: ConsultationBookingOptionView | null, selectedDate: ConsultationAvailableDateView | null) {
  return selectedDate?.bookingUrl?.trim() || option?.bookingUrl?.trim() || "";
}

function getSlots(option: ConsultationBookingOptionView | null, selectedDate: ConsultationAvailableDateView | null) {
  if (selectedDate?.slots.length) return selectedDate.slots;

  const fallbackUrl = getSlotUrl(option, selectedDate);
  if (!fallbackUrl) return [];

  return [
    {
      label: selectedDate?.slotLabel || "予約する",
      url: fallbackUrl,
    },
  ];
}

export default function ConsultationBookingSlots({
  route,
  option,
  selectedDate,
  disableNavigation = false,
  onBeforeNavigate,
}: ConsultationBookingSlotsProps) {
  const [navigatingUrl, setNavigatingUrl] = useState<string | null>(null);
  const slots = getSlots(option, selectedDate);
  const canNavigate = Boolean(route && option && selectedDate?.status === "available" && slots.length > 0);
  const slotTitle = selectedDate?.slotTitle || "働き方を相談";
  const slotDescription = selectedDate?.slotDescription || "新宿で直接相談したい方";

  const handleSlotClick = async (url: string) => {
    if (!canNavigate || navigatingUrl) return;

    setNavigatingUrl(url);
    try {
      await onBeforeNavigate();
      if (!disableNavigation) {
        window.location.assign(url);
      }
    } finally {
      setNavigatingUrl(null);
    }
  };

  return (
    <section className="mt-3" aria-label="この日に予約できるスキマ面談">
      <article className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_148px] gap-3 sm:grid-cols-[minmax(0,1fr)_190px] sm:gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-extrabold leading-tight tracking-normal text-slate-950 sm:text-xl">
              {slotTitle}
            </h3>
            <p className="mt-1 text-xs font-medium leading-5 text-slate-600 sm:text-sm">
              {slotDescription}
            </p>
          </div>

          <div className="flex min-w-0 flex-col justify-center">
            <p className="mb-1.5 text-center text-[11px] font-extrabold tracking-normal text-primary-600 sm:text-xs">
              予約はこちらから
            </p>
            <div className="grid gap-1.5">
              {slots.length > 0 ? (
                slots.map((slot) => (
                  <button
                    key={`${slot.label}-${slot.url}`}
                    type="button"
                    disabled={!canNavigate || Boolean(navigatingUrl)}
                    onClick={() => handleSlotClick(slot.url)}
                    className={cn(
                      "flex h-10 w-full items-center justify-center gap-1.5 rounded-lg px-2 text-center font-extrabold tracking-normal transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                      canNavigate
                        ? "bg-primary-600 text-white shadow-md shadow-primary-100 hover:bg-primary-700"
                        : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none",
                    )}
                  >
                    <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="whitespace-nowrap text-[13px] leading-none sm:text-sm">
                      {navigatingUrl === slot.url ? "移動中" : slot.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </button>
                ))
              ) : (
                <div className="rounded-lg bg-slate-100 px-2 py-3 text-center text-xs font-bold text-slate-400">
                  枠なし
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
