import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/jobs'

    if (code) {
        // Cookie を収集して redirect レスポンスに明示的に設定する
        const cookieStore = new Map<string, { name: string; value: string; options: Record<string, unknown> }>()

        // リクエストの既存Cookieで初期化
        request.cookies.getAll().forEach(cookie => {
            cookieStore.set(cookie.name, { name: cookie.name, value: cookie.value, options: {} })
        })

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return Array.from(cookieStore.values()).map(({ name, value }) => ({ name, value }))
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(cookie => {
                            cookieStore.set(cookie.name, cookie)
                        })
                    },
                },
            }
        )

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Auth callback - exchangeCodeForSession error:', error.message)
            return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
        }

        // プロフィール完了チェック（オンボーディング）
        const { data: { user } } = await supabase.auth.getUser()

        let redirectTo = `${origin}${next}`

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('phone_number')
                .eq('id', user.id)
                .single()

            if (!profile || !profile.phone_number) {
                redirectTo = `${origin}/onboarding`
            }
        }

        // Cookie を redirect レスポンスに明示的に設定（SameSite=Lax でクロスサイト対応）
        const response = NextResponse.redirect(redirectTo)
        cookieStore.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
                ...options,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                httpOnly: true,
            })
        })
        return response
    }

    console.error('Auth callback - no code parameter received')
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
