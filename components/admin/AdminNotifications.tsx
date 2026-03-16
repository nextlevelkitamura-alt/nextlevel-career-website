"use client";

import { useEffect } from "react";
import { createClient, hasBrowserSupabaseEnv } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminNotifications() {
    const router = useRouter();
    const supabase = hasBrowserSupabaseEnv() ? createClient() : null;

    useEffect(() => {
        if (!supabase) {
            if (!hasBrowserSupabaseEnv()) {
                console.warn("Admin notifications disabled: NEXT_PUBLIC_SUPABASE_* is missing in the browser bundle.");
            }
            return;
        }

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
                        description: `${payload.new.last_name || ""} ${payload.new.first_name || ""}`.trim() || payload.new.email || "新規ユーザー",
                        action: {
                            label: "確認する",
                            onClick: () => {
                                import("@/app/admin/actions/notifications").then(m => m.markAsRead("user", payload.new.id));
                                router.push("/admin/users");
                            }
                        },
                        duration: 5000,
                    });
                }
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'consultation_bookings' },
                (payload) => {
                    const name = payload.new.attendee_name || "名前未登録";
                    const dateStr = payload.new.starts_at
                        ? new Date(payload.new.starts_at).toLocaleString("ja-JP", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
                        : "日時未定";
                    toast.info("新しい面談予約がありました", {
                        description: `${name} - ${dateStr}`,
                        action: {
                            label: "確認する",
                            onClick: () => {
                                import("@/app/admin/actions/notifications").then(m => m.markAsRead("consultation", payload.new.id));
                                router.push("/admin/applications");
                            }
                        },
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
