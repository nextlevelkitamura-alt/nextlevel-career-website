import { Resend } from 'resend';

const ADMIN_EMAIL = 'nextlevel-career@e-nextlevel.jp';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function getResendClient() {
    if (!process.env.RESEND_API_KEY) return null;
    return new Resend(process.env.RESEND_API_KEY);
}

function getFromAddress() {
    return process.env.RESEND_FROM_EMAIL || 'NextLevel Career <onboarding@resend.dev>';
}

export async function sendApplicationNotification(jobTitle: string, applicantName: string) {
    const resend = getResendClient();
    if (!resend) {
        console.warn("RESEND_API_KEY is not set. Skipping email notification.");
        console.log(`[Mock Email] To: Admin, Subject: New Application, Body: ${applicantName} applied for ${jobTitle}`);
        return;
    }

    try {
        await resend.emails.send({
            from: getFromAddress(),
            to: [ADMIN_EMAIL],
            subject: `【応募通知】${applicantName}様から応募がありました`,
            html: `
                <h1>新しい応募がありました</h1>
                <p>以下の求人に応募がありました。</p>
                <ul>
                    <li><strong>求人名:</strong> ${jobTitle}</li>
                    <li><strong>応募者:</strong> ${applicantName}</li>
                </ul>
                <p>管理画面から詳細を確認してください。</p>
                <a href="${SITE_URL}/admin/applications">管理画面を開く</a>
            `,
        });
    } catch (error) {
        console.error("Failed to send email:", error);
    }
}

// 管理者への面談予約通知メール
export async function sendConsultationBookingNotification(attendeeName: string, attendeeEmail: string, startsAt: string) {
    const resend = getResendClient();
    if (!resend) {
        console.log(`[Mock Email] 面談予約通知: ${attendeeName} (${attendeeEmail}) - ${startsAt}`);
        return;
    }

    const dateStr = startsAt
        ? new Date(startsAt).toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
        : "日時未定";

    try {
        await resend.emails.send({
            from: getFromAddress(),
            to: [ADMIN_EMAIL],
            subject: `【面談予約】${attendeeName || "名前未登録"}様から面談予約が入りました`,
            html: `
                <h1>新しい面談予約がありました</h1>
                <ul>
                    <li><strong>お名前:</strong> ${attendeeName || "名前未登録"}</li>
                    <li><strong>メール:</strong> ${attendeeEmail || "未登録"}</li>
                    <li><strong>予約日時:</strong> ${dateStr}</li>
                </ul>
                <p>管理画面から詳細を確認してください。</p>
                <a href="${SITE_URL}/admin/applications">管理画面を開く</a>
            `,
        });
    } catch (error) {
        console.error("Failed to send consultation booking notification:", error);
    }
}

// 求職者への面談予約確認メール
export async function sendConsultationConfirmationToApplicant(attendeeName: string, attendeeEmail: string, startsAt: string, meetingUrl: string | null) {
    const resend = getResendClient();
    if (!resend || !attendeeEmail) {
        console.log(`[Mock Email] 予約確認: ${attendeeName} (${attendeeEmail}) - ${startsAt}`);
        return;
    }

    const dateStr = startsAt
        ? new Date(startsAt).toLocaleString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
        : "日時未定";

    try {
        await resend.emails.send({
            from: getFromAddress(),
            to: [attendeeEmail],
            subject: `【予約確認】面談予約を受け付けました | NextLevel Career`,
            html: `
                <h1>面談予約を受け付けました</h1>
                <p>${attendeeName || ""}様</p>
                <p>面談のご予約ありがとうございます。以下の日時でお待ちしております。</p>
                <ul>
                    <li><strong>予約日時:</strong> ${dateStr}</li>
                    ${meetingUrl ? `<li><strong>会議URL:</strong> <a href="${meetingUrl}">${meetingUrl}</a></li>` : ""}
                </ul>
                <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
                <p>NextLevel Career 運営チーム</p>
            `,
        });
    } catch (error) {
        console.error("Failed to send confirmation email:", error);
    }
}

// 面談完了後のお礼メール（求職者向け）
export async function sendConsultationThankYouEmail(attendeeName: string, attendeeEmail: string) {
    const resend = getResendClient();
    if (!resend || !attendeeEmail) {
        console.log(`[Mock Email] お礼メール: ${attendeeName} (${attendeeEmail})`);
        return;
    }

    try {
        await resend.emails.send({
            from: getFromAddress(),
            to: [attendeeEmail],
            subject: `本日はありがとうございました | NextLevel Career`,
            html: `
                <h1>本日はありがとうございました</h1>
                <p>${attendeeName || ""}様</p>
                <p>本日は面談にお時間をいただき、ありがとうございました。</p>
                <p>お話を伺った内容をもとに、最適な求人をご提案いたします。</p>
                <h2>次のステップ</h2>
                <ul>
                    <li>3営業日以内に求人のご提案をお送りします</li>
                    <li>ご質問はチャットからいつでもどうぞ</li>
                </ul>
                <p><a href="${SITE_URL}/mypage">マイページを開く</a></p>
                <p>NextLevel Career 運営チーム</p>
            `,
        });
    } catch (error) {
        console.error("Failed to send thank you email:", error);
    }
}

// 面談完了の管理者通知
export async function sendConsultationCompletedNotification(attendeeName: string) {
    const resend = getResendClient();
    if (!resend) {
        console.log(`[Mock Email] 面談完了通知: ${attendeeName}`);
        return;
    }

    try {
        await resend.emails.send({
            from: getFromAddress(),
            to: [ADMIN_EMAIL],
            subject: `【面談完了】${attendeeName || "名前未登録"}様との面談が完了しました`,
            html: `
                <h1>面談が完了しました</h1>
                <p><strong>${attendeeName || "名前未登録"}</strong>様との面談が完了しました。</p>
                <p>フォローアップが必要です。管理画面から確認してください。</p>
                <a href="${SITE_URL}/admin/applications">管理画面を開く</a>
            `,
        });
    } catch (error) {
        console.error("Failed to send completion notification:", error);
    }
}
