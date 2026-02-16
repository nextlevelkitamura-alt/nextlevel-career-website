import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEmploymentTypeStyle(type: string) {
  // 正社員系: 青系統（ソリッド）- text-white bg-blue-600
  if (type && (type.includes("正社員") || type.includes("正職員"))) {
    return "text-white bg-blue-600 border-blue-600";
  }
  // 派遣系: グレー系統（ソリッド）- text-white bg-slate-700
  if (type && type.includes("派遣")) {
    return "text-white bg-slate-700 border-slate-700";
  }
  // その他: グレー
  return "text-slate-600 bg-slate-100 border-slate-200";
}

export function getJobTagStyle(type: string) {
  // 正社員系: 青系統（淡い背景）
  if (type && (type.includes("正社員") || type.includes("正職員"))) {
    return "text-blue-700 bg-blue-50 border-blue-200";
  }
  // 派遣系: グレー系統（淡い背景）
  if (type && type.includes("派遣")) {
    return "text-slate-700 bg-slate-50 border-slate-200";
  }
  // その他: グレー
  return "text-slate-600 bg-slate-50 border-slate-200";
}
