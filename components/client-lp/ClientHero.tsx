"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock, Users, ShieldCheck, ArrowRight } from "lucide-react";

export default function ClientHero() {
    return (
        <section className="relative bg-white py-20 lg:py-32 overflow-hidden">
            <div className="container relative z-10 px-4 md:px-6 mx-auto">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 mb-8"
                    >
                        <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                        <span className="text-primary-800 text-sm font-bold tracking-wide">
                            法人のお客様（採用担当者様）へ
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-8 leading-tight"
                    >
                        「スピード」と「定着率」で、<br className="hidden md:block" />
                        組織を<span className="relative inline-block text-primary-600 px-2">
                            次のレベル
                            <span className="absolute bottom-1 left-0 w-full h-3 bg-primary-100 -z-10 transform -rotate-1"></span>
                        </span>へ。
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto font-medium"
                    >
                        豊富な独自人材プールから、貴社に最適な即戦力を<br className="hidden md:block" />
                        <span className="font-bold text-slate-900">最短即日</span>でご紹介します。
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm"
                    >
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">圧倒的なスピード</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                ご依頼から最短即日でのご紹介が可能。急な欠員にも迅速に対応します。
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">人材の抱え込み</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                独自のネットワークで、他媒体にいない層へアプローチ。豊富な人材プール。
                            </p>
                        </div>
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">ミスマッチ&quot;ゼロ&quot;へ</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                スキルだけでなく志向性も深く分析。高い定着率を実現します。
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                    >
                        <Link href="#contact">
                            <Button size="lg" className="h-16 px-10 text-xl bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full shadow-xl shadow-slate-200 transition-all transform hover:scale-105 group">
                                今すぐ問い合わせる
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <p className="mt-4 text-sm text-slate-500 font-medium">
                            ※ ご相談は無料です。お気軽にお問い合わせください。
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-50 -z-10 skew-x-12 transform translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -z-10 transform -translate-x-1/2 translate-y-1/2" />
        </section>
    );
}
