"use client";

import { motion } from "framer-motion";
import { Users, Building2, TrendingUp, PieChart, ArrowDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClientStats() {
    return (
        <section className="py-20 lg:py-24 bg-slate-50 border-t border-slate-100">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        数字で見る Next Level Career
                    </h2>
                    <p className="text-slate-600 mb-8">
                        圧倒的な登録者数と若手層へのリーチ力で、貴社の採用を強力にバックアップします。
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {/* Stat 1: Total Users */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                    >
                        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6">
                            <Users className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">現在の登録者数</p>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl lg:text-5xl font-black text-slate-900">400</span>
                            <span className="text-xl font-bold text-slate-600">万人</span>
                        </div>
                        <p className="text-xs text-blue-600 font-bold mt-2 bg-blue-50 px-2 py-1 rounded">突破！</p>
                    </motion.div>

                    {/* Stat 2: Monthly New */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                    >
                        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6">
                            <TrendingUp className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">毎月の新規会員</p>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl lg:text-5xl font-black text-slate-900">40,000</span>
                            <span className="text-xl font-bold text-slate-600">人</span>
                        </div>
                        <p className="text-xs text-green-600 font-bold mt-2 bg-green-50 px-2 py-1 rounded">平均実績</p>
                    </motion.div>

                    {/* Stat 3: Demographics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                        <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-6">
                            <PieChart className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">10代〜30代比率</p>
                        <div className="flex items-baseline justify-center gap-1 relative z-10">
                            <span className="text-4xl lg:text-5xl font-black text-slate-900">80</span>
                            <span className="text-xl font-bold text-slate-600">%</span>
                        </div>
                        <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full w-[80%]" />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 w-full px-2">
                            <span>若手層</span>
                            <span>その他 20%</span>
                        </div>
                    </motion.div>

                    {/* Stat 4: Group Companies */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                    >
                        <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-6">
                            <Building2 className="w-7 h-7" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">グループ企業数</p>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl lg:text-5xl font-black text-slate-900">40</span>
                            <span className="text-xl font-bold text-slate-600">社</span>
                        </div>
                        <p className="text-xs text-purple-600 font-bold mt-2 bg-purple-50 px-2 py-1 rounded">安定基盤</p>
                    </motion.div>
                </div>

                <div className="text-center">
                    <Link href="#contact">
                        <Button variant="outline" size="lg" className="rounded-full px-8 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-white hover:border-slate-400">
                            採用について相談する
                            <ArrowDown className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
