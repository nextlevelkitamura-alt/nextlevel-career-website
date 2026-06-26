"use client";

import type { ConsultationAvailableDateView } from "@/app/consult-jobs/actions";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ConsultationCalendarProps = {
  availableDates: ConsultationAvailableDateView[];
  selectedDate: string | null;
  onDateChange: (date: string) => void;
};

type CalendarCell = {
  day: number;
  dateKey: string;
} | null;

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function formatMonthLabel(date: Date): string {
  return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
}

function formatSelectedLabel(dateKey: string | null): string {
  if (!dateKey) return "未選択";
  const date = parseDateKey(dateKey);
  return `${date.getMonth() + 1}/${date.getDate()} ${WEEKDAYS[date.getDay()]}`;
}

function isWeekend(dateKey: string): boolean {
  const dayOfWeek = parseDateKey(dateKey).getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

function getTodayKey(): string {
  return toDateKey(new Date());
}

function buildCalendarCells(monthDate: Date): CalendarCell[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({ day, dateKey: toDateKey(date) });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export default function ConsultationCalendar({
  availableDates,
  selectedDate,
  onDateChange,
}: ConsultationCalendarProps) {
  const initialMonth = selectedDate ? getMonthStart(parseDateKey(selectedDate)) : getMonthStart(new Date());
  const [visibleMonth, setVisibleMonth] = useState(initialMonth);

  const dateMap = useMemo(() => {
    return new Map(availableDates.map((date) => [date.date, date]));
  }, [availableDates]);

  const availableMonthRange = useMemo(() => {
    if (!availableDates.length) return null;

    const sortedMonthKeys = Array.from(
      new Set(
        availableDates.map((date) =>
          getMonthKey(getMonthStart(parseDateKey(date.date))),
        ),
      ),
    ).sort();

    return {
      min: sortedMonthKeys[0],
      max: sortedMonthKeys[sortedMonthKeys.length - 1],
    };
  }, [availableDates]);

  const cells = useMemo(() => buildCalendarCells(visibleMonth), [visibleMonth]);
  const todayKey = getTodayKey();
  const visibleMonthKey = getMonthKey(visibleMonth);
  const canMoveToPreviousMonth = Boolean(
    availableMonthRange && visibleMonthKey > availableMonthRange.min,
  );
  const canMoveToNextMonth = Boolean(
    availableMonthRange && visibleMonthKey < availableMonthRange.max,
  );

  useEffect(() => {
    if (!selectedDate) return;
    setVisibleMonth(getMonthStart(parseDateKey(selectedDate)));
  }, [selectedDate]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center justify-center md:w-[520px] md:max-w-full">
            <button
              type="button"
              disabled={!canMoveToPreviousMonth}
              onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
              className={cn(
                "mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-slate-700 transition sm:h-10 sm:w-10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                canMoveToPreviousMonth
                  ? "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                  : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300",
              )}
              aria-label="前の月へ"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="min-w-0 flex-1 text-center text-lg font-extrabold tracking-normal text-slate-950 sm:text-2xl">
              {formatMonthLabel(visibleMonth)}
            </p>
            <button
              type="button"
              disabled={!canMoveToNextMonth}
              onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
              className={cn(
                "ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-slate-700 transition sm:h-10 sm:w-10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                canMoveToNextMonth
                  ? "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                  : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300",
              )}
              aria-label="次の月へ"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-center md:min-w-[190px] md:text-left">
            <p className="text-xs font-extrabold leading-none tracking-normal text-slate-700">
              選択中
            </p>
            <p className="mt-1 text-xl font-extrabold leading-none tracking-normal text-orange-600 sm:text-2xl">
              {formatSelectedLabel(selectedDate)}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="grid grid-cols-7 gap-y-2 text-center sm:gap-y-3 lg:gap-y-4">
            {WEEKDAYS.map((weekday, index) => (
              <div
                key={weekday}
                className={cn(
                  "flex h-7 items-center justify-center text-xs font-bold",
                  index === 0 ? "text-red-500" : index === 6 ? "text-blue-600" : "text-slate-700",
                )}
              >
                {weekday}
              </div>
            ))}

            {cells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="h-10 sm:h-12" aria-hidden="true" />;
              }

              const date = dateMap.get(cell.dateKey);
              const isPast = cell.dateKey < todayKey;
              const isAvailable = date?.status === "available";
              const isSelectable = Boolean(isAvailable && !isWeekend(cell.dateKey) && !isPast);
              const isSelected = selectedDate === cell.dateKey && isSelectable;
              const dateStatusLabel = isPast ? " 過去の日付" : isSelectable ? " 選択可能" : " 選択不可";

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  disabled={!isSelectable}
                  onClick={() => onDateChange(cell.dateKey)}
                  className={cn(
                    "relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition sm:h-12 sm:w-12 sm:text-base",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                    "focus-visible:ring-orange-500",
                    isSelected && "bg-orange-600 text-white shadow-lg shadow-orange-200 sm:shadow-xl",
                    !isSelected && isSelectable && "text-slate-950 hover:bg-orange-50 hover:text-orange-700",
                    !isSelected && !isSelectable && "cursor-not-allowed text-slate-300",
                  )}
                  aria-label={`${cell.dateKey}${dateStatusLabel}`}
                >
                  <span>{cell.day}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
