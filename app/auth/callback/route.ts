import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/'

    if (code) {
        const supabase = createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            // Check for profile completeness (Onboarding Check)
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Fetch profile to see if phone_number and start_date exist
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*') // Select all to be safe, or specify columns if sure
                    .eq('id', user.id)
                    .single()

                // Redirect to onboarding if:
                // 1. Profile doesn't exist (First time Google Login)
                // 2. Phone number is missing
                // Note: start_date is optional, so we don't check it here
                // @ts-expect-error: Columns might be missing from types yet
                if (!profile || !profile.phone_number) {
                    return NextResponse.redirect(`${origin}/onboarding`)
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}
