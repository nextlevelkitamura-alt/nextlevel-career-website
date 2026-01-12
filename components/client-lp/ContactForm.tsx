"use client";

import { useState } from "react";
import { submitClientInquiry } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Controlled inputs just for clearing them after success if needed, 
    // though native form reset is often easier. Let's use form action directly.

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const result = await submitClientInquiry(formData);
        setIsLoading(false);

        if (result?.error) {
            alert(result.error);
        } else {
            setIsSuccess(true);
        }
    }

    if (isSuccess) {
        return (
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-slate-100 text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">お問い合わせありがとうございます</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                    送信が完了しました。<br />
                    内容を確認の上、担当者より通常2営業日以内にご連絡させていただきます。<br />
                    今しばらくお待ちください。
                </p>
                <div className="flex justify-center">
                    <Button
                        onClick={() => setIsSuccess(false)}
                        variant="outline"
                        className="border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                        お問い合わせフォームに戻る
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <section id="contact" className="py-20 lg:py-32 bg-slate-50">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-700 text-sm font-bold mb-4">
                            Contact
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                            採用に関するお問い合わせ
                        </h2>
                        <p className="text-slate-600 text-lg">
                            詳細な資料のご請求や、具体的な人材のご相談など、<br className="hidden md:block" />
                            まずはお気軽にお問い合わせください。
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-8 md:p-12">
                            <form action={handleSubmit} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                            貴社名 <span className="text-red-500 text-xs bg-red-50 px-1.5 py-0.5 rounded">必須</span>
                                        </label>
                                        <input
                                            name="company_name"
                                            required
                                            placeholder="例：株式会社Next Level"
                                            className="w-full h-12 px-4 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                            ご担当者名 <span className="text-red-500 text-xs bg-red-50 px-1.5 py-0.5 rounded">必須</span>
                                        </label>
                                        <input
                                            name="contact_person"
                                            required
                                            placeholder="例：採用 太郎"
                                            className="w-full h-12 px-4 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                            メールアドレス <span className="text-red-500 text-xs bg-red-50 px-1.5 py-0.5 rounded">必須</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            placeholder="example@company.co.jp"
                                            className="w-full h-12 px-4 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">
                                            電話番号 <span className="text-slate-400 text-xs font-normal">（任意）</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="03-1234-5678"
                                            className="w-full h-12 px-4 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                                        お問い合わせ内容 <span className="text-red-500 text-xs bg-red-50 px-1.5 py-0.5 rounded">必須</span>
                                    </label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={6}
                                        placeholder="採用したい職種、人数、時期、その他ご質問などをご記入ください。"
                                        className="w-full p-4 rounded-lg border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none"
                                    />
                                </div>

                                <div className="text-center pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full md:w-auto min-w-[300px] h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-full shadow-lg shadow-slate-900/10 transition-all transform hover:scale-105"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 送信中...</>
                                        ) : (
                                            <><Send className="w-5 h-5 mr-2" /> 送信内容を確認して送信</>
                                        )}
                                    </Button>
                                    <p className="mt-4 text-xs text-slate-500">
                                        ※送信することで、<a href="/privacy" className="underline hover:text-slate-800">プライバシーポリシー</a>に同意したものとみなされます。
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
