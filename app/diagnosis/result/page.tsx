import { createClient } from "@/utils/supabase/server";
import RegistrationGate from "@/components/diagnosis/RegistrationGate";
import ResultContent from "@/components/diagnosis/ResultContent";
import RecommendedJobs from "@/components/diagnosis/RecommendedJobs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function DiagnosisResultPage({
    searchParams,
}: {
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const type = typeof searchParams.type === "string" ? searchParams.type : "A";

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="container mx-auto max-w-3xl relative">

                {/* Back Link */}
                <div className="mb-6">
                    <Button variant="ghost" asChild className="text-slate-500 hover:text-slate-800 p-0">
                        <Link href="/diagnosis">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            診断をやり直す
                        </Link>
                    </Button>
                </div>

                {user ? (
                    // Logged In: Show Full Result
                    <>
                        <ResultContent type={type} blur={false} />
                        <RecommendedJobs type={type} answers={searchParams.answers ? JSON.parse(searchParams.answers as string) : undefined} />
                    </>
                ) : (
                    // Not Logged In: Show Blurred Result + Gate
                    <>
                        <RegistrationGate />
                        <ResultContent type={type} blur={true} />
                    </>
                )}
            </div>
        </div>
    );
}
