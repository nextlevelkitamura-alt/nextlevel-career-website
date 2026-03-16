"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "./auth";

export interface ConsultationBooking {
    id: string;
    provider: string;
    external_booking_id: string | null;
    user_id: string | null;
    job_id: string | null;
    click_type: string | null;
    status: string;
    outcome: string;
    attendee_name: string | null;
    attendee_email: string | null;
    attendee_phone: string | null;
    starts_at: string | null;
    ends_at: string | null;
    timezone: string | null;
    meeting_url: string | null;
    admin_note: string | null;
    follow_up_date: string | null;
    assigned_admin: string | null;
    created_at: string;
    updated_at: string;
    job_title: string | null;
    listing_source_name: string | null;
}

export async function getConsultationBookings(): Promise<ConsultationBooking[]> {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return [];

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from("consultation_bookings")
        .select("*, jobs(title, listing_source_name)")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch consultation bookings:", error);
        return [];
    }

    return (data || []).map(d => {
        const job = d.jobs as { title: string; listing_source_name: string | null } | null;
        return {
            ...d,
            outcome: d.outcome || "pending",
            job_title: job?.title ?? null,
            listing_source_name: job?.listing_source_name ?? null,
            jobs: undefined,
        };
    });
}

export async function updateConsultationStatus(id: string, status: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = createSupabaseClient();

    const { error } = await supabase
        .from("consultation_bookings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/applications");
    return { success: true };
}

export async function updateConsultationOutcome(id: string, outcome: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = createSupabaseClient();

    const { error } = await supabase
        .from("consultation_bookings")
        .update({ outcome, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/applications");
    return { success: true };
}

export async function updateConsultationNote(id: string, admin_note: string) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = createSupabaseClient();

    const { error } = await supabase
        .from("consultation_bookings")
        .update({ admin_note, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/applications");
    return { success: true };
}

export async function updateConsultationFollowUp(id: string, follow_up_date: string | null) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: "Unauthorized" };

    const supabase = createSupabaseClient();

    const { error } = await supabase
        .from("consultation_bookings")
        .update({ follow_up_date, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/applications");
    return { success: true };
}
