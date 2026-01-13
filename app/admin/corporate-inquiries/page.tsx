import { getClientInquiries } from "../actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import InquiriesList from "./InquiriesList";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
    const inquiries = await getClientInquiries();

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">企業問い合わせ一覧</h1>
                <Link href="/admin/jobs">
                    <Button variant="outline">求人一覧に戻る</Button>
                </Link>
            </div>

            <InquiriesList initialInquiries={inquiries} />
        </div>
    );
}
