import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

export async function sendApplicationNotification(jobTitle: string, applicantName: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Skipping email notification.");
        console.log(`[Mock Email] To: Admin, Subject: New Application, Body: ${applicantName} applied for ${jobTitle}`);
        return;
    }

    try {
        await resend.emails.send({
            from: 'NextLevel Career <onboarding@resend.dev>', // Use resend.dev for testing or user's domain
            to: ['nextlevel.kitamura@gmail.com'], // Hardcoded admin email for now, or use env var
            subject: `【応募通知】${applicantName}様から応募がありました`,
            html: `
                <h1>新しい応募がありました</h1>
                <p>以下の求人に応募がありました。</p>
                <ul>
                    <li><strong>求人名:</strong> ${jobTitle}</li>
                    <li><strong>応募者:</strong> ${applicantName}</li>
                </ul>
                <p>管理画面から詳細を確認してください。</p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/applications">管理画面を開く</a>
            `,
        });
    } catch (error) {
        console.error("Failed to send email:", error);
    }
}
