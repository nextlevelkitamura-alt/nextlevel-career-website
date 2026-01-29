import ClientHero from "@/components/client-lp/ClientHero";
import ContactForm from "@/components/client-lp/ContactForm";

import { Suspense } from "react";

export const metadata = {
    title: "採用企業様へ | Next Level Career",
    description: "Next Level（ネクストレベル）は、貴社の事業課題を解決する最適な人材をご紹介します。完全成功報酬型でリスクなく採用活動をスタートできます。",
};

export default function ForClientsPage() {
    return (
        <>
            <ClientHero />
            <Suspense fallback={<div>Loading...</div>}>
                <ContactForm />
            </Suspense>
        </>
    );
}
