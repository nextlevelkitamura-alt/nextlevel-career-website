'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single()

        if (profile?.is_admin) {
            revalidatePath('/', 'layout')
            redirect('/admin/jobs')
        }
    }

    revalidatePath('/', 'layout')
    redirect('/jobs')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function signup(formData: Record<string, any>) {
    const supabase = createClient()

    const email = formData.email
    const password = formData.password

    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) {
        console.error('Auth signup error:', authError)
        return { error: authError.message }
    }

    if (authData.user) {
        // 2. Insert profile data
        const birthDate = `${formData.birthYear}-${String(formData.birthMonth).padStart(2, '0')}-${String(formData.birthDay).padStart(2, '0')}`;

        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                email: email, // Add email as seen in screenshot
                last_name: formData.lastName,
                first_name: formData.firstName,
                last_name_kana: formData.lastNameKana,
                first_name_kana: formData.firstNameKana,
                birth_date: birthDate,
                prefecture: formData.prefecture,
                phone_number: formData.phoneNumber,
                start_date: formData.period,
            })

        if (profileError) {
            console.error('Profile creation error:', profileError)
            return { error: 'プロフィールの作成に失敗しました: ' + profileError.message }
        }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

export async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
