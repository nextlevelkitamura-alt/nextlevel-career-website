import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEmploymentTypeStyle(type: string) {
  // 正社員系: 青系統
  if (type && (type.includes("正社員") || type.includes("正職員"))) {
    return "text-blue-600 border-blue-200 bg-white";
  }
  // 派遣系: ピンク系統
  if (type && type.includes("派遣")) {
    return "text-pink-600 border-pink-200 bg-white";
  }
  // デフォルト: ピンク系統
  return "text-pink-600 border-pink-200 bg-white";
}

export function getJobTagStyle(type: string) {
  // 正社員系: 青系統
  if (type && (type.includes("正社員") || type.includes("正職員"))) {
    return "text-blue-600 bg-blue-50 border-blue-200";
  }
  // 派遣系: ピンク系統
  if (type && type.includes("派遣")) {
    return "text-pink-600 bg-pink-50 border-pink-200";
  }
  // デフォルト: ピンク系統
  return "text-pink-600 bg-pink-50 border-pink-200";
}
