import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function Hero() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const findJobHref = user ? "/jobs" : "/register";

    return (
        <section className="relative overflow-hidden min-h-[550px] sm:min-h-[600px] lg:min-h-[650px] flex items-center justify-center">
            {/* Background Video */}
            <div className="absolute inset-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="/hero-video.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-slate-900/50 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-slate-900/30"></div>
            </div>

            {/* Content - Shifted down for groundedness */}
            <div className="container relative mx-auto px-4 text-center z-10 pt-24 sm:pt-32">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-3 sm:mb-8 leading-tight sm:leading-relaxed tracking-wide drop-shadow-md font-sans">
                    あなたのキャリアを<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                        次のレベルへ
                    </span>
                </h1>
                <p className="mx-auto max-w-xl text-sm sm:text-base text-white/90 mb-12 sm:mb-16 leading-relaxed font-medium drop-shadow-sm px-2 sm:px-4">
                    未経験から始められるお仕事が満載<br />
                    あなたの可能性を最大限広げる
                </p>
                <div className="flex justify-center">
                    <Button
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-base sm:text-lg h-12 sm:h-14 px-8 sm:px-12 rounded-full shadow-2xl shadow-orange-500/30 border-2 border-white/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Link href={findJobHref}>
                            無料で求人を見る
                            <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Straight Divider */}
            <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-primary-100"></div>
        </section>
    );
}
