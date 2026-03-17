import Hero from "@/components/Hero";
import BannerCarousel from "@/components/BannerCarousel";
import HighlightCarousel from "@/components/HighlightCarousel";
import ServiceIntro from "@/components/ServiceIntro";
import Flow from "@/components/Flow";
import FAQ from "@/components/FAQ";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getOptionalAuthContext, getSafeActiveBanners, getSafeActiveHighlightCards } from "@/lib/publicSite";
import { recordPageView } from "@/lib/analytics";

export default async function Home() {
  const [{ user }, banners, highlightCards] = await Promise.all([
    getOptionalAuthContext(),
    getSafeActiveBanners(),
    getSafeActiveHighlightCards(),
  ]);

  void recordPageView("/");
  const findJobHref = "/jobs";

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <BannerCarousel banners={banners} />
      <HighlightCarousel cards={highlightCards} />
      <ServiceIntro />
      <Flow />
      <FAQ />

      <section className="py-20 bg-slate-900 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-8">
            理想の仕事を、ここから始めよう
          </h2>
          <Button asChild size="lg" className="text-base h-14 px-10 bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25 border-0">
            <Link href={findJobHref}>
              求人を一覧で見る <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
