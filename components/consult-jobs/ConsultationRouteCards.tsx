"use client";

import type {
  ConsultationMode,
  ConsultationRouteSlug,
  ConsultationRouteView,
} from "@/app/consult-jobs/actions";
import { cn } from "@/lib/utils";
import { Briefcase, CheckCircle2, CircleHelp, UsersRound } from "lucide-react";

type ConsultationRouteCardsProps = {
  routes: ConsultationRouteView[];
  selectedRouteSlug: ConsultationRouteSlug | null;
  selectedMode: ConsultationMode | null;
  onRouteChange: (routeSlug: ConsultationRouteSlug) => void;
  onModeChange: (mode: ConsultationMode) => void;
  onRouteModeChange: (routeSlug: ConsultationRouteSlug, mode: ConsultationMode) => void;
};

const ROUTE_THEMES = {
  dispatch: {
    icon: UsersRound,
    iconClassName: "text-primary-600",
    activeClassName: "border-primary-500 bg-primary-50 shadow-primary-100",
    chipClassName: "border-primary-200 bg-primary-50 text-primary-700",
    checkClassName: "text-primary-600",
  },
  fulltime: {
    icon: Briefcase,
    iconClassName: "text-blue-600",
    activeClassName: "border-blue-500 bg-blue-50 shadow-blue-100",
    chipClassName: "border-blue-200 bg-blue-50 text-blue-700",
    checkClassName: "text-blue-600",
  },
  undecided: {
    icon: CircleHelp,
    iconClassName: "text-purple-600",
    activeClassName: "border-purple-500 bg-purple-50 shadow-purple-100",
    chipClassName: "border-purple-200 bg-purple-50 text-purple-700",
    checkClassName: "text-purple-600",
  },
} satisfies Record<
  ConsultationRouteSlug,
  {
    icon: typeof UsersRound;
    iconClassName: string;
    activeClassName: string;
    chipClassName: string;
    checkClassName: string;
  }
>;

export default function ConsultationRouteCards({
  routes,
  selectedRouteSlug,
  selectedMode,
  onRouteChange,
  onModeChange,
  onRouteModeChange,
}: ConsultationRouteCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
      {routes.map((route) => {
        const isSelected = route.slug === selectedRouteSlug;
        const theme = ROUTE_THEMES[route.slug];
        const Icon = theme.icon;
        const hasModeSwitcher = route.options.length > 1;

        return (
          <div
            key={route.id}
            onClick={() => onRouteChange(route.slug)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              onRouteChange(route.slug);
            }}
            role="button"
            tabIndex={0}
            className={cn(
              "relative flex min-h-[116px] min-w-0 cursor-pointer flex-col rounded-lg border bg-white p-2 text-left shadow-sm transition sm:min-h-[170px] sm:p-4",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
              isSelected
                ? cn("shadow-md", theme.activeClassName)
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
            )}
            aria-pressed={isSelected}
          >
            <div className="mb-1.5 flex items-start justify-between gap-1.5 sm:mb-3 sm:gap-2">
              <Icon className={cn("h-5 w-5 shrink-0 sm:h-9 sm:w-9", theme.iconClassName)} aria-hidden="true" />
              {isSelected && (
                <CheckCircle2 className={cn("h-4 w-4 shrink-0 sm:h-7 sm:w-7", theme.checkClassName)} aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-[12px] font-extrabold leading-snug tracking-normal text-slate-950 sm:text-xl">
                {route.title}
              </h2>
              {route.subtitle && (
                <p className="mt-1 hidden text-[11px] font-medium leading-5 text-slate-600 min-[430px]:block sm:mt-2 sm:text-sm">
                  {route.subtitle}
                </p>
              )}
            </div>

            {hasModeSwitcher && (
              <div className="mt-1.5 grid grid-cols-2 overflow-hidden rounded-md border border-slate-200 bg-white text-center text-[9px] font-bold sm:mt-3 sm:text-sm">
                {route.options.map((option) => {
                  const isModeSelected = isSelected && selectedMode === option.mode;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onKeyDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (isSelected) {
                          onModeChange(option.mode);
                          return;
                        }
                        onRouteModeChange(route.slug, option.mode);
                      }}
                      className={cn(
                        "min-w-0 whitespace-nowrap px-0.5 py-1 transition sm:px-1.5 sm:py-2",
                        isModeSelected
                          ? "bg-blue-600 text-white"
                          : "bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-700",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-1.5 flex flex-wrap gap-1 sm:mt-3">
              {(route.options.find((option) => option.isDefault) ?? route.options[0])?.chips.slice(0, 3).map((chip) => (
                <span
                  key={chip}
                  className={cn(
                    "inline-flex max-w-full items-center rounded border px-1 py-0.5 text-[8px] font-bold leading-none sm:px-1.5 sm:py-1 sm:text-xs",
                    theme.chipClassName,
                  )}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
