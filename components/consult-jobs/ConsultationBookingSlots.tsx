"use client";

import type {
  ConsultationAvailableDateView,
  ConsultationBookingOptionView,
  ConsultationRouteView,
} from "@/app/consult-jobs/actions";
import { cn } from "@/lib/utils";
import { ArrowRight, Building2, Clock3 } from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";
import { getConsultationRouteTheme } from "./routeThemes";

type ConsultationBookingSlotsProps = {
  route: ConsultationRouteView | null;
  option: ConsultationBookingOptionView | null;
  selectedDate: ConsultationAvailableDateView | null;
  disableNavigation?: boolean;
  onBeforeNavigate: () => Promise<void>;
};

function normalizeBookingUrl(url: string): string {
  return url.replace(/^ps:\/\/www\.e-nextlevel\.jp/i, "https://www.e-nextlevel.jp");
}

function getSlotUrl(option: ConsultationBookingOptionView | null, selectedDate: ConsultationAvailableDateView | null) {
  const url = selectedDate?.bookingUrl?.trim() || option?.bookingUrl?.trim() || "";
  return url ? normalizeBookingUrl(url) : "";
}

function getSlots(option: ConsultationBookingOptionView | null, selectedDate: ConsultationAvailableDateView | null) {
  const dateSlots = selectedDate?.slots ?? [];
  if (dateSlots.length) {
    return dateSlots.map((slot) => ({
      ...slot,
      url: normalizeBookingUrl(slot.url),
    }));
  }

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
  const [navigatingSlotKey, setNavigatingSlotKey] = useState<string | null>(null);
  const slots = getSlots(option, selectedDate);
  const canNavigate = Boolean(route && option && selectedDate?.status === "available" && slots.length > 0);
  const slotTitle = selectedDate?.slotTitle || "働き方を相談";
  const slotDescription = selectedDate?.slotDescription || "新宿で直接相談したい方";
  const theme = getConsultationRouteTheme(route?.slug);

  const handleSlotClick = async (
    event: MouseEvent<HTMLAnchorElement>,
    slot: { label: string; url: string },
  ) => {
    event.preventDefault();

    if (!canNavigate || disableNavigation) {
      return;
    }
    if (navigatingSlotKey) return;

    const slotKey = `${slot.label}-${slot.url}`;
    setNavigatingSlotKey(slotKey);
    try {
      await onBeforeNavigate();
    } finally {
      window.location.assign(slot.url);
    }
  };

  return (
    <section className="mt-3" aria-label="この日に予約できるスキマ面談">
      <article className={cn("rounded-lg border bg-white p-3 shadow-sm sm:p-4", theme.slotCardClassName)}>
        <div className="grid grid-cols-[minmax(0,1fr)_148px] gap-3 sm:grid-cols-[minmax(0,1fr)_190px] sm:gap-4">
          <div className="min-w-0">
            <div className={cn("mb-2 flex h-9 w-9 items-center justify-center rounded-lg", theme.slotIconClassName)}>
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
            <p className={cn("mb-1.5 text-center text-[11px] font-extrabold tracking-normal sm:text-xs", theme.slotLabelClassName)}>
              予約はこちらから
            </p>
            <div className="grid gap-1.5">
              {slots.length > 0 ? (
                slots.map((slot) => (
                  <a
                    key={`${slot.label}-${slot.url}`}
                    href={slot.url}
                    onClick={(event) => handleSlotClick(event, slot)}
                    aria-disabled={!canNavigate || Boolean(navigatingSlotKey)}
                    className={cn(
                      "flex h-10 w-full items-center justify-center gap-1.5 rounded-lg px-2 text-center font-extrabold tracking-normal transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                      theme.focusRingClassName,
                      canNavigate && !navigatingSlotKey
                        ? theme.slotButtonClassName
                        : "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none",
                    )}
                  >
                    <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="whitespace-nowrap text-[13px] leading-none sm:text-sm">
                      {navigatingSlotKey === `${slot.label}-${slot.url}` ? "移動中" : slot.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </a>
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
