"use client";

import type {
  ConsultationDateStatus,
  ConsultationMode,
  ConsultationRouteSlug,
} from "@/app/consult-jobs/actions";
import { CalendarCheck } from "lucide-react";
import { useState } from "react";

type BookingCtaProps = {
  routeSlug: ConsultationRouteSlug | null;
  mode: ConsultationMode | null;
  bookingUrl: string | null;
  selectedDate: string | null;
  selectedDateStatus: ConsultationDateStatus | null;
  onBeforeNavigate: () => Promise<void>;
};

function buildBookingUrl(
  bookingUrl: string,
  selectedDate: string,
  routeSlug: ConsultationRouteSlug,
  mode: ConsultationMode,
): string {
  const isAbsoluteUrl = /^[a-z][a-z\d+\-.]*:\/\//i.test(bookingUrl);
  const url = new URL(bookingUrl, window.location.origin);
  url.searchParams.set("date", selectedDate);
  url.searchParams.set("route", `${routeSlug}-${mode}`);

  if (isAbsoluteUrl) {
    return url.toString();
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export default function BookingCta({
  routeSlug,
  mode,
  bookingUrl,
  selectedDate,
  selectedDateStatus,
  onBeforeNavigate,
}: BookingCtaProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const canNavigate = Boolean(
    routeSlug &&
      mode &&
      bookingUrl &&
      bookingUrl.trim().length > 0 &&
      selectedDate &&
      selectedDateStatus === "available",
  );

  const handleClick = async () => {
    if (!canNavigate || !routeSlug || !mode || !bookingUrl || !selectedDate) return;

    setIsNavigating(true);
    try {
      await onBeforeNavigate();
    } finally {
      window.location.assign(buildBookingUrl(bookingUrl, selectedDate, routeSlug, mode));
    }
  };

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={handleClick}
        disabled={!canNavigate || isNavigating}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-lg bg-primary-600 px-5 text-lg font-extrabold tracking-normal text-white shadow-lg shadow-primary-200 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none sm:h-16 sm:text-2xl"
      >
        <CalendarCheck className="h-7 w-7" aria-hidden="true" />
        <span>{isNavigating ? "移動しています" : "スキマ面談予約する"}</span>
      </button>
      <p className="mt-3 text-center text-sm font-medium leading-6 text-slate-500">
        選んだルートと日付の予約URLへ移動します
      </p>
    </div>
  );
}
