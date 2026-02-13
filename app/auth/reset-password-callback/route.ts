import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    // Cloud Run内部では request.url が 0.0.0.0:8080 になるため、正しいoriginを取得
    const forwardedHost = request.headers.get('x-forwarded-host')
    const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
    const origin = forwardedHost
        ? `${forwardedProto}://${forwardedHost}`
        : process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || requestUrl.origin

    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Exchange code error:', error.message)
            return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
        }
    }

    // パスワード更新ページへリダイレクト
    return NextResponse.redirect(`${origin}/update-password`)
}
