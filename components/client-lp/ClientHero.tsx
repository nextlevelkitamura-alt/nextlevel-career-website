import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClientHero() {
    return (
        <section className="relative bg-slate-900 py-20 lg:py-32 overflow-hidden">
            {/* Background Gradient & Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-0" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800/30 skew-x-12 transform translate-x-1/4 z-0" />
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 z-0" />

            <div className="container relative z-10 px-4 md:px-6 mx-auto">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                        <span className="text-white/90 text-sm font-medium tracking-wide">
                            法人のお客様（採用担当者様）へ
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                        御社の成長を加速させる<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                            最適な人材
                        </span>
                        をご提案します
                    </h1>

                    <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto relative">
                        Next Levelは、貴社の事業課題を深く理解し、<br className="hidden md:block" />
                        即戦力となりうる人材とのベストマッチングを実現します。<br />
                        採用のミスマッチを減らし、組織の「次のレベル」へ。
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="#contact">
                            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-full shadow-lg shadow-orange-900/20 transition-all transform hover:scale-105">
                                お問い合わせ・資料請求
                            </Button>
                        </Link>
                        <Link href="#features">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white rounded-full bg-slate-900/50 backdrop-blur-sm">
                                サービスの特徴
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
