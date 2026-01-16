import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function Hero() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const findJobHref = user ? "/jobs" : "/register";

    return (
        <section className="relative overflow-hidden min-h-[550px] sm:min-h-[600px] lg:min-h-[650px] flex items-center justify-center">
            {/* Background Image */}
            <div className="absolute inset-0">
                <Image
                    src="/hero-bg.jpg"
                    alt="Office Background"
                    fill
                    className="object-cover"
                    priority
                    quality={100}
                />
                <div className="absolute inset-0 bg-slate-900/50 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-slate-900/30"></div>
            </div>

            {/* Content */}
            <div className="container relative mx-auto px-4 text-center z-10 pt-8 sm:pt-0">
                <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6 leading-tight tracking-tight drop-shadow-md">
                    あなたのキャリアを<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                        次のレベルへ
                    </span>
                </h1>
                <p className="mx-auto max-w-xl text-sm sm:text-base text-white/90 mb-8 sm:mb-10 leading-relaxed font-medium drop-shadow-sm px-2 sm:px-4">
                    未経験から始められる、事務・コールセンターのお仕事が満載。<br className="hidden sm:block" />
                    安定した環境で、あなたらしく働きませんか。
                </p>
                <div className="flex justify-center">
                    <Button
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-base sm:text-xl h-12 sm:h-16 px-8 sm:px-14 rounded-full shadow-2xl shadow-orange-500/30 border-2 border-white/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Link href={findJobHref}>
                            無料で求人を見る
                            <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0 z-20">
                <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto text-primary-100 fill-current">
                    <path d="M0 50L60 45C120 40 240 30 360 25C480 20 600 20 720 30C840 40 960 60 1080 65C1200 70 1320 60 1380 55L1440 50V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z" />
                </svg>
            </div>
        </section>
    );
}
