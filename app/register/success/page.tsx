"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function RegisterSuccessPage() {
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

                    <div className="space-y-3">
                        <Link href="/jobs" className="block">
                            <Button className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold">
                                求人を探す
                            </Button>
                        </Link>
                        <Link href="/" className="block">
                            <Button variant="outline" className="w-full h-12 text-slate-600 border-slate-300 hover:bg-slate-50">
                                トップページへ
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
