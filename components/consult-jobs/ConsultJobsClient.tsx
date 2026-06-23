"use client";

import { useMemo, useState } from "react";
import {
  recordConsultationLpClick,
  type ConsultationAvailableDateView,
  type ConsultationBookingOptionView,
  type ConsultationMode,
  type ConsultationRouteSlug,
  type ConsultationRouteView,
} from "@/app/consult-jobs/actions";
import BookingCta from "./BookingCta";
import ConsultationCalendar from "./ConsultationCalendar";
import ConsultationJobList from "./ConsultationJobList";
import ConsultationRouteCards from "./ConsultationRouteCards";

type ConsultJobsClientProps = {
  routes: ConsultationRouteView[];
  isDemo?: boolean;
};

function getInitialRoute(routes: ConsultationRouteView[]): ConsultationRouteView | null {
  return routes.find((route) => route.slug === "dispatch") ?? routes[0] ?? null;
}

function getDefaultOption(route: ConsultationRouteView | null): ConsultationBookingOptionView | null {
  if (!route) return null;
  return route.options.find((option) => option.isDefault) ?? route.options[0] ?? null;
}

function isWeekday(dateKey: string): boolean {
  const [year, month, day] = dateKey.split("-").map(Number);
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  return dayOfWeek !== 0 && dayOfWeek !== 6;
}

function getDefaultDate(option: ConsultationBookingOptionView | null): ConsultationAvailableDateView | null {
  if (!option) return null;
  return option.availableDates.find((date) => date.status === "available" && isWeekday(date.date)) ?? null;
}

export default function ConsultJobsClient({ routes, isDemo = false }: ConsultJobsClientProps) {
  const initialRoute = getInitialRoute(routes);
  const initialOption = getDefaultOption(initialRoute);
  const initialDate = getDefaultDate(initialOption);

  const [selectedRouteSlug, setSelectedRouteSlug] = useState<ConsultationRouteSlug | null>(
    initialRoute?.slug ?? null,
  );
  const [selectedMode, setSelectedMode] = useState<ConsultationMode | null>(initialOption?.mode ?? null);
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate?.date ?? null);

  const selectedRoute = useMemo(
    () => routes.find((route) => route.slug === selectedRouteSlug) ?? getInitialRoute(routes),
    [routes, selectedRouteSlug],
  );

  const selectedOption = useMemo(() => {
    if (!selectedRoute) return null;
    return selectedRoute.options.find((option) => option.mode === selectedMode) ?? getDefaultOption(selectedRoute);
  }, [selectedMode, selectedRoute]);

  const selectedDateView = useMemo(() => {
    if (!selectedOption) return null;
    const selected = selectedOption.availableDates.find((date) => date.date === selectedDate);
    if (selected?.status === "available" && isWeekday(selected.date)) {
      return selected;
    }
    return getDefaultDate(selectedOption);
  }, [selectedDate, selectedOption]);

  const selectedJobs = selectedDateView?.status === "available" ? selectedDateView.jobs : [];

  const handleRouteChange = (routeSlug: ConsultationRouteSlug) => {
    const nextRoute = routes.find((route) => route.slug === routeSlug) ?? null;
    const nextOption = getDefaultOption(nextRoute);
    const nextDate = getDefaultDate(nextOption);

    setSelectedRouteSlug(routeSlug);
    setSelectedMode(nextOption?.mode ?? null);
    setSelectedDate(nextDate?.date ?? null);
  };

  const handleModeChange = (mode: ConsultationMode) => {
    if (!selectedRoute) return;

    const nextOption = selectedRoute.options.find((option) => option.mode === mode) ?? null;
    const nextDate = getDefaultDate(nextOption);

    setSelectedMode(mode);
    setSelectedDate(nextDate?.date ?? null);
  };

  const handleRouteModeChange = (routeSlug: ConsultationRouteSlug, mode: ConsultationMode) => {
    const nextRoute = routes.find((route) => route.slug === routeSlug) ?? null;
    const nextOption = nextRoute?.options.find((option) => option.mode === mode) ?? getDefaultOption(nextRoute);
    const nextDate = getDefaultDate(nextOption ?? null);

    setSelectedRouteSlug(routeSlug);
    setSelectedMode(nextOption?.mode ?? null);
    setSelectedDate(nextDate?.date ?? null);
  };

  const handleBookingClick = async () => {
    if (!selectedRoute || !selectedOption || !selectedDateView) return;
    if (isDemo) return;

    await recordConsultationLpClick({
      routeSlug: selectedRoute.slug,
      mode: selectedOption.mode,
      selectedDate: selectedDateView.date,
      clickType: "booking",
    });
  };

  const handleJobDetailClick = async (jobId: string) => {
    if (!selectedRoute || !selectedOption || !selectedDateView) return;
    if (isDemo) return;

    await recordConsultationLpClick({
      routeSlug: selectedRoute.slug,
      mode: selectedOption.mode,
      selectedDate: selectedDateView.date,
      jobId,
      clickType: "job_detail",
    });
  };

  if (routes.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 text-center">
          <p className="mb-3 text-sm font-bold text-primary-600">相談求人LP</p>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">相談ルートが未設定です</h1>
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
          routes={routes}
          selectedRouteSlug={selectedRoute?.slug ?? null}
          selectedMode={selectedOption?.mode ?? null}
          onRouteChange={handleRouteChange}
          onModeChange={handleModeChange}
          onRouteModeChange={handleRouteModeChange}
        />

        <div className="mt-8">
          <h2 className="mb-3 text-xl font-extrabold tracking-normal text-slate-950 sm:text-2xl">
            カレンダーで日付を選ぶ
          </h2>
          <ConsultationCalendar
            availableDates={selectedOption?.availableDates ?? []}
            selectedDate={selectedDateView?.date ?? null}
            onDateChange={setSelectedDate}
          />
        </div>

        <BookingCta
          routeSlug={selectedRoute?.slug ?? null}
          mode={selectedOption?.mode ?? null}
          bookingUrl={selectedOption?.bookingUrl ?? null}
          selectedDate={selectedDateView?.date ?? null}
          selectedDateStatus={selectedDateView?.status ?? null}
          onBeforeNavigate={handleBookingClick}
        />

        <ConsultationJobList
          jobs={selectedJobs}
          disableNavigation={isDemo}
          onJobDetailClick={handleJobDetailClick}
        />
      </section>
    </div>
  );
}
