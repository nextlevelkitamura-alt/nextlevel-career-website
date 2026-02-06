import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEmploymentTypeStyle(type: string) {
  if (type && type.includes("正社員")) {
    return "text-blue-600 border-blue-200 bg-white";
  }
  return "text-pink-600 border-pink-200 bg-white";
}
