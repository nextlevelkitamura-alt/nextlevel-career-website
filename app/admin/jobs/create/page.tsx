"use client";

import { createJob } from "../../actions";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import FileUploader from "@/components/admin/FileUploader";
import ClientSelect from "@/components/admin/ClientSelect";

export default function CreateJobPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);

        if (files.length > 0) {
            files.forEach(file => {
                formData.append("pdf_files", file);
            });
        }

        const result = await createJob(formData);
        setIsLoading(false);

        if (result?.error) {
            alert(result.error);
        } else {
            router.push("/admin/jobs");
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">求人新規作成</h1>
                <Link href="/admin/jobs">
                    <Button variant="outline">キャンセル</Button>
                </Link>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">求人タイトル</label>
                        <input
                            name="title"
                            required
                            className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="例：【未経験OK】一般事務スタッフ"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">求人票・画像（任意）</label>
                        <FileUploader
                            onFileSelect={(files) => setFiles(files)}
                            multiple={true}
                            accept={{
                                "application/pdf": [".pdf"],
                                "image/jpeg": [".jpg", ".jpeg"],
                                "image/png": [".png"],
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">エリア</label>
                            <input
                                name="area"
                                required
                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="例：東京"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">雇用形態</label>
                            <select
                                name="type"
                                required
                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            >
                                <option value="派遣">派遣</option>
                                <option value="正社員">正社員</option>
                                <option value="紹介予定派遣">紹介予定派遣</option>
                                <option value="契約社員">契約社員</option>
                                <option value="アルバイト・パート">アルバイト・パート</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">給与</label>
                            <input
                                name="salary"
                                required
                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="例：時給 1,600円〜"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">職種カテゴリー</label>
                            <select
                                name="category"
                                required
                                className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            >
                                <option value="事務">事務</option>
                                <option value="コールセンター">コールセンター</option>
                                <option value="営業">営業</option>
                                <option value="IT・エンジニア">IT・エンジニア</option>
                                <option value="クリエイティブ">クリエイティブ</option>
                                <option value="販売・接客">販売・接客</option>
                                <option value="その他">その他</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">タグ（スペース区切り）</label>
                        <input
                            name="tags"
                            className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="例：未経験OK 駅チカ 残業少なめ"
                        />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="font-bold text-lg text-slate-800">詳細情報</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">仕事内容</label>
                            <textarea
                                name="description"
                                rows={5}
                                className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="詳しい業務内容を入力してください"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">応募資格・条件</label>
                            <textarea
                                name="requirements"
                                rows={4}
                                className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="必須スキルや歓迎スキルなどを入力してください"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">勤務時間</label>
                            <textarea
                                name="working_hours"
                                rows={2}
                                className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="例：9:00〜18:00（休憩1時間）"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">休日・休暇</label>
                            <textarea
                                name="holidays"
                                rows={2}
                                className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="例：完全週休2日制（土日祝）"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">福利厚生</label>
                            <textarea
                                name="benefits"
                                rows={3}
                                className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="例：交通費全額支給、社会保険完備"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">選考プロセス</label>
                            <textarea
                                name="selection_process"
                                rows={3}
                                className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="例：書類選考 → 面接（1回） → 内定"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-100">
                        <label className="text-sm font-bold text-slate-700">求人元（取引先）<span className="text-xs font-normal text-slate-500 ml-2">※非公開</span></label>
                        <ClientSelect name="client_id" />
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold"
                            disabled={isLoading}
                        >
                            {isLoading ? "作成中..." : "求人を作成する"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
