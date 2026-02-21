import { getJob } from "../../../actions";
import EditJobForm from "./EditJobForm";
import RepairDetailsButton from "./RepairDetailsButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function EditJobPage({ params }: { params: { id: string } }) {
    const job = await getJob(params.id);

    // 詳細テーブルの存在チェック
    const isFulltime = job.type === "正社員" || job.type === "契約社員";
    const isDispatch = job.type === "派遣" || job.type === "紹介予定派遣";
    const fd = job.fulltime_job_details?.[0];
    const dd = job.dispatch_job_details?.[0];
    const missingDetails = (isFulltime && !fd) || (isDispatch && !dd);

    return (
        <div className="max-w-6xl mx-auto">
            {missingDetails && (
                <div className="mb-4 bg-orange-50 border-2 border-orange-400 rounded-lg p-4">
                    <p className="font-bold text-orange-800">
                        {isFulltime ? "正社員" : "派遣"}詳細データがDBに保存されていません
                    </p>
                    <p className="text-orange-700 text-sm mt-1">
                        「自動修復」ボタンでAI抽出データから詳細レコードを作成できます。
                        または「AI読込」で再抽出してください。
                    </p>
                    <div className="mt-3">
                        <RepairDetailsButton jobId={params.id} />
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">求人編集</h1>
                <Link href="/admin/jobs">
                    <Button variant="outline">キャンセル</Button>
                </Link>
            </div>

            <EditJobForm job={job} />
        </div>
    );
}
