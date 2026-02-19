"use server";

import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { isBot } from "./bot-detector";
import crypto from "crypto";

export async function recordJobView(jobId: string) {
  try {
    const supabase = createClient();
    const headersList = headers();

    const userAgent = headersList.get("user-agent");
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
    const referrer = headersList.get("referer");

    // IPハッシュ化（プライバシー保護）
    const ipHash = crypto
      .createHash("sha256")
      .update(ip)
      .digest("hex")
      .substring(0, 16);

    // ユーザー情報（ログイン中の場合）
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isBotRequest = isBot(userAgent);

    // 5分以内の重複チェック（水増し防止）
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    let duplicateQuery = supabase
      .from("job_views")
      .select("id")
      .eq("job_id", jobId)
      .gte("viewed_at", fiveMinutesAgo);

    if (user) {
      duplicateQuery = duplicateQuery.eq("user_id", user.id);
    } else {
      duplicateQuery = duplicateQuery.eq("ip_hash", ipHash);
    }

    const { data: existing } = await duplicateQuery.limit(1);
    if (existing && existing.length > 0) {
      return;
    }

    await supabase.from("job_views").insert({
      job_id: jobId,
      user_id: user?.id || null,
      ip_hash: ipHash,
      user_agent: userAgent?.substring(0, 500),
      referrer: referrer?.substring(0, 1000),
      is_bot: isBotRequest,
    });
  } catch {
    // 閲覧トラッキングの失敗はページ表示に影響させない
  }
}
