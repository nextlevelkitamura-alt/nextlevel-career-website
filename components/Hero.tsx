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
                <div className="mt-10 flex justify-center">
                    <Button asChild size="lg" className="text-lg sm:text-xl h-16 sm:h-20 px-12 sm:px-16 bg-primary-600 hover:bg-primary-700 text-white border-0 shadow-xl shadow-primary-500/30 rounded-2xl font-bold transition-transform hover:scale-105">
                        <Link href={findJobHref}>
                            <ArrowRight className="mr-3 h-6 w-6 sm:h-7 sm:w-7" />
                            求人を探す
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
