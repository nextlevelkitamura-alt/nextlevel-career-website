"use client";

import { CheckCircle2 } from "lucide-react";

type ResultType = "A" | "B" | "C" | "D";

type TypeData = {
    title: string;
    subtitle: string;
    description: string;
    features: string[];
    color: string;
    bg: string;
    badge: string;
};

const typeDetails: Record<ResultType, TypeData> = {
    A: {
        title: "コツコツ・キャリアタイプ",
        subtitle: "安定重視",
        description: "あなたは一つの場所でじっくりと腰を据えて働くことに適性があります。明確なルールのもと、着実にスキルを積み上げていくことで、将来的に大きな信頼と成果を得られるでしょう。プライベートも大切にしつつ、安定した基盤を築きたい方にピッタリです。",
        features: ["正社員での長期雇用", "土日祝休みでメリハリ", "ルーチンワークが得意"],
        color: "text-blue-600",
        bg: "bg-blue-50",
        badge: "堅実派"
    },
    B: {
        title: "プライベート充実タイプ",
        subtitle: "効率重視",
        description: "仕事はあくまで人生の一部と捉え、プライベートの時間や趣味を最優先にしたいあなた。効率よく業務をこなし、定時でサッと帰れるような環境が合っています。派遣やパートなど、時間の融通が利く働き方で輝けるタイプです。",
        features: ["残業ほぼなし", "派遣・契約社員", "自分の時間を確保"],
        color: "text-green-600",
        bg: "bg-green-50",
        badge: "マイペース"
    },
    C: {
        title: "高収入・チャレンジタイプ",
        subtitle: "成果主義",
        description: "自分の頑張りが目に見える形（給与や評価）で返ってくる環境に燃えるタイプです。競争心があり、新しいことへの挑戦も厭わないため、営業職やインセンティブ制度のある職場で爆発的な成果を出す可能性があります。",
        features: ["高収入・インセンティブ", "実力主義の評価制度", "営業・企画職"],
        color: "text-orange-600",
        bg: "bg-orange-50",
        badge: "野心家"
    },
    D: {
        title: "即戦力・急募タイプ",
        subtitle: "スピード重視",
        description: "「とにかく早く働きたい」「未経験から新しい世界へ飛び込みたい」というエネルギーに満ち溢れています。変化を恐れず、フットワーク軽く動けるあなたは、急募案件や未経験歓迎の職場で、入社直後から重宝される存在になるでしょう。",
        features: ["最短1週間で就業", "未経験歓迎", "スピード選考"],
        color: "text-red-600",
        bg: "bg-red-50",
        badge: "行動派"
    }
};

export default function ResultContent({ type, blur = false }: { type: string, blur?: boolean }) {
    // Default to A if invalid type
    const safeType = (["A", "B", "C", "D"].includes(type) ? type : "A") as ResultType;
    const data = typeDetails[safeType];

    return (
        <div className={`transition-all duration-500 ${blur ? "filter blur-md select-none pointer-events-none opacity-50" : ""}`}>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className={`${data.bg} p-8 text-center`}>
                    <div className={`inline-block px-3 py-1 rounded-full bg-white/60 font-bold text-sm mb-4 ${data.color}`}>
                        {data.badge}
                    </div>
                    <h2 className={`text-3xl md:text-4xl font-extrabold ${data.color} mb-2`}>TYPE {safeType}</h2>
                    <h3 className="text-xl font-bold text-slate-800">{data.title}</h3>
                </div>

                <div className="p-8">
                    <p className="text-slate-600 leading-relaxed mb-8">
                        {data.description}
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-6">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-slate-800 rounded-full"></span>
                            あなたに合うキーワード
                        </h4>
                        <div className="space-y-3">
                            {data.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className={`w-5 h-5 ${data.color}`} />
                                    <span className="text-slate-700 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
