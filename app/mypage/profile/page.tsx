import { getUserProfile } from "../actions";
import ProfileForm from "./ProfileForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ProfilePage() {
    const profile = await getUserProfile();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/mypage" className="md:hidden p-2 -ml-2 text-slate-500">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">プロフィール編集</h1>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
                <ProfileForm profile={profile} />
            </div>
        </div>
    );
}
