import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

type JsonObject = Record<string, unknown>;

function normalizeSignature(signature: string | null) {
  if (!signature) return null;
  return signature.startsWith("sha256=") ? signature.slice(7) : signature;
}

function parseBookingPayload(payload: JsonObject) {
  const event =
    String(payload.triggerEvent || payload.event || payload.type || "BOOKING_CREATED").toUpperCase();
  const data = (payload.payload || payload.data || payload.booking || {}) as JsonObject;

  const metadata = (data.metadata || payload.metadata || {}) as JsonObject;
  const attendees = (data.attendees || data.responses || []) as JsonObject[] | JsonObject;
  const firstAttendee = Array.isArray(attendees) ? (attendees[0] || {}) as JsonObject : attendees;

  const externalBookingId = String(data.uid || data.id || payload.id || "");
  const meetingUrl = String(
    data.meetingUrl ||
      data.meetingURL ||
      data.location ||
      data.videoCallUrl ||
      "",
  );

  const rawStatusMap: Record<string, string> = {
    BOOKING_CREATED: "booked",
    BOOKING_RESCHEDULED: "rescheduled",
    BOOKING_CONFIRMED: "confirmed",
    BOOKING_CANCELLED: "canceled",
    BOOKING_CANCELED: "canceled",
    MEETING_ENDED: "completed",
  };

  const clickTypeMeta = String(metadata.clickType || metadata.click_type || "").toLowerCase();
  const clickType = clickTypeMeta === "apply" || clickTypeMeta === "consult" ? clickTypeMeta : null;
  const userId = String(metadata.userId || metadata.user_id || "") || null;
  const jobId = String(metadata.jobId || metadata.job_id || "") || null;

  return {
    status: rawStatusMap[event] || "booked",
    externalBookingId: externalBookingId || null,
    userId,
    jobId,
    clickType,
    attendeeName: String(firstAttendee.name || data.name || ""),
    attendeeEmail: String(firstAttendee.email || data.email || ""),
    attendeePhone: String(firstAttendee.phone || data.phone || ""),
    startsAt: String(data.startTime || data.start || data.start_at || ""),
    endsAt: String(data.endTime || data.end || data.end_at || ""),
    timezone: String(data.timeZone || data.timezone || ""),
    meetingUrl: meetingUrl || null,
    rawPayload: payload,
  };
}

function verifyWebhookSignature(rawBody: string, headerValue: string | null, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = normalizeSignature(headerValue);
  if (!received) return false;

  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");
  if (expectedBuffer.length !== receivedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 500 });
    }

    const rawBody = await request.text();
    const signatureSecret = process.env.CALCOM_WEBHOOK_SECRET;
    if (signatureSecret) {
      const signatureHeader =
        request.headers.get("x-cal-signature-256") ||
        request.headers.get("x-cal-signature") ||
        request.headers.get("x-signature");
      const valid = verifyWebhookSignature(rawBody, signatureHeader, signatureSecret);
      if (!valid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const parsed = JSON.parse(rawBody) as JsonObject;
    const booking = parseBookingPayload(parsed);

    const adminClient = createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    if (booking.externalBookingId) {
      const { data: existing } = await adminClient
        .from("consultation_bookings")
        .select("id")
        .eq("provider", "calcom")
        .eq("external_booking_id", booking.externalBookingId)
        .maybeSingle();

      if (existing) {
        const { error } = await adminClient
          .from("consultation_bookings")
          .update({
            status: booking.status,
            user_id: booking.userId,
            job_id: booking.jobId,
            click_type: booking.clickType,
            attendee_name: booking.attendeeName || null,
            attendee_email: booking.attendeeEmail || null,
            attendee_phone: booking.attendeePhone || null,
            starts_at: booking.startsAt || null,
            ends_at: booking.endsAt || null,
            timezone: booking.timezone || null,
            meeting_url: booking.meetingUrl,
            raw_payload: booking.rawPayload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
        return NextResponse.json({ ok: true, mode: "updated" });
      }
    }

    const { error: insertError } = await adminClient
      .from("consultation_bookings")
      .insert({
        provider: "calcom",
        external_booking_id: booking.externalBookingId,
        user_id: booking.userId,
        job_id: booking.jobId,
        click_type: booking.clickType,
        status: booking.status,
        attendee_name: booking.attendeeName || null,
        attendee_email: booking.attendeeEmail || null,
        attendee_phone: booking.attendeePhone || null,
        starts_at: booking.startsAt || null,
        ends_at: booking.endsAt || null,
        timezone: booking.timezone || null,
        meeting_url: booking.meetingUrl,
        raw_payload: booking.rawPayload,
      });

    if (insertError) throw insertError;
    return NextResponse.json({ ok: true, mode: "inserted" });
  } catch (error) {
    console.error("[calcom webhook] failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process webhook" },
      { status: 500 },
    );
  }
}
