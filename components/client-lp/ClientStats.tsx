"use client";

import { motion } from "framer-motion";

const stats = [
    { label: "導入企業数", value: "300", suffix: "社以上", delay: 0 },
    { label: "平均マッチング期間", value: "5", suffix: "営業日", delay: 0.1 },
    { label: "紹介人材プール", value: "10,000", suffix: "名超", delay: 0.2 },
];

export default function ClientStats() {
    return (
        <section className="bg-slate-900 border-b border-slate-800 relative z-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 border-x border-slate-800">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5, delay: stat.delay }}
                            className="flex flex-col items-center justify-center py-8 px-2 text-center group hover:bg-slate-800/50 transition-colors cursor-default"
                        >
                            <span className="text-slate-400 text-xs sm:text-sm font-medium mb-2 tracking-wider uppercase">
                                {stat.label}
                            </span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
                                    {stat.value}
                                </span>
                                <span className="text-sm text-slate-500 font-medium">
                                    {stat.suffix}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
