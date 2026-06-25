import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { buildPublicConsultationUrl } from "@/utils/calcom";


export default async function Hero() {
    const findJobHref = "/jobs";
    const consultationHref = buildPublicConsultationUrl({ entryPoint: "hero" });

    return (
        <section className="relative overflow-hidden min-h-[720px] sm:min-h-[760px] lg:min-h-[780px] flex items-center justify-center">
            {/* Background */}
            <div className="absolute inset-0">
                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center sm:hidden"
                />
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="hidden sm:block w-full h-full object-cover"
                >
                    <source src="/hero-video.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-slate-900/50 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-slate-900/30"></div>
            </div>

            {/* Content - Shifted down for groundedness */}
            <div className="container relative mx-auto px-4 text-center z-10 pt-16 sm:pt-24">
                <h1 className="mx-auto flex max-w-[360px] sm:max-w-3xl flex-col text-[34px] sm:text-5xl lg:text-6xl font-extrabold text-white mb-8 sm:mb-10 leading-[1.18] sm:leading-tight tracking-normal drop-shadow-md font-sans">
                    <span className="block self-start ml-5 sm:ml-0 sm:-translate-x-3 pl-1 sm:pl-10">仕事探しを</span>
                    <span className="block self-end mr-3 sm:mr-0 sm:translate-x-3 mt-3 sm:mt-4 pr-1 sm:pr-16 whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                        もっと自分のペースで
                    </span>
                </h1>
                <p className="mx-auto max-w-[330px] sm:max-w-2xl text-left text-[13px] sm:text-base text-white/90 mb-20 sm:mb-20 leading-[1.9] sm:leading-loose font-medium drop-shadow-sm px-1 sm:px-4">
                    求人を見るだけでも<br />
                    相談から始めても大丈夫<br />
                    未経験から挑戦できる仕事も<br />
                    経験を活かせる仕事も<br />
                    あなたに合う選び方で探せます
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 translate-y-6 sm:translate-y-8">
                    <Button
                        asChild
                        size="lg"
                        className="w-[66%] max-w-[240px] sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-base sm:text-lg h-12 px-5 sm:px-10 rounded-full shadow-2xl shadow-orange-500/30 border-2 border-white/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Link href={findJobHref}>
                            求人を見てみる
                            <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        className="w-[66%] max-w-[240px] sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-base sm:text-lg h-12 px-5 sm:px-9 rounded-full border-2 border-white/40 backdrop-blur-sm shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                        <a href={consultationHref} target="_blank" rel="noopener noreferrer">
                            相談を予約する
                            <CalendarCheck className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                        </a>
                    </Button>
                </div>
            </div>

            {/* Straight Divider */}
            <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-primary-100"></div>
        </section>
    );
}
