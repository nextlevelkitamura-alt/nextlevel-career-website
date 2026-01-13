"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getAdminNotificationCounts } from "@/app/admin/actions";

interface AdminNavBadgeProps {
    type: "applications" | "inquiries";
}

export default function AdminNavBadge({ type }: AdminNavBadgeProps) {
    const [count, setCount] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        // Initial fetch
        const fetchInitialCounts = async () => {
            const counts = await getAdminNotificationCounts();
            setCount(type === "applications" ? counts.applications : counts.inquiries);
        };
        fetchInitialCounts();

        const resourceChannel = supabase
            .channel(`admin-nav-${type}-new`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: type === "applications" ? 'applications' : 'client_inquiries' },
                () => fetchInitialCounts()
            )
            .subscribe();

        const readsChannel = supabase
            .channel(`admin-nav-${type}-reads`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'admin_notification_reads' },
                () => fetchInitialCounts()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(resourceChannel);
            supabase.removeChannel(readsChannel);
        };
    }, [type, supabase]);

    if (count === 0) return null;

    return (
        <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full animate-in fade-in zoom-in duration-300">
            {count > 99 ? "99+" : count}
        </span>
    );
}
