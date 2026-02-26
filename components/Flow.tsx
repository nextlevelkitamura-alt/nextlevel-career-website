"use client";

import { FileText, UserCheck, Building, Smile, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "./ui/button";

const steps = [
    {
        number: 1,
        title: "会員登録",
        description: "Webから約1分で完了。非公開求人の閲覧が可能に。",
        icon: FileText,
        color: "from-blue-500 to-blue-600",
    },
    {
        number: 2,
        title: "相談・求人紹介",
        description: "アドバイザーに相談、または自分で求人を探せます。",
        icon: UserCheck,
        color: "from-primary-500 to-primary-600",
    },
    {
        number: 3,
        title: "選考・面接",
        description: "書類添削・面接対策・日程調整まで全面サポート。",
        icon: Building,
        color: "from-green-500 to-green-600",
    },
    {
        number: 4,
        title: "内定・入社",
        description: "条件交渉から入社後のフォローまで長期サポート。",
        icon: Smile,
        color: "from-yellow-500 to-orange-500",
    },
];

export default function Flow() {
    return (
        <section id="flow" className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-primary-600 font-bold tracking-widest text-xs block mb-2">FLOW</span>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            ご利用の流れ
                        </h2>
                        <p className="text-slate-600 max-w-xl mx-auto leading-relaxed text-sm">
                            登録から入社まで、すべて無料。専任アドバイザーがあなたのペースに合わせてサポートします。
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="relative"
                        >
                            {/* Connector arrow (desktop only) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:flex absolute -right-3 top-10 z-10 text-slate-300">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            )}

                            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 text-center h-full flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md mb-3`}>
                                    <step.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded mb-2">
                                    STEP {step.number}
                                </span>
                                <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <Button asChild size="lg" className="bg-primary-600 hover:bg-primary-700 text-white font-bold h-14 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                        <Link href="/flow">
                            サービスの流れを詳しく見る <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
