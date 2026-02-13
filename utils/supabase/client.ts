import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            'Supabase environment variables are missing. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
        );
    }

    return createBrowserClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return document.cookie.split('; ').map(cookie => {
                        const [name, ...rest] = cookie.split('=')
                        return { name, value: rest.join('=') }
                    })
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        const cookieString = [
                            `${name}=${value}`,
                            options?.['maxAge'] && `Max-Age=${options['maxAge']}`,
                            options?.['domain'] && `Domain=${options['domain']}`,
                            options?.['path'] && `Path=${options['path'] || '/'}`,
                            options?.['sameSite'] && `SameSite=${options['sameSite']}`,
                            options?.['secure'] && 'Secure',
                            options?.['httpOnly'] && 'HttpOnly',
                        ]
                            .filter(Boolean)
                            .join('; ')
                        document.cookie = cookieString
                    })
                },
            },
        }
    )
}
