"use client";

import type {
  ConsultationMode,
  ConsultationRouteSlug,
  ConsultationRouteView,
} from "@/app/consult-jobs/actions";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { getConsultationRouteTheme } from "./routeThemes";

type ConsultationRouteCardsProps = {
  routes: ConsultationRouteView[];
  selectedRouteSlug: ConsultationRouteSlug | null;
  selectedMode: ConsultationMode | null;
  onRouteChange: (routeSlug: ConsultationRouteSlug) => void;
  onModeChange: (mode: ConsultationMode) => void;
  onRouteModeChange: (routeSlug: ConsultationRouteSlug, mode: ConsultationMode) => void;
};

export default function ConsultationRouteCards({
  routes,
  selectedRouteSlug,
  selectedMode,
  onRouteChange,
  onModeChange,
  onRouteModeChange,
}: ConsultationRouteCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-1 min-[390px]:gap-1.5 sm:gap-3">
      {routes.map((route) => {
        const isSelected = route.slug === selectedRouteSlug;
        const theme = getConsultationRouteTheme(route.slug);
        const Icon = theme.icon;
        const hasModeSwitcher = route.options.length > 1;
        const chips = (route.options.find((option) => option.isDefault) ?? route.options[0])?.chips.slice(0, 3) ?? [];

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
              "relative flex min-h-[84px] min-w-0 cursor-pointer flex-col rounded-lg border bg-white px-1.5 py-2 text-left shadow-sm transition min-[390px]:p-2 sm:min-h-[132px] sm:p-3",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              theme.focusRingClassName,
              isSelected
                ? cn("shadow-md", theme.activeClassName)
                : cn("border-slate-200", theme.cardHoverClassName),
            )}
            aria-pressed={isSelected}
          >
            <div className="mb-1 flex items-start justify-between gap-1.5 sm:mb-2 sm:gap-2">
              <Icon className={cn("h-4 w-4 shrink-0 sm:h-7 sm:w-7", theme.iconClassName)} aria-hidden="true" />
              {isSelected && (
                <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0 sm:h-5 sm:w-5", theme.checkClassName)} aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-[11px] font-extrabold leading-snug tracking-normal text-slate-950 min-[390px]:text-[12px] sm:text-lg">
                {route.title}
              </h2>
              {route.subtitle && (
                <p className="mt-1 hidden text-[11px] font-medium leading-4 text-slate-600 sm:mt-1.5 sm:block sm:text-sm">
                  {route.subtitle}
                </p>
              )}
            </div>

            {hasModeSwitcher && (
              <div className="mt-1.5 grid grid-cols-2 overflow-hidden rounded-md border border-slate-200 bg-white text-center text-[9px] font-bold sm:mt-2 sm:text-sm">
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
                        "min-w-0 whitespace-nowrap px-0.5 py-1 transition sm:px-1.5 sm:py-1.5",
                        isModeSelected
                          ? theme.modeSelectedClassName
                          : theme.modeIdleClassName,
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-1 flex flex-wrap gap-1 sm:mt-2">
              {chips.map((chip, index) => (
                <span
                  key={chip}
                  className={cn(
                    "inline-flex max-w-full items-center rounded border px-1 py-0.5 text-[8px] font-bold leading-none sm:px-1.5 sm:py-1 sm:text-xs",
                    index > 0 && "hidden min-[390px]:inline-flex sm:inline-flex",
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
