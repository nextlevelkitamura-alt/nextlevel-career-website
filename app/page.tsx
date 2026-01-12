import Hero from "@/components/Hero";
import ServiceIntro from "@/components/ServiceIntro";
import Flow from "@/components/Flow";
import Recommended from "@/components/Recommended";
import FAQ from "@/components/FAQ";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <ServiceIntro />
      <Flow />
      <Recommended />
      <FAQ />

      <section className="py-20 bg-slate-900 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8">
            理想のオフィスワークを、ここから始めよう
          </h2>
          <Button asChild size="lg" className="text-base h-14 px-10 bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25 border-0">
            <Link href="/jobs">
              求人を一覧で見る <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
