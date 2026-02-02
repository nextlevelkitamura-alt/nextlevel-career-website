"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
type Question = {
    id: number;
    text: string;
    options: {
        label: string;
        value: string; // Used for scoring
        typePoints: Record<string, number>; // Points for each type (A, B, C, D)
    }[];
};

const questions: Question[] = [
    {
        id: 1,
        text: "仕事選びの最優先事項は？",
        options: [
            { label: "収入アップ", value: "income", typePoints: { C: 2 } },
            { label: "プライベート確保", value: "private", typePoints: { B: 2, A: 1 } },
            { label: "スキル・成長", value: "growth", typePoints: { C: 1, A: 1 } },
            { label: "スピード就業", value: "speed", typePoints: { D: 2 } },
        ]
    },
    {
        id: 2,
        text: "理想の職場雰囲気は？",
        options: [
            { label: "チームでワイワイ", value: "team", typePoints: { D: 1, C: 1 } },
            { label: "一人でコツコツ", value: "solo", typePoints: { A: 1, B: 1 } },
            { label: "ルールが明確で安定的", value: "stable", typePoints: { A: 2 } },
        ]
    },
    {
        id: 3,
        text: "希望給与のイメージは？",
        options: [
            { label: "スタートから稼ぎたい", value: "high_start", typePoints: { C: 2, D: 1 } },
            { label: "徐々に上げたい", value: "gradual", typePoints: { A: 2 } },
            { label: "毎月安定額が欲しい", value: "stable", typePoints: { B: 2, A: 1 } },
        ]
    },
    {
        id: 4,
        text: "休日の理想は？",
        options: [
            { label: "土日祝休み固定", value: "fixed", typePoints: { A: 2, B: 1 } },
            { label: "平日含むシフト制", value: "shift", typePoints: { D: 1, C: 1 } },
        ]
    },
    {
        id: 5,
        text: "チャレンジ意欲は？",
        options: [
            { label: "全く新しい分野へ挑戦", value: "new_challenge", typePoints: { D: 2, C: 1 } },
            { label: "経験を少しでも活かしたい", value: "experience", typePoints: { A: 1, B: 1 } },
        ]
    },
    {
        id: 6,
        text: "希望の雇用形態スタイルは？",
        options: [
            { label: "長く安定して働きたい", value: "long_term", typePoints: { A: 2, C: 1 } },
            { label: "いろいろな職場を見てみたい", value: "variety", typePoints: { B: 2, D: 1 } },
        ]
    }
];

export default function DiagnosisPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [scores, setScores] = useState({ A: 0, B: 0, C: 0, D: 0 });
    const [isCalculating, setIsCalculating] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

    const handleAnswer = (option: Question["options"][0]) => {
        // Add scores
        const newScores = { ...scores };
        Object.entries(option.typePoints).forEach(([type, points]) => {
            newScores[type as keyof typeof scores] += points;
        });
        setScores(newScores);

        // Record answer
        setSelectedAnswers(prev => ({ ...prev, [currentStep]: option.value }));

        // Move to next step or finish
        if (currentStep < questions.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishDiagnosis(newScores);
        }
    };

    const finishDiagnosis = (finalScores: typeof scores) => {
        setIsCalculating(true);
        // Find highest score
        const sortedTypes = Object.entries(finalScores).sort(([, a], [, b]) => b - a);
        const resultType = sortedTypes[0][0]; // "A", "B", "C", or "D"

        // Build answers object for URL
        const answersParam = encodeURIComponent(JSON.stringify(selectedAnswers));

        // Simulate calculation time for effect
        setTimeout(() => {
            router.push(`/diagnosis/result?type=${resultType}&answers=${answersParam}`);
        }, 1500);
    };

    const currentQuestion = questions[currentStep];
    const progress = ((currentStep + 1) / questions.length) * 100;

    if (isCalculating) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-slate-800">診断結果を分析中...</h2>
                <p className="text-slate-500 mt-2">あなたの適職タイプを導き出しています</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Next Level キャリア診断</h1>
                    <p className="text-slate-500 text-sm">直感でお答えください（全6問）</p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
                    <div
                        className="bg-primary-600 h-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
                    >
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-8 leading-relaxed">
                            <span className="text-primary-600 text-sm font-bold block mb-2">Q{currentQuestion.id}.</span>
                            {currentQuestion.text}
                        </h2>

                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(option)}
                                    className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-primary-600 hover:bg-primary-50 transition-all group flex items-center justify-between"
                                >
                                    <span className="text-slate-700 font-bold group-hover:text-primary-700">{option.label}</span>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
