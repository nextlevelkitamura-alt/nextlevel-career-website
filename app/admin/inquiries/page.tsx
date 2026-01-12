import { getClientInquiries, updateInquiryStatus } from "@/app/admin/actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import InquiryStatusSelect from "./InquiryStatusSelect"; // We'll make this small client component for updates

export const dynamic = 'force-dynamic';

export default async function AdminInquiriesPage() {
    const inquiries = await getClientInquiries();

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">企業お問い合わせ一覧</h1>
                <Link href="/admin/jobs">
                    <Button variant="outline">求人管理へ戻る</Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ステータス</TableHead>
                            <TableHead>日時</TableHead>
                            <TableHead>会社名 / 担当者</TableHead>
                            <TableHead>連絡先</TableHead>
                            <TableHead className="w-[400px]">内容</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inquiries && inquiries.length > 0 ? (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            inquiries.map((inquiry: any) => (
                                <TableRow key={inquiry.id}>
                                    <TableCell>
                                        <InquiryStatusSelect id={inquiry.id} currentStatus={inquiry.status} />
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">
                                        {new Date(inquiry.created_at).toLocaleString('ja-JP')}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold">{inquiry.company_name}</div>
                                        <div className="text-sm text-slate-500">{inquiry.contact_person} 様</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{inquiry.email}</div>
                                        <div className="text-sm text-slate-500">{inquiry.phone}</div>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <div className="whitespace-pre-wrap text-sm max-h-[150px] overflow-y-auto">
                                            {inquiry.message}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    お問い合わせはまだありません
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
