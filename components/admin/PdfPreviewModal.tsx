"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { FormPdfData } from "@/lib/pdf/helpers/formToJobData";

type PdfStyle = "detailed" | "modern";

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormPdfData;
}

export default function PdfPreviewModal({ isOpen, onClose, formData }: PdfPreviewModalProps) {
  const [style, setStyle] = useState<PdfStyle>("detailed");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePreview = useCallback(async (selectedStyle: PdfStyle) => {
    setLoading(true);
    setBlobUrl(null);
    try {
      const response = await fetch("/api/jobs/pdf/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobData: formData, style: selectedStyle }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "PDF生成に失敗" }));
        throw new Error(err.error || "PDF生成に失敗しました");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "PDF生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [formData]);

  // モーダルが開かれた時 or テンプレートが変更された時にPDFを生成
  useEffect(() => {
    if (isOpen) {
      generatePreview(style);
    }
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, style]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    const styleName = style === "modern" ? "モダン" : "詳細";
    a.download = `求人票_${formData.job_code || "preview"}_${styleName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("PDFをダウンロードしました");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-4">
            <FileText className="w-5 h-5 text-slate-600" />
            <h2 className="text-base font-bold text-slate-800">PDF プレビュー</h2>

            {/* テンプレート切替タブ */}
            <div className="flex bg-slate-200 rounded-lg p-0.5 ml-2">
              <button
                type="button"
                onClick={() => setStyle("detailed")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  style === "detailed"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                詳細スタイル
              </button>
              <button
                type="button"
                onClick={() => setStyle("modern")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  style === "modern"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                モダンスタイル
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!blobUrl || loading}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" />
              ダウンロード
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* PDFプレビューエリア */}
        <div className="flex-1 bg-slate-300/30 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                <p className="text-sm text-slate-500">PDF生成中...</p>
              </div>
            </div>
          ) : blobUrl ? (
            <iframe
              src={blobUrl}
              className="w-full h-full border-none"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-slate-400">PDFの読み込みに失敗しました</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
