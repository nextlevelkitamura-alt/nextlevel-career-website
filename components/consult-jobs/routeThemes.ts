import type { ConsultationRouteSlug } from "@/app/consult-jobs/actions";
import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, CircleHelp, UsersRound } from "lucide-react";

export type ConsultationRouteTheme = {
  icon: LucideIcon;
  iconClassName: string;
  activeClassName: string;
  cardHoverClassName: string;
  chipClassName: string;
  checkClassName: string;
  focusRingClassName: string;
  modeSelectedClassName: string;
  modeIdleClassName: string;
  slotCardClassName: string;
  slotIconClassName: string;
  slotLabelClassName: string;
  slotButtonClassName: string;
};

export const CONSULTATION_ROUTE_THEMES = {
  dispatch: {
    icon: UsersRound,
    iconClassName: "text-orange-600",
    activeClassName: "border-orange-500 bg-orange-50 shadow-orange-100",
    cardHoverClassName: "hover:border-orange-200 hover:bg-orange-50/60",
    chipClassName: "border-orange-200 bg-orange-50 text-orange-700",
    checkClassName: "text-orange-600",
    focusRingClassName: "focus-visible:ring-orange-500",
    modeSelectedClassName: "bg-orange-600 text-white",
    modeIdleClassName: "bg-white text-slate-800 hover:bg-orange-50 hover:text-orange-700",
    slotCardClassName: "border-orange-200",
    slotIconClassName: "bg-orange-50 text-orange-600",
    slotLabelClassName: "text-orange-600",
    slotButtonClassName: "bg-orange-600 text-white shadow-md shadow-orange-100 hover:bg-orange-700",
  },
  fulltime: {
    icon: BriefcaseBusiness,
    iconClassName: "text-blue-600",
    activeClassName: "border-blue-500 bg-blue-50 shadow-blue-100",
    cardHoverClassName: "hover:border-blue-200 hover:bg-blue-50/60",
    chipClassName: "border-blue-200 bg-blue-50 text-blue-700",
    checkClassName: "text-blue-600",
    focusRingClassName: "focus-visible:ring-blue-500",
    modeSelectedClassName: "bg-blue-600 text-white",
    modeIdleClassName: "bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-700",
    slotCardClassName: "border-blue-200",
    slotIconClassName: "bg-blue-50 text-blue-600",
    slotLabelClassName: "text-blue-600",
    slotButtonClassName: "bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700",
  },
  undecided: {
    icon: CircleHelp,
    iconClassName: "text-purple-600",
    activeClassName: "border-purple-500 bg-purple-50 shadow-purple-100",
    cardHoverClassName: "hover:border-purple-200 hover:bg-purple-50/60",
    chipClassName: "border-purple-200 bg-purple-50 text-purple-700",
    checkClassName: "text-purple-600",
    focusRingClassName: "focus-visible:ring-purple-500",
    modeSelectedClassName: "bg-purple-600 text-white",
    modeIdleClassName: "bg-white text-slate-800 hover:bg-purple-50 hover:text-purple-700",
    slotCardClassName: "border-purple-200",
    slotIconClassName: "bg-purple-50 text-purple-600",
    slotLabelClassName: "text-purple-600",
    slotButtonClassName: "bg-purple-600 text-white shadow-md shadow-purple-100 hover:bg-purple-700",
  },
} satisfies Record<ConsultationRouteSlug, ConsultationRouteTheme>;

export function getConsultationRouteTheme(routeSlug: ConsultationRouteSlug | null | undefined): ConsultationRouteTheme {
  return routeSlug ? CONSULTATION_ROUTE_THEMES[routeSlug] : CONSULTATION_ROUTE_THEMES.dispatch;
}
