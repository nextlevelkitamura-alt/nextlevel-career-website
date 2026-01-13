import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import DraftFileManager from "@/components/admin/DraftFileManager";

export default function PreRegistrationPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/jobs">
                        <Button variant="ghost" size="icon" className="text-slate-500">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">求人ファイル事前登録</h1>
                </div>
                <Link href="/admin/jobs">
                    <Button variant="outline">求人一覧へ戻る</Button>
                </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <DraftFileManager />
            </div>
        </div>
    );
}
