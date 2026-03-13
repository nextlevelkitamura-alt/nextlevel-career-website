"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useRef, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { deleteJob, deleteJobs } from "../actions/jobs";

type Job = {
    id: string;
    job_code: string | null;
    title: string;
    area: string | null;
    salary: string | null;
    pdf_url: string | null;
    clients: { name: string } | null;
    job_attachments: { id: string }[];
};

export default function JobsTable({ jobs }: { jobs: Job[] }) {
    const router = useRouter();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();

    // ドラッグ選択用
    const isDragging = useRef(false);
    const dragSelectMode = useRef<boolean>(true); // true=選択, false=解除
    const dragStartIndex = useRef<number>(-1);

    const allSelected = jobs.length > 0 && selected.size === jobs.length;

    function toggleAll() {
        if (allSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(jobs.map((j) => j.id)));
        }
    }

    function toggleOne(id: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    // チェックボックスセルでマウスダウン → ドラッグ開始
    const handleCheckMouseDown = useCallback((index: number, id: string) => {
        isDragging.current = true;
        dragStartIndex.current = index;
        // 現在の選択状態の逆をドラッグモードにする
        dragSelectMode.current = !selected.has(id);
        // まず押した行をトグル
        setSelected((prev) => {
            const next = new Set(prev);
            if (dragSelectMode.current) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    }, [selected]);

    // マウスがチェックボックスセルに入ったらドラッグ中なら選択/解除
    const handleCheckMouseEnter = useCallback((id: string) => {
        if (!isDragging.current) return;
        setSelected((prev) => {
            const next = new Set(prev);
            if (dragSelectMode.current) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    }, []);

    // マウスアップでドラッグ終了（document レベルで捕捉）
    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        dragStartIndex.current = -1;
    }, []);

    function handleBulkDelete() {
        if (selected.size === 0) return;
        if (!window.confirm(`${selected.size}件の求人を削除しますか？この操作は取り消せません。`)) return;
        startTransition(async () => {
            await deleteJobs(Array.from(selected));
            setSelected(new Set());
            router.refresh();
        });
    }

    function handleSingleDelete(e: React.MouseEvent, id: string) {
        e.stopPropagation();
        if (!window.confirm("この求人を削除しますか？")) return;
        startTransition(async () => {
            await deleteJob(id);
            setSelected((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
            router.refresh();
        });
    }

    function handleRowClick(id: string) {
        router.push(`/admin/jobs/${id}/edit`);
    }

    return (
        <>
            {selected.size > 0 && (
                <div className="mb-4 flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="text-sm font-medium text-red-800">
                        {selected.size}件選択中
                    </span>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={isPending}
                    >
                        <Trash2 className="w-4 h-4 mr-1" />
                        一括削除
                    </Button>
                    <button
                        className="text-sm text-slate-500 hover:text-slate-700 ml-auto"
                        onClick={() => setSelected(new Set())}
                    >
                        選択解除
                    </button>
                </div>
            )}

            {/* onMouseUp を外側の div で捕捉してドラッグ終了 */}
            <div
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto"
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <table className="w-full text-left border-collapse select-none">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th
                                className="p-4 w-12 cursor-pointer"
                                onClick={toggleAll}
                            >
                                <div className="flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        className="rounded border-slate-300 w-4 h-4 cursor-pointer"
                                    />
                                </div>
                            </th>
                            <th className="p-4 font-semibold text-slate-700">ID</th>
                            <th className="p-4 font-semibold text-slate-700">求人元</th>
                            <th className="p-4 font-semibold text-slate-700">タイトル</th>
                            <th className="p-4 font-semibold text-slate-700">エリア</th>
                            <th className="p-4 font-semibold text-slate-700">PDF</th>
                            <th className="p-4 font-semibold text-slate-700">給与</th>
                            <th className="p-4 font-semibold text-slate-700 text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs && jobs.length > 0 ? (
                            jobs.map((job, index) => (
                                <tr
                                    key={job.id}
                                    className={`border-b border-slate-100 cursor-pointer transition-colors ${
                                        selected.has(job.id)
                                            ? "bg-primary-50"
                                            : "hover:bg-slate-50"
                                    }`}
                                    onClick={() => handleRowClick(job.id)}
                                >
                                    {/* チェックボックスセル: クリック領域を広く、ドラッグ選択対応 */}
                                    <td
                                        className="p-4 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleOne(job.id);
                                        }}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            handleCheckMouseDown(index, job.id);
                                        }}
                                        onMouseEnter={() => handleCheckMouseEnter(job.id)}
                                    >
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={selected.has(job.id)}
                                                onChange={() => toggleOne(job.id)}
                                                className="rounded border-slate-300 w-4 h-4 pointer-events-none"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-sm text-slate-500">
                                        {job.job_code || "-"}
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">
                                        {job.clients?.name ? (
                                            <span className="inline-block px-2 py-1 bg-slate-100 rounded text-slate-700">
                                                {job.clients.name}
                                            </span>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 font-medium text-slate-900">{job.title}</td>
                                    <td className="p-4 text-slate-600">{job.area}</td>
                                    <td className="p-4 text-slate-600">
                                        {(job.job_attachments && job.job_attachments.length > 0) || job.pdf_url ? (
                                            <span className="text-primary-600" title="PDFあり">📄</span>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-600">{job.salary}</td>
                                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/jobs/${job.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-primary-600 hover:bg-primary-50"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/admin/jobs/${job.id}/edit`}>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-primary-600 hover:bg-primary-50"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={(e) => handleSingleDelete(e, job.id)}
                                                disabled={isPending}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-slate-500">
                                    求人がまだ登録されていません。
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
