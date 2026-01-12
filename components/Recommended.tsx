"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

const recommendations = [
    "オフィスワークに挑戦してみたい方",
    "安定した環境で長く働きたい方",
    "土日祝休みでプライベートも充実させたい方",
    "未経験からスキルを身につけたい方",
    "駅チカ・綺麗なオフィスで働きたい方",
];

export default function Recommended() {
    return (
        <section className="py-24 bg-slate-50">
            <div className="container mx-auto px-4">
                <motion.div
                    className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="md:w-1/2 relative min-h-[300px] md:min-h-full flex flex-col justify-center p-12 text-white">
                        <Image
                            src="/jobs-bg.jpg"
                            alt="Recommended Background"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-primary-900/80 mix-blend-multiply"></div>

                        <div className="relative z-10">
                            <span className="font-bold tracking-widest text-sm block mb-2 text-primary-200">RECOMMENDED</span>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                                こんな方に<br />おすすめです
                            </h2>
                            <p className="text-primary-100 text-lg leading-relaxed">
                                Next Level Careerは、あなたの「変わりたい」という気持ちを全力で応援します。
                            </p>
                        </div>
                    </div>
                    <div className="md:w-1/2 p-12 md:p-16 flex flex-col justify-center bg-white">
                        <ul className="space-y-6">
                            {recommendations.map((item, index) => (
                                <motion.li
                                    key={index}
                                    className="flex items-start"
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                                >
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center mt-0.5 mr-4">
                                        <Check className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <span className="text-slate-700 font-bold text-lg">{item}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
