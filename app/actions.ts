"use server";

import { createClient as createSupabaseClient } from "@/utils/supabase/server";

// Submit Client Inquiry
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function submitClientInquiry(formData: FormData) {
    const supabase = createSupabaseClient();

    const company_name = formData.get("company_name") as string;
    const contact_person = formData.get("contact_person") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;

    // Validate
    if (!company_name || !contact_person || !email || !message) {
        return { error: "必須項目が入力されていません。" };
    }

    const { error } = await supabase.from("client_inquiries").insert({
        company_name,
        contact_person,
        email,
        phone,
        message
    });

    if (error) {
        console.error("Inquiry error:", error);
        return { error: "送信に失敗しました。時間をおいて再度お試しください。" };
    }

    // TODO: Send email notification to admin here using Resend or similar

    return { success: true };
}
