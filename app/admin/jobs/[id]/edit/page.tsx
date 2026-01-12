import { getJob } from "../../../actions";
import EditJobForm from "./EditJobForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function EditJobPage({ params }: { params: { id: string } }) {
    const job = await getJob(params.id);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">求人編集</h1>
                <Link href="/admin/jobs">
                    <Button variant="outline">キャンセル</Button>
                </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <EditJobForm job={job} />
            </div>
        </div>
    );
}
