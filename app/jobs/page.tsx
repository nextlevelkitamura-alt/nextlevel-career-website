import { getPublicJobs, getAllUniqueTags } from "./actions";
import JobsClient from "./JobsClient";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
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

    const jobs = await getPublicJobs();
    const tags = await getAllUniqueTags();
    return <JobsClient initialJobs={jobs || []} availableTags={tags || []} />;
}
