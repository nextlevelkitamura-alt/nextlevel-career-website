import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    // 動的に環境変数を取得（ビルド時のインライン展開を回避）
    const envVars = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Set' : 'Missing',
        SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Missing',
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Missing',
        NODE_ENV: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ status: 'ok', env: envVars });
}
