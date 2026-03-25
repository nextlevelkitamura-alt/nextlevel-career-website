"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, ChevronDown, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PdfDownloadButtonProps {
  jobId: string;
}

export default function PdfDownloadButton({ jobId }: PdfDownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownload = async (style: "detailed" | "modern") => {
    setLoading(style);
    setIsOpen(false);
    try {
      const response = await fetch(`/api/jobs/${jobId}/pdf?style=${style}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "PDF生成に失敗しました" }));
        throw new Error(error.error || "PDF生成に失敗しました");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Content-Dispositionからファイル名を取得
      const disposition = response.headers.get("Content-Disposition");
      const fileNameMatch = disposition?.match(/filename="(.+)"/);
      a.download = fileNameMatch ? decodeURIComponent(fileNameMatch[1]) : `求人票_${style}.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("PDFをダウンロードしました");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PDF生成に失敗しました");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading !== null}
        className="gap-1.5"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        PDF
        <ChevronDown className="w-3 h-3" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
          <button
            onClick={() => handleDownload("detailed")}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-3 transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <div>
              <div className="font-medium text-slate-900">詳細スタイル</div>
              <div className="text-xs text-slate-500">公式求人票フォーマット</div>
            </div>
          </button>
          <button
            onClick={() => handleDownload("modern")}
            className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-3 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <div>
              <div className="font-medium text-slate-900">モダンスタイル</div>
              <div className="text-xs text-slate-500">クリーンデザイン</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
