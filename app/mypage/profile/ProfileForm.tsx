"use client";

import { updateUserProfile } from "../actions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AvatarUpload from "./AvatarUpload";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ProfileForm({ profile }: { profile: any }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        setMessage(null);

        const result = await updateUserProfile(formData);

        setIsLoading(false);

        if (result?.error) {
            setMessage({ text: "更新に失敗しました: " + result.error, type: 'error' });
        } else {
            setMessage({ text: "プロフィールを更新しました", type: 'success' });
            router.refresh();
        }
    };

    return (
        <form action={handleSubmit} className="space-y-8 max-w-2xl" key={JSON.stringify(profile)}>
            {message && (
                <div className={`p-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex justify-center mb-8 border-b border-slate-100 pb-8">
                <AvatarUpload currentAvatarUrl={profile?.avatar_url} />
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 pb-2 border-b border-slate-100">基本情報</h3>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">姓</label>
                        <input
                            name="last_name"
                            defaultValue={profile?.last_name || ""}
                            className="w-full h-10 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="山田"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">名</label>
                        <input
                            name="first_name"
                            defaultValue={profile?.first_name || ""}
                            className="w-full h-10 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="太郎"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">セイ</label>
                        <input
                            name="last_name_kana"
                            defaultValue={profile?.last_name_kana || ""}
                            className="w-full h-10 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="ヤマダ"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">メイ</label>
                        <input
                            name="first_name_kana"
                            defaultValue={profile?.first_name_kana || ""}
                            className="w-full h-10 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="タロウ"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">生年月日</label>
                        <input
                            type="date"
                            name="birth_date"
                            defaultValue={profile?.birth_date || ""}
                            className="w-full h-10 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">性別</label>
                        <select
                            name="gender"
                            defaultValue={profile?.gender || ""}
                            className="w-full h-10 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                        >
                            <option value="">選択してください</option>
                            <option value="男性">男性</option>
                            <option value="女性">女性</option>
                            <option value="その他">その他</option>
                            <option value="回答しない">回答しない</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">電話番号</label>
                        <input
                            type="tel"
                            name="phone_number"
                            defaultValue={profile?.phone_number || ""}
                            className="w-full h-10 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="09012345678"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">郵便番号</label>
                            <input
                                name="zip_code"
                                defaultValue={profile?.zip_code || ""}
                                className="w-full h-10 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="123-4567"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-bold text-slate-700">都道府県</label>
                            <select
                                name="prefecture"
                                defaultValue={profile?.prefecture || ""}
                                className="w-full h-10 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                            >
                                <option value="">選択してください</option>
                                {["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
                                    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
                                    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
                                    "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
                                    "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
                                    "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
                                    "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"].map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">住所（市区町村・番地・建物名）</label>
                    <input
                        name="address"
                        defaultValue={profile?.address || ""}
                        className="w-full h-10 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="〇〇市〇〇町1-2-3 ハイツ〇〇 101"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 pb-2 border-b border-slate-100">経歴・資格・PR</h3>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">最終学歴・学校名</label>
                    <textarea
                        name="education"
                        defaultValue={profile?.education || ""}
                        className="w-full h-24 rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 align-top"
                        placeholder="〇〇大学 〇〇学部 卒業&#13;&#10;〇〇高校 卒業"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">職歴</label>
                    <textarea
                        name="work_history"
                        defaultValue={profile?.work_history || ""}
                        className="w-full h-32 rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 align-top"
                        placeholder="20xx年x月 株式会社〇〇 入社&#13;&#10;20xx年x月 株式会社〇〇 退社&#13;&#10;主に営業職として従事"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">保有資格・スキル</label>
                    <textarea
                        name="qualification"
                        defaultValue={profile?.qualification || ""}
                        className="w-full h-24 rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 align-top"
                        placeholder="普通自動車第一種運転免許&#13;&#10;TOEIC 700点&#13;&#10;日商簿記2級"
                    />
                </div>



                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">希望条件（勤務地・給与など）</label>
                    <textarea
                        name="desired_conditions"
                        defaultValue={profile?.desired_conditions || ""}
                        className="w-full h-24 rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 align-top"
                        placeholder="勤務地：東京都内希望&#13;&#10;年収：400万円以上希望"
                    />
                </div>
            </div>

            <div className="pt-4">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-primary-600 hover:bg-primary-700 text-white min-w-[200px]"
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    更新する
                </Button>
            </div>
        </form>
    );
}
