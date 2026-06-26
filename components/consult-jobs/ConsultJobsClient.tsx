"use client";

import { useMemo, useState } from "react";
import {
  recordConsultationLpClick,
  type ConsultationAvailableDateView,
  type ConsultationBookingOptionView,
  type ConsultationEmploymentJobSummary,
  type ConsultationEmploymentKey,
  type ConsultationRouteSlug,
  type ConsultationRouteView,
} from "@/app/consult-jobs/actions";
import ConsultationBookingSlots from "./ConsultationBookingSlots";
import ConsultationCalendar from "./ConsultationCalendar";
import ConsultationEmploymentJobPreview from "./ConsultationEmploymentJobPreview";
import ConsultationRouteCards from "./ConsultationRouteCards";

type ConsultJobsClientProps = {
  routes: ConsultationRouteView[];
  employmentJobs: ConsultationEmploymentJobSummary;
  isDemo?: boolean;
};

function getInitialRoute(
  routes: ConsultationRouteView[],
): ConsultationRouteView | null {
  return routes.find((route) => route.slug === "dispatch") ?? routes[0] ?? null;
}

function getDefaultOption(
  route: ConsultationRouteView | null,
): ConsultationBookingOptionView | null {
  if (!route) return null;
  return (
    route.options.find((option) => option.isDefault) ?? route.options[0] ?? null
  );
}

