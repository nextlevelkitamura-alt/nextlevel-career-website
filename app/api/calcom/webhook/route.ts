import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";
import {
    sendConsultationBookingNotification,
    sendConsultationConfirmationToApplicant,
    sendConsultationThankYouEmail,
    sendConsultationCompletedNotification,
} from "@/lib/mail";

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

function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return "";
  return String(value);
}

function parseBookingPayload(payload: JsonObject) {
  const event =
    String(payload.triggerEvent || payload.event || payload.type || "BOOKING_CREATED").toUpperCase();
  // BOOKING_CREATED: data is nested under payload.payload
  // MEETING_ENDED etc: data is at top level (no nesting)
  const nested = (payload.payload || payload.data || payload.booking) as JsonObject | undefined;
  const data = (nested && typeof nested === "object" && Object.keys(nested).length > 0 ? nested : payload) as JsonObject;

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

  const clickTypeMeta = safeString(metadata.clickType || metadata.click_type).toLowerCase();
  const clickType = clickTypeMeta === "apply" || clickTypeMeta === "consult" ? clickTypeMeta : null;
  const userId = safeString(metadata.userId || metadata.user_id) || null;
  const jobId = safeString(metadata.jobId || metadata.job_id) || null;

  return {
    event,
    status: rawStatusMap[event] || "booked",
    externalBookingId: externalBookingId || null,
    userId,
    jobId,
    clickType,
    attendeeName: safeString(firstAttendee.name || data.name),
    attendeeEmail: safeString(firstAttendee.email || data.email),
    attendeePhone: safeString(firstAttendee.phone || data.phone),
    startsAt: safeString(data.startTime || data.start || data.start_at),
    endsAt: safeString(data.endTime || data.end || data.end_at),
    timezone: safeString(data.timeZone || data.timezone),
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

// 診断用: Webhookエンドポイントが稼働中か確認
export async function GET() {
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasWebhookSecret = !!process.env.CALCOM_WEBHOOK_SECRET;

  return NextResponse.json({
    status: "ok",
    endpoint: "/api/calcom/webhook",
    config: {
      supabaseUrl: hasSupabaseUrl,
      serviceRoleKey: hasServiceRole,
      webhookSecret: hasWebhookSecret,
    },
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[calcom webhook] Missing env: SUPABASE_URL=%s, SERVICE_ROLE=%s",
        !!supabaseUrl, !!serviceRoleKey);
      return NextResponse.json({ error: "Supabase service role is not configured" }, { status: 500 });
    }

    const rawBody = await request.text();
    console.log("[calcom webhook] Received request, body length=%d", rawBody.length);

    const signatureSecret = process.env.CALCOM_WEBHOOK_SECRET;
    if (signatureSecret) {
      const signatureHeader =
        request.headers.get("x-cal-signature-256") ||
        request.headers.get("x-cal-signature") ||
        request.headers.get("x-signature");
      const valid = verifyWebhookSignature(rawBody, signatureHeader, signatureSecret);
      if (!valid) {
        console.error("[calcom webhook] Signature verification failed. Header present: %s",
          !!signatureHeader);
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      console.warn("[calcom webhook] CALCOM_WEBHOOK_SECRET not set, skipping signature verification");
    }

    const parsed = JSON.parse(rawBody) as JsonObject;

    // PINGテスト: DB操作不要で即座に200を返す
    const triggerEvent = String(parsed.triggerEvent || parsed.event || parsed.type || "").toUpperCase();
    if (triggerEvent === "PING") {
      console.log("[calcom webhook] Ping test received, responding OK in %dms", Date.now() - startTime);
      return NextResponse.json({ ok: true, mode: "ping" });
    }

    const booking = parseBookingPayload(parsed);

    console.log("[calcom webhook] Parsed: event=%s, status=%s, extId=%s, userId=%s, jobId=%s, clickType=%s, attendee=%s/%s",
      booking.event, booking.status, booking.externalBookingId,
      booking.userId, booking.jobId, booking.clickType,
      booking.attendeeName, booking.attendeeEmail);

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

        // 面談完了時のメール通知
        if (booking.event === "MEETING_ENDED") {
          sendConsultationThankYouEmail(booking.attendeeName, booking.attendeeEmail).catch(console.error);
          sendConsultationCompletedNotification(booking.attendeeName).catch(console.error);
        }

        console.log("[calcom webhook] Updated existing booking id=%s in %dms",
          existing.id, Date.now() - startTime);
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

    // 新規予約時のメール通知
    if (booking.event === "BOOKING_CREATED" || booking.event === "BOOKING_CONFIRMED") {
      sendConsultationBookingNotification(booking.attendeeName, booking.attendeeEmail, booking.startsAt).catch(console.error);
      sendConsultationConfirmationToApplicant(booking.attendeeName, booking.attendeeEmail, booking.startsAt, booking.meetingUrl).catch(console.error);
    }

    console.log("[calcom webhook] Inserted new booking in %dms", Date.now() - startTime);
    return NextResponse.json({ ok: true, mode: "inserted" });
  } catch (error) {
    console.error("[calcom webhook] Failed in %dms:", Date.now() - startTime, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process webhook" },
      { status: 500 },
    );
  }
}
