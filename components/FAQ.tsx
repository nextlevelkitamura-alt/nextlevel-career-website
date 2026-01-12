"use client";

import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
    {
        question: "サービスの利用に費用はかかりますか？",
        answer: "いいえ、求職者の方は完全無料でご利用いただけます。登録から内定後のサポートまで、一切費用はかかりませんのでご安心ください。",
    },
    {
        question: "今すぐ転職するつもりはないですが、登録できますか？",
        answer: "はい、可能です。まずは情報収集やキャリア相談だけという方も大歓迎です。良い求人があれば検討したいというスタンスでも問題ありません。",
    },
    {
        question: "未経験でも紹介してもらえる求人はありますか？",
        answer: "はい、未経験OKの求人も多数取り扱っております。研修制度が充実している企業の求人も多いので、安心してチャレンジしていただけます。",
    },
    {
        question: "在職中でも利用できますか？",
        answer: "はい、多くの方が在職中にご利用されています。面接日程の調整なども、お仕事の都合に合わせて柔軟に対応いたします。",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="text-primary-600 font-bold tracking-widest text-xs block mb-2">FAQ</span>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        よくある質問
                    </h2>
                    <p className="text-slate-600">
                        皆様から寄せられる質問にお答えします。
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className={`w-full flex items-center justify-between p-6 text-left font-bold transition-colors ${openIndex === index ? "bg-primary-50 text-primary-900" : "bg-white text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                <span className="text-lg">{faq.question}</span>
                                {openIndex === index ? (
                                    <Minus className="w-5 h-5 text-primary-600 flex-shrink-0 ml-4" />
                                ) : (
                                    <Plus className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />
                                )}
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="p-6 pt-0 bg-primary-50 text-slate-700 leading-relaxed border-t border-primary-100/50">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
