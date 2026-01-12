import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-32 lg:pb-32 xl:pb-36">
            <div className="absolute inset-0">
                <Image
                    src="/hero-bg.jpg"
                    alt="Office Background"
                    fill
                    className="object-cover"
                    priority
                    quality={100}
                />
                <div className="absolute inset-0 bg-white/70"></div>
            </div>

            <div className="container relative mx-auto px-4 text-center">
                <h1 className="mx-auto max-w-4xl font-display text-4xl font-medium tracking-tight text-slate-900 sm:text-6xl">
                    <span className="font-bold">あなたのキャリアを</span><br />
                    <span className="relative whitespace-nowrap text-red-500 font-bold pb-2">
                        次のレベルへ
                    </span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-600">
                    未経験から始められる、事務・コールセンターのお仕事が満載。<br className="hidden sm:inline" />
                    安定した環境で、あなたらしく働きませんか。
                </p>
                <div className="mt-10 flex justify-center gap-x-6">
                    <Button asChild size="lg" className="text-base h-12 px-8 bg-primary-600 hover:bg-primary-700 text-white border-0 shadow-lg shadow-primary-500/20">
                        <Link href="/jobs">
                            求人を探す <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="text-base h-12 px-8 bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                        <Link href="#features">
                            特徴を見る
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
