"use client";

import type {
  ConsultationRouteSlug,
  ConsultationRouteView,
} from "@/app/consult-jobs/actions";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { getConsultationRouteTheme } from "./routeThemes";

type ConsultationRouteCardsProps = {
  routes: ConsultationRouteView[];
  selectedRouteSlug: ConsultationRouteSlug | null;
  onRouteChange: (routeSlug: ConsultationRouteSlug) => void;
};

function getRouteChips(route: ConsultationRouteView): string[] {
  const chips = Array.from(new Set(route.options.flatMap((option) => option.chips)));

  if (route.slug === "fulltime") {
    return ["正社員", "対面", "オンライン"].filter((chip) => chips.includes(chip));
  }

  return chips.slice(0, 3);
}

export default function ConsultationRouteCards({
  routes,
  selectedRouteSlug,
  onRouteChange,
}: ConsultationRouteCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-1 min-[390px]:gap-1.5 sm:gap-3">
      {routes.map((route) => {
        const isSelected = route.slug === selectedRouteSlug;
        const theme = getConsultationRouteTheme(route.slug);
        const Icon = theme.icon;
        const chips = getRouteChips(route);

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
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 sm:h-7 sm:w-7",
                  theme.iconClassName,
                )}
                aria-hidden="true"
              />
              {isSelected && (
                <CheckCircle2
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 sm:h-5 sm:w-5",
                    theme.checkClassName,
                  )}
                  aria-hidden="true"
                />
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

            <div className="mt-1 flex flex-wrap gap-1 sm:mt-2">
              {chips.map((chip) => (
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
