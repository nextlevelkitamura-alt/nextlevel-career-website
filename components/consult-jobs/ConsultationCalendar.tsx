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

  const cells = useMemo(() => buildCalendarCells(visibleMonth), [visibleMonth]);

  useEffect(() => {
    if (!selectedDate) return;
    setVisibleMonth(getMonthStart(parseDateKey(selectedDate)));
  }, [selectedDate]);

  const moveMonth = (amount: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-stretch">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:h-10 sm:w-10"
              aria-label="前の月"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="text-lg font-extrabold tracking-normal text-slate-950 sm:text-2xl">
              {formatMonthLabel(visibleMonth)}
            </p>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:h-10 sm:w-10"
              aria-label="次の月"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((weekday, index) => (
              <div
                key={weekday}
                className={cn(
                  "py-1 text-xs font-bold",
                  index === 0 ? "text-red-500" : index === 6 ? "text-blue-600" : "text-slate-700",
                )}
              >
                {weekday}
              </div>
            ))}

            {cells.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="aspect-square" aria-hidden="true" />;
              }

              const date = dateMap.get(cell.dateKey);
              const isSelected = selectedDate === cell.dateKey;
              const isAvailable = date?.status === "available";
              const isSelectable = Boolean(isAvailable && !isWeekend(cell.dateKey));

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  disabled={!isSelectable}
                  onClick={() => onDateChange(cell.dateKey)}
                  className={cn(
                    "relative flex aspect-square min-h-9 items-center justify-center rounded-full text-sm font-bold transition sm:min-h-10 sm:text-base",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                    isSelected && "bg-primary-600 text-white shadow-lg shadow-primary-200",
                    !isSelected && isSelectable && "text-slate-950 hover:bg-primary-50 hover:text-primary-700",
                    !isSelected && !isSelectable && "cursor-not-allowed text-slate-300",
                  )}
                  aria-label={`${cell.dateKey}${isSelectable ? " 選択可能" : " 選択不可"}`}
                >
                  <span>{cell.day}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3 md:border-l md:border-t-0 md:pl-5 md:pt-0">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="whitespace-nowrap text-xs font-extrabold leading-tight tracking-normal text-slate-950 sm:text-sm">
                この日に予約できるスキマ面談
              </p>
            </div>
            <p className="shrink-0 text-right text-xs font-bold leading-tight text-slate-900 sm:text-sm">
              選択中:{" "}
              <span className="text-xl font-extrabold text-primary-600 sm:text-2xl">
                {formatSelectedLabel(selectedDate)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
