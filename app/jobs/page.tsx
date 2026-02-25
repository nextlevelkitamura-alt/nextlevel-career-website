import { getPublicJobsList } from "./actions";
import JobsClient from "./JobsClient";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function JobsPage({ searchParams }: {
    searchParams: { area?: string; type?: string; category?: string; page?: string };
}) {
    const supabase = createClient();

    // 認証チェック
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // オンボーディング完了チェック
    const { data: profile } = await supabase
        .from("profiles")
        .select("phone_number")
        .eq("id", user.id)
        .single();

    // 電話番号が未登録の場合はオンボーディングへ
    if (!profile || !profile.phone_number) {
        redirect("/onboarding");
    }

    const currentPage = Math.max(1, Number(searchParams.page) || 1);
    const result = await getPublicJobsList({
        area: searchParams.area || "",
        type: searchParams.type || "",
        category: searchParams.category || "",
        page: currentPage,
    });

    return (
        <JobsClient
            jobs={result.jobs || []}
            initialArea={searchParams.area || ""}
            initialType={searchParams.type || ""}
            initialCategory={searchParams.category || ""}
            currentPage={result.page}
            totalPages={result.totalPages}
        />
    );
}
