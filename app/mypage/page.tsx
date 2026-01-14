import { getUserApplications, getUserProfile } from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, UserCircle } from "lucide-react";

export default async function MyPageDashboard() {
    const applications = await getUserApplications();
    const profile = await getUserProfile();

    const isProfileComplete = profile && profile.last_name && profile.first_name && profile.phone_number && profile.work_history;

    return (
        <div className="space-y-4">
            {/* Profile Header with Application Count */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col items-center text-center gap-4">
                    <h1 className="text-2xl font-bold text-slate-900">マイページ</h1>
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-50 flex-shrink-0">
                        {profile?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={profile.avatar_url}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <UserCircle className="w-16 h-16" />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-slate-900">
                            {profile?.last_name ? `${profile.last_name} ${profile.first_name} 様` : "ゲスト 様"}
                        </h2>
                        <div className="flex items-center justify-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-bold border border-orange-200">
                                <FileText className="w-4 h-4" />
                                応募 {applications.length}件
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm pt-1">
                            {isProfileComplete ? "プロフィールは充実しています。求人に応募してみましょう！" : "プロフィールを完成させて、スカウトや応募をスムーズにしましょう。"}
                        </p>
                        <div className="pt-2">
                            <Button asChild variant="outline" className="border-primary-200 text-primary-700 hover:bg-primary-50">
                                <Link href="/mypage/profile">プロフィールを編集</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