function isWeekday(dateKey: string): boolean {
  const [year, month, day] = dateKey.split("-").map(Number);
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function getTodayKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

function isSelectableDate(
  date: ConsultationAvailableDateView,
  todayKey: string,
): boolean {
  return (
    date.status === "available" && isWeekday(date.date) && date.date >= todayKey
  );
}

function getMergedAvailableDates(
  options: ConsultationBookingOptionView[],
): ConsultationAvailableDateView[] {
  const dateMap = new Map<string, ConsultationAvailableDateView>();

  options.forEach((option) => {
    option.availableDates.forEach((date) => {
      const existing = dateMap.get(date.date);
      if (
        !existing ||
        (existing.status !== "available" && date.status === "available")
      ) {
        dateMap.set(date.date, date);
      }
    });
  });

  return Array.from(dateMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

function getDefaultDateForRoute(
  route: ConsultationRouteView | null,
): ConsultationAvailableDateView | null {
  if (!route) return null;
  const todayKey = getTodayKey();
  return (
    getMergedAvailableDates(route.options).find((date) =>
      isSelectableDate(date, todayKey),
    ) ?? null
  );
}

function getBookingOptionDisplayOrder(option: ConsultationBookingOptionView): number {
  if (option.mode === "visit") return 10;
  if (option.mode === "online") return 20;
  return 99;
}

function getEmploymentKeyForRoute(
  routeSlug: ConsultationRouteSlug | null,
  summary: ConsultationEmploymentJobSummary,
): ConsultationEmploymentKey {
  if (routeSlug === "fulltime") return "fulltime";
  if (routeSlug === "dispatch") return "dispatch";
  return summary.fulltime.total > summary.dispatch.total
    ? "fulltime"
    : "dispatch";
}

export default function ConsultJobsClient({
  routes,
  employmentJobs,
  isDemo = false,
}: ConsultJobsClientProps) {
  const displayRoutes = routes;

  const initialRoute = getInitialRoute(displayRoutes);
  const initialDate = getDefaultDateForRoute(initialRoute);
  const initialEmploymentKey = getEmploymentKeyForRoute(
    initialRoute?.slug ?? null,
    employmentJobs,
  );

  const [selectedRouteSlug, setSelectedRouteSlug] =
    useState<ConsultationRouteSlug | null>(initialRoute?.slug ?? null);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    initialDate?.date ?? null,
  );
  const [selectedEmploymentKey, setSelectedEmploymentKey] =
    useState<ConsultationEmploymentKey>(initialEmploymentKey);

  const selectedRoute = useMemo(
    () =>
      displayRoutes.find((route) => route.slug === selectedRouteSlug) ??
      getInitialRoute(displayRoutes),
    [displayRoutes, selectedRouteSlug],
  );

  const selectedAvailableDates = useMemo(() => {
    if (!selectedRoute) return [];
    return getMergedAvailableDates(selectedRoute.options);
  }, [selectedRoute]);

  const selectedDateView = useMemo(() => {
    const selected = selectedAvailableDates.find(
      (date) => date.date === selectedDate,
    );
    const todayKey = getTodayKey();
    if (selected && isSelectableDate(selected, todayKey)) {
      return selected;
    }
    return (
      selectedAvailableDates.find((date) => isSelectableDate(date, todayKey)) ??
      null
    );
  }, [selectedAvailableDates, selectedDate]);

  const selectedBookingOptions = useMemo(() => {
    if (!selectedRoute || !selectedDateView) return [];
    const todayKey = getTodayKey();

    return selectedRoute.options
      .map((option) => {
        const date = option.availableDates.find(
          (availableDate) => availableDate.date === selectedDateView.date,
        );
        return date && isSelectableDate(date, todayKey)
          ? { option, date }
          : null;
      })
      .filter(
        (
          item,
        ): item is {
          option: ConsultationBookingOptionView;
          date: ConsultationAvailableDateView;
        } => Boolean(item),
      )
      .sort(
        (a, b) =>
          getBookingOptionDisplayOrder(a.option) -
          getBookingOptionDisplayOrder(b.option),
      );
  }, [selectedDateView, selectedRoute]);

  const handleRouteChange = (routeSlug: ConsultationRouteSlug) => {
    const nextRoute =
      displayRoutes.find((route) => route.slug === routeSlug) ?? null;
    const nextDate = getDefaultDateForRoute(nextRoute);

    setSelectedRouteSlug(routeSlug);
    setSelectedDate(nextDate?.date ?? null);
    setSelectedEmploymentKey(
      getEmploymentKeyForRoute(routeSlug, employmentJobs),
    );
  };

  const handleBookingClick = async (
    option: ConsultationBookingOptionView,
    date: ConsultationAvailableDateView,
  ) => {
    if (!selectedRoute) return;
    if (isDemo) return;

    await recordConsultationLpClick({
      routeSlug: selectedRoute.slug,
      mode: option.mode,
      selectedDate: date.date,
      clickType: "booking",
    });
  };

  const handleEmploymentJobClick = async (jobId: string) => {
    if (!selectedRoute) return;
    const trackingOption =
      selectedBookingOptions[0]?.option ?? getDefaultOption(selectedRoute);
    if (!trackingOption) return;
    if (isDemo) return;

    await recordConsultationLpClick({
      routeSlug: selectedRoute.slug,
      mode: trackingOption.mode,
      selectedDate: selectedDateView?.date ?? null,
      jobId,
      clickType: "job_detail",
    });
  };

  if (displayRoutes.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center">
          <p className="mb-3 text-sm font-bold text-primary-600">相談求人LP</p>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">
            相談ルートが未設定です
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
            Supabaseで相談ルート、面談方法、予約可能日、求人紐づけを登録すると、このページに表示されます。
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="mx-auto w-full max-w-5xl px-3 py-7 sm:px-4 lg:px-6">
        <div className="mb-6 text-center">
          <h1 className="text-[28px] font-extrabold leading-tight tracking-normal text-slate-950 sm:text-4xl">
            日付から相談求人を選ぶ
          </h1>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-600 sm:text-base">
            ルートを選んで、カレンダーから面談日を選べます
          </p>
        </div>

        <ConsultationRouteCards
          routes={displayRoutes}
          selectedRouteSlug={selectedRoute?.slug ?? null}
          onRouteChange={handleRouteChange}
        />

        <div className="mt-8">
          <h2 className="mb-3 text-xl font-extrabold tracking-normal text-slate-950 sm:text-2xl">
            カレンダーで日付を選ぶ
          </h2>
          <ConsultationCalendar
            availableDates={selectedAvailableDates}
            selectedDate={selectedDateView?.date ?? null}
            onDateChange={setSelectedDate}
          />
        </div>

        {selectedBookingOptions.map(({ option, date }) => (
          <ConsultationBookingSlots
            key={option.id}
            route={selectedRoute}
            option={option}
            selectedDate={date}
            disableNavigation={isDemo}
            onBeforeNavigate={() => handleBookingClick(option, date)}
          />
        ))}

        <ConsultationEmploymentJobPreview
          summary={employmentJobs}
          selectedKey={selectedEmploymentKey}
          onSelectedKeyChange={setSelectedEmploymentKey}
          disableNavigation={isDemo}
          onJobDetailClick={handleEmploymentJobClick}
        />
      </section>
    </div>
  );
}
