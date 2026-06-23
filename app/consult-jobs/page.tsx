import type { Metadata } from "next";
import { recordPageView } from "@/lib/analytics";
import { getConsultationRoutesView } from "./actions";
import { getDemoConsultationRoutesView } from "./demoData";
import ConsultJobsClient from "@/components/consult-jobs/ConsultJobsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "日付から相談求人を選ぶ",
  description: "相談ルートと面談日を選び、条件に合う求人を確認できます。",
};

type ConsultJobsPageProps = {
  searchParams?: {
    demo?: string;
  };
};

export default async function ConsultJobsPage({ searchParams }: ConsultJobsPageProps) {
  void recordPageView("/consult-jobs");
  const isDemo = searchParams?.demo === "1";
  const routes = isDemo
    ? getDemoConsultationRoutesView()
    : await getConsultationRoutesView();

  return <ConsultJobsClient routes={routes} isDemo={isDemo} />;
}
