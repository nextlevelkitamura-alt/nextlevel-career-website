"use client";

import { logout } from "@/app/auth/actions";
import { Button } from "./ui/button";

export default function SignOutButton() {
    return (
        <form action={logout}>
            <Button variant="ghost" className="text-base font-bold text-slate-600 hover:text-primary-600">
                ログアウト
            </Button>
        </form>
    );
}
