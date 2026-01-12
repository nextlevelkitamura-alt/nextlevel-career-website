"use client";

import { FileText, MessageCircle, Building, Smile } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
    {
        title: "会員登録",
        description: "まずはWebから簡単登録。1分で完了します。",
        icon: FileText,
    },
    {
        title: "カウンセリング",
        description: "アドバイザーと面談し、希望条件をヒアリング。",
        icon: MessageCircle,
    },
    {
        title: "求人紹介・応募",
        description: "あなたにぴったりの求人をご紹介します。",
        icon: Building,
    },
    {
        title: "内定・入社",
        description: "条件交渉や入社日の調整もお任せください。",
        icon: Smile,
    },
];

export default function Flow() {
    return (
        <section id="flow" className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
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
                        <p className="text-slate-600">
                            登録から入社まで、スムーズにサポートします。
                        </p>
                    </motion.div>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-100 -z-10">
                        <motion.div
                            className="h-full bg-primary-200 origin-left"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                className="relative bg-white md:bg-transparent pt-4 md:pt-0"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                            >
                                <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-primary-100 flex items-center justify-center mb-6 shadow-sm relative z-10 transition-transform hover:scale-110 duration-300">
                                    <step.icon className="w-10 h-10 text-primary-600" />
                                </div>
                                <div className="text-center">
                                    <div className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold mb-3">
                                        STEP {index + 1}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
