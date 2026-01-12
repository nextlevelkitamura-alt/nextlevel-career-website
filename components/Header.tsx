import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import HeaderNav from './HeaderNav';

export default async function Header() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let isAdmin = false;
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
        isAdmin = profile?.is_admin === true;
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
            <div className="w-full flex h-16 items-center justify-between px-4 md:px-8">
                <Link href="/" className="flex items-center space-x-2">
                    <Image
                        src="/logo_large.png"
                        alt="Next Level Career"
                        width={200}
                        height={60}
                        className="h-10 w-auto object-contain"
                        priority
                    />
                </Link>
                <HeaderNav user={user} isAdmin={isAdmin} />
            </div>
        </header>
    );
}
