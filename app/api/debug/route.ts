import { NextResponse } from 'next/server';

// export const runtime = 'edge';

export async function GET() {
    const envVars = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'Set' : 'Missing',
        RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Set' : 'Missing',
        NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json({ status: 'ok', env: envVars });
}
