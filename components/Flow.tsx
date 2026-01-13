"use client";

import { FileText, Building, Smile, Search, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
    {
        title: "会員登録",
        description: "まずはWebから簡単登録。1分で完了します。",
        icon: FileText,
    },
    {
        title: "選べる2つの活動スタイル",
        description: "ご希望に合わせて進め方を選べます",
        type: "branch",
        options: [
            {
                title: "アドバイザーに相談",
                description: "非公開求人の提案や選考対策など、プロがフルサポート。",
                icon: UserCheck,
                highlight: true,
            },
            {
                title: "気になる求人へ応募",
                description: "サイトから直接応募。自分のペースで進めたい方に。",
                icon: Search,
            }
        ]
    },
    {
        title: "選考・面接",
        description: "書類選考や面接へ進みます。日程調整もスムーズに。",
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
        <section id="flow" className="py-24 bg-slate-50 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
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
                            登録から入社まで、あなたのご希望に合わせたスタイルでサポートします。
                        </p>
                    </motion.div>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-slate-200 -z-10 rounded-full">
                        <motion.div
                            className="h-full bg-primary-200 origin-left rounded-full"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                className={`relative ${step.type === 'branch' ? 'md:-mt-12' : 'pt-4 md:pt-0'}`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                            >
                                {step.type === 'branch' ? (
                                    // Branch Step Logic
                                    <div className="md:pt-12">
                                        <div className="text-center mb-6 relative">
                                            <div className="inline-block px-3 py-1 rounded-full bg-primary-600 text-white text-xs font-bold mb-2 shadow-md">
                                                STEP {index + 1}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900">
                                                {step.title}
                                            </h3>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            {step.options?.map((option, optIndex) => (
                                                <div
                                                    key={optIndex}
                                                    className={`bg-white p-5 rounded-xl border-2 transition-all hover:shadow-lg ${option.highlight ? 'border-primary-100 shadow-md ring-1 ring-primary-50' : 'border-slate-100'}`}
                                                >
                                                    <div className="flex items-start gap-4 text-left">
                                                        <div className={`p-2 rounded-lg shrink-0 ${option.highlight ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                                                            <option.icon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 text-sm mb-1 flex items-center">
                                                                {option.title}
                                                                {option.highlight && (
                                                                    <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">人気</span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 leading-relaxed">
                                                                {option.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="text-center">
                                                <div className="inline-block bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">
                                                    どちらでもOK!
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Normal Step Logic
                                    <div className="bg-white md:bg-transparent p-6 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border md:border-none border-slate-100">
                                        <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-primary-100 flex items-center justify-center mb-6 shadow-sm relative z-10 transition-transform hover:scale-110 duration-300">
                                            {step.icon && <step.icon className="w-10 h-10 text-primary-600" />}
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
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Mobile Only Flow Connector for Branch */}
                    <div className="md:hidden text-center text-slate-300 my-4">
                        ↓
                    </div>
                </div>
            </div>
        </section>
    );
}
