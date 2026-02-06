import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEmploymentTypeStyle(type: string) {
  if (type === "正社員") {
    return "text-sky-600 border-sky-200 bg-white";
  }
  return "text-pink-600 border-pink-200 bg-white";
}
