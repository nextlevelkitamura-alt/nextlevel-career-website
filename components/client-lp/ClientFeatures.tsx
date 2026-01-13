"use client";

import { Zap, Target, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        icon: <Target className="w-10 h-10 text-orange-500" />,
        title: "精度の高いマッチング",
        description: "スキルセットだけでなく、カルチャーフィットも重視。貴社の社風やビジョンに共感する人材をご紹介することで、定着率を高めます。",
        delay: 0
    },
    {
        icon: <Zap className="w-10 h-10 text-orange-500" />,
        title: "スピーディーな提案",
        description: "独自のデータベースとネットワークを活用し、最短即日での候補者推薦が可能。急な欠員や事業拡大に伴う増員のニーズに迅速に応えます。",
        delay: 0.1
    },
    {
        icon: <Users className="w-10 h-10 text-orange-500" />,
        title: "安心の返金保証制度",
        description: "万が一、紹介した人材が早期退職（入社後〇ヶ月以内）となった場合は、紹介手数料の一部を返金いたします。採用リスクを最小限に抑えます。",
        delay: 0.2
    },
    {
        icon: <TrendingUp className="w-10 h-10 text-orange-500" />,
        title: "完全成功報酬・返金保証",
        description: "採用決定まで費用は0円。さらに、万が一早期退職となってしまった場合の「返金保証規定」も設けており、採用のリスクを最小限に抑えます。",
        delay: 0.3
    }
];

export default function ClientFeatures() {
    return (
        <section id="features" className="py-20 lg:py-32 bg-slate-50">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-orange-600 font-bold tracking-wider uppercase text-sm"
                    >
                        Why Choose Us
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-6"
                    >
                        Next Level Careerが選ばれる理由
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-slate-600 text-lg"
                    >
                        単なる人材紹介にとどまらず、<br className="hidden md:block" />
                        貴社の採用パートナーとして事業成長に貢献します。
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: feature.delay }}
                            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                        >
                            <div className="bg-orange-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-orange-600 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
