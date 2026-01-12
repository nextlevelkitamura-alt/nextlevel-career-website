"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import SignOutButton from "./SignOutButton";
import { Button } from "./ui/button";

import { User } from "@supabase/supabase-js";

type HeaderNavProps = {
    user: User | null;
    isAdmin: boolean;
};

export default function HeaderNav({ user, isAdmin }: HeaderNavProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
                {isAdmin && (
                    <Link href="/admin/jobs" className="text-base font-bold text-red-600 hover:text-red-700 transition-colors px-2 py-1 border border-red-200 rounded-lg bg-red-50">
                        管理画面
                    </Link>
                )}
                <Link href={user ? "/jobs" : "/login"} className="text-base font-bold text-slate-600 hover:text-primary-600 transition-colors px-2 py-1">
                    求人を探す
                </Link>
                <Link href="/#features" className="text-base font-bold text-slate-600 hover:text-primary-600 transition-colors px-2 py-1">
                    サービスの流れ
                </Link>
                {user ? (
                    <>
                        <Link href="/mypage" className="text-base font-bold text-slate-600 hover:text-primary-600 transition-colors px-2 py-1">
                            マイページ
                        </Link>
                        <SignOutButton />
                    </>
                ) : (
                    <Link href="/login" className="text-base font-bold text-slate-600 hover:text-primary-600 transition-colors px-2 py-1">
                        ログイン
                    </Link>
                )}
                {!user && (
                    <Link href="/register" className="text-base font-bold text-slate-600 hover:text-primary-600 transition-colors px-2 py-1">
                        相談する
                    </Link>
                )}
                <Link href="/for-clients" className="text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors px-4 py-2 rounded-full shadow-md ml-2">
                    採用企業様へ
                </Link>
            </nav>

            {/* Mobile Navigation Toggle */}
            <div className="md:hidden flex items-center gap-4">
                {isAdmin && (
                    <Link href="/admin/jobs" className="text-xs font-bold text-red-600 border border-red-200 rounded px-2 py-1 bg-red-50">
                        管理画面
                    </Link>
                )}
                <button onClick={toggleMenu} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full">
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg p-4 flex flex-col gap-4 md:hidden z-50 animate-in slide-in-from-top-5">
                    <Link href={user ? "/jobs" : "/login"} onClick={toggleMenu} className="text-base font-bold text-slate-600 hover:text-primary-600 py-2 border-b border-slate-100">
                        求人を探す
                    </Link>
                    <Link href="/#features" onClick={toggleMenu} className="text-base font-bold text-slate-600 hover:text-primary-600 py-2 border-b border-slate-100">
                        サービスの流れ
                    </Link>
                    <Link href="/for-clients" onClick={toggleMenu} className="text-base font-bold text-slate-600 hover:text-primary-600 py-2 border-b border-slate-100">
                        採用企業様へ
                    </Link>

                    <div className="flex flex-col gap-3 mt-2">
                        {user ? (
                            <>
                                <Link href="/mypage" onClick={toggleMenu} className="w-full">
                                    <Button variant="outline" className="w-full justify-center">
                                        マイページ
                                    </Button>
                                </Link>
                                <div onClick={toggleMenu} className="pt-2">
                                    <SignOutButton />
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={toggleMenu}>
                                    <Button variant="outline" className="w-full justify-center">
                                        ログイン
                                    </Button>
                                </Link>
                                <Link href="/register" onClick={toggleMenu}>
                                    <Button className="w-full justify-center bg-primary-600 hover:bg-primary-700 text-white">
                                        相談する
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
