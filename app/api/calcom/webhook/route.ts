import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

type JsonObject = Record<string, unknown>;

function normalizeSignature(signature: string | null) {
  if (!signature) return null;
  return signature.startsWith("sha256=") ? signature.slice(7) : signature;
}

function isHttpUrl(value: string) {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

function collectUrlsFromUnknown(value: unknown, found: string[] = []): string[] {
  if (typeof value === "string" && isHttpUrl(value)) {
    found.push(value.trim());
    return found;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectUrlsFromUnknown(item, found));
    return found;
  }
  if (value && typeof value === "object") {
    Object.values(value as JsonObject).forEach((item) => collectUrlsFromUnknown(item, found));
  }
  return found;
}

function pickMeetingUrl(payload: JsonObject, data: JsonObject): string | null {
  const directCandidates: unknown[] = [
    data.meetingUrl,
    data.meetingURL,
    data.videoCallUrl,
    data.videoCallURL,
    data.joinUrl,
    data.joinURL,
    (data.location as JsonObject | undefined)?.url,
    (data.location as JsonObject | undefined)?.link,
    data.location,
    (data.conferencing as JsonObject | undefined)?.url,
    (data.conferencing as JsonObject | undefined)?.link,
    (data.conferenceData as JsonObject | undefined)?.entryPoints,
    (data.conferenceData as JsonObject | undefined)?.conferenceSolution,
  ];

  const gathered = [
    ...directCandidates.flatMap((item) => collectUrlsFromUnknown(item)),
    ...collectUrlsFromUnknown(data),
    ...collectUrlsFromUnknown(payload),
  ].filter(Boolean);

  if (gathered.length === 0) return null;

  const normalized = Array.from(new Set(gathered));
  const googleMeet = normalized.find((url) => /meet\.google\.com/i.test(url));
  if (googleMeet) return googleMeet;
  return normalized[0] || null;
}

function normalizeAttendee(attendeesRaw: unknown, data: JsonObject): JsonObject {
  if (Array.isArray(attendeesRaw)) return (attendeesRaw[0] || {}) as JsonObject;
  if (attendeesRaw && typeof attendeesRaw === "object") return attendeesRaw as JsonObject;
  return {
    name: data.name,
    email: data.email,
    phone: data.phone,
  };
}

function parseBookingPayload(payload: JsonObject) {
  const event =
    String(payload.triggerEvent || payload.event || payload.type || "BOOKING_CREATED").toUpperCase();
  const data = (payload.payload || payload.data || payload.booking || {}) as JsonObject;

  const metadata = (data.metadata || payload.metadata || {}) as JsonObject;
  const firstAttendee = normalizeAttendee(data.attendees || data.responses, data);

  const externalBookingId = String(data.uid || data.id || payload.id || "");
  const meetingUrl = pickMeetingUrl(payload, data);

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
    meetingUrl,
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
