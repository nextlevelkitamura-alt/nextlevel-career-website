import Hero from "@/components/Hero";
import BannerCarousel from "@/components/BannerCarousel";
import ServiceIntro from "@/components/ServiceIntro";
import Flow from "@/components/Flow";
import FAQ from "@/components/FAQ";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const findJobHref = user ? "/jobs" : "/login";

  const { data: banners } = await supabase
    .from("banners")
    .select("id, title, image_url, link_url")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <BannerCarousel banners={banners || []} />
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
