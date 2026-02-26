"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { buildCalComUrl } from "@/utils/calcom";

export default function RegisterSuccessPage() {
    const consultationUrl = useMemo(() => {
        const calSlug = process.env.NEXT_PUBLIC_CALCOM_CONSULT_URL;
        if (calSlug) {
            return buildCalComUrl(calSlug, {
                clickType: "consult",
            });
        }
        return "https://calendar.app.google/S6VCR33nZNE14Udw6";
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12">
            <div className="container mx-auto px-4 max-w-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </motion.div>

                    <h1 className="text-2xl font-bold text-slate-900 mb-4">
                        会員登録が完了しました！
                    </h1>

                    <p className="text-slate-600 mb-6">
                        ご登録いただきありがとうございます。<br />
                        早速、求人情報をご覧ください。
                    </p>

                    <div className="space-y-6">
                        {/* Interview Booking Section */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                            <h2 className="font-bold text-slate-800 mb-4 text-center">面談の予約をする</h2>
                            <p className="text-xs text-slate-500 mb-4 text-center">
                                ご希望の方法でキャリアアドバイザーと面談が可能です。
                            </p>
                            <div className="grid grid-cols-1 gap-3">
                                <a href={consultationUrl} target="_blank" rel="noopener noreferrer" className="block">
                                    <Button className="w-full h-14 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 hover:text-primary-600 font-bold text-lg shadow-sm">
                                        📅 面談予約はこちらから
                                    </Button>
                                </a>
                            </div>
                        </div>

                        {/* Immediate Call Section */}
                        <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                            <h2 className="font-bold text-orange-800 mb-2 text-center">お急ぎの方はこちら</h2>
                            <p className="text-xs text-orange-700 mb-4 text-center">
                                今すぐお電話で相談したい方はこちらからご連絡ください。
                            </p>
                            <a href="tel:08070503019" className="block">
                                <Button className="w-full h-14 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-lg shadow-lg shadow-orange-500/20">
                                    📞 今すぐ電話で相談する
                                </Button>
                            </a>
                            <p className="text-[10px] text-orange-600 mt-2 text-center">
                                受付時間: 平日 10:00 - 19:00
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <Link href="/jobs" className="block text-center text-primary-600 font-bold hover:underline text-sm mb-4">
                                とりあえず求人を見る
                            </Link>
                            <Link href="/" className="block text-center text-slate-400 hover:text-slate-600 text-xs">
                                トップページへ戻る
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
