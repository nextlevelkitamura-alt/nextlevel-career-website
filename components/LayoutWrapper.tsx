"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // /lp ルートではHeader/Footerを非表示
    const isLPRoute = pathname === "/lp" || pathname?.startsWith("/lp/");

    if (isLPRoute) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
        </>
    );
}
