"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HighlightCardsManager } from "./HighlightCardsManager";

// スタンドアロンページ（/admin/highlight-cards へ直接アクセス時）
export default function HighlightCardsPage() {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">ハイライトカード管理</h1>
                <Link href="/admin/banners">
                    <Button variant="outline">バナー管理に戻る</Button>
                </Link>
            </div>
            <HighlightCardsManager />
        </div>
    );
}
