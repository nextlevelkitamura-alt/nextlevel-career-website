"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminNotifications() {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase
            .channel('admin-notifications-nextlevel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'client_inquiries' },
                (payload) => {
                    toast.success("企業から新しい問い合わせがありました", {
                        description: `${payload.new.company_name} - ${payload.new.contact_person}`,
                        action: {
                            label: "確認する",
                            onClick: () => {
                                import("@/app/admin/actions").then(m => m.markAsRead("inquiry", payload.new.id));
                                router.push("/admin/corporate-inquiries");
                            }
                        },
                        duration: 5000,
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'applications' },
                (payload) => {
                    toast.info("新しい求人応募がありました", {
                        description: "応募者を確認してください",
                        action: {
                            label: "確認する",
                            onClick: () => {
                                import("@/app/admin/actions").then(m => m.markAsRead("application", payload.new.id));
                                router.push("/admin/applications");
                            }
                        },
                        duration: 5000,
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'profiles' },
                (payload) => {
                    toast.success("新しいユーザーが登録しました", {
                        description: `${payload.new.last_name} ${payload.new.first_name}`,
                        duration: 5000,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router, supabase]);

    return null; // This component handles side effects only
}
