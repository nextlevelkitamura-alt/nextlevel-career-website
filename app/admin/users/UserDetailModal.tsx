"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCircle, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, Award, FileText, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function UserDetailModal({ user, onClose }: { user: any, onClose: () => void }) {
    if (!user) return null;

    // Calculate age
    const age = user.birth_date ? Math.floor((new Date().getTime() - new Date(user.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;

    return (
        <Dialog open={!!user} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold border-b pb-4">ユーザー詳細プロフィール</DialogTitle>
                </DialogHeader>

                <div className="space-y-8 pt-6">
                    {/* Header Section with Profile Pic */}
                    <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-50 flex-shrink-0 relative">
                            {user.avatar_url ? (
                                <Image
                                    src={user.avatar_url}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <UserCircle className="w-16 h-16" />
                                </div>
                            )}
                        </div>
                        <div className="text-center md:text-left space-y-2">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {user.last_name} {user.first_name}
                                <span className="text-sm font-normal text-slate-500 ml-2">({user.last_name_kana} {user.first_name_kana})</span>
                            </h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-600">
                                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {user.email}</span>
                                {user.phone_number && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {user.phone_number}</span>}
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-slate-600">
                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {user.birth_date || "生年月日未登録"} {age ? `(${age}歳)` : ""}</span>
                                <span className="flex items-center gap-1"><UserCircle className="w-4 h-4" /> {user.gender || "性別未登録"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column: Contact & Location */}
                        <div className="space-y-6">
                            <section>
                                <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
                                    <MapPin className="w-4 h-4 text-primary-500" /> 居住地
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-sm text-slate-500 mb-1">〒{user.zip_code || "---"}</p>
                                    <p className="font-medium">{user.prefecture} {user.address}</p>
                                </div>
                            </section>

                            <section>
                                <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
                                    <GraduationCap className="w-4 h-4 text-primary-500" /> 学歴
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap text-sm leading-relaxed">
                                    {user.education || "未登録"}
                                </div>
                            </section>

                            <section>
                                <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
                                    <Award className="w-4 h-4 text-primary-500" /> 資格・スキル
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap text-sm leading-relaxed">
                                    {user.qualification || "未登録"}
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Work & PR */}
                        <div className="space-y-6">
                            <section>
                                <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
                                    <Briefcase className="w-4 h-4 text-primary-500" /> 職歴
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap text-sm leading-relaxed">
                                    {user.work_history || "未登録"}
                                </div>
                            </section>

                            <section>
                                <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
                                    <FileText className="w-4 h-4 text-primary-500" /> 志望動機・自己PR
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap text-sm leading-relaxed">
                                    {user.motivation || "未登録"}
                                </div>
                            </section>

                            <section>
                                <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
                                    <Calendar className="w-4 h-4 text-primary-500" /> 転職希望時期
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap text-sm leading-relaxed">
                                    {user.start_date || "未登録"}
                                </div>
                            </section>

                            <section>
                                <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">
                                    <Heart className="w-4 h-4 text-primary-500" /> 希望条件
                                </h3>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap text-sm leading-relaxed">
                                    {user.desired_conditions || "未登録"}
                                </div>
                            </section>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <Link href={`/admin/chat/${user.id}`}>
                            <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                                <Mail className="w-4 h-4 mr-2" />
                                メッセージを送る
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={onClose}>閉じる</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
