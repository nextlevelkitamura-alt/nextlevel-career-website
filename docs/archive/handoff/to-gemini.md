# Claude → Gemini 引き継ぎ

> この内容を Gemini 3.0 Pro にコピペしてください

## 更新日時
2026-02-27

## プロジェクト
NextLevel Career Site: 求職者向けの求人検索・応募・相談プラットフォーム

## やってもらいたいこと
ヘッダーナビゲーションの UI をシンプル・クリーンなデザインにリニューアルしてください。

## 画面イメージ
- **雰囲気**: シンプル・クリーン（エン転職やdoda風の洗練された転職サイトヘッダー）
- **配色**: 白背景、テキストはスレートグレー、アクセントはオレンジ（primary-600: #ea580c）
- **レイアウト**: 左にロゴ、右にナビリンク。モバイルはハンバーガーメニュー
- **ポイント**:
  - 余白を活かしたすっきりしたデザイン
  - ホバーエフェクトは控えめで上品に
  - sticky ヘッダー（現状維持）
  - ログイン/新規登録ボタンのメリハリ

## 技術情報
- フレームワーク: Next.js 14 (App Router), TypeScript
- スタイリング: Tailwind CSS 3.4
- UIライブラリ: shadcn/ui, Radix UI, Lucide React
- アニメーション: framer-motion（必要なら使用可）

## 現在のヘッダー構成

### Header.tsx（Server Component）
- Supabaseからユーザー情報・admin権限を取得
- ロゴ表示（`/logo_large.png`, next/image使用）
- `HeaderNav` にユーザー情報を渡す

### HeaderNav.tsx（Client Component）
- Props: `{ user: User | null, isAdmin: boolean }`
- デスクトップ: 横並びナビ（管理画面, 求人を探す, 相談する, マイページ/ログイン/新規登録, 採用企業様へ）
- モバイル: ハンバーガーメニュー（X/Menuアイコン切り替え、外部クリックで閉じる）
- ログアウト: `SignOutButton` コンポーネント + `logout` Server Action

### ナビ項目
| リンク | 条件 | 備考 |
|--------|------|------|
| 管理画面 | isAdmin のみ | 赤色バッジ風 |
| 求人を探す | 常時表示 | 未ログイン時は /login へ |
| 相談する | 常時表示 | /mypage/consultation |
| 採用企業様へ | 常時表示 | /for-clients |
| マイページ | ログイン時 | /mypage |
| ログアウト | ログイン時 | SignOutButton |
| ログイン | 未ログイン時 | /login |
| 新規登録 | 未ログイン時 | /register |

## 現在のファイル内容

### Header.tsx
```tsx
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
```

### HeaderNav.tsx
```tsx
"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import SignOutButton from "./SignOutButton";
import { Button } from "./ui/button";
import { logout } from "@/app/auth/actions";
import { User } from "@supabase/supabase-js";

type HeaderNavProps = {
    user: User | null;
    isAdmin: boolean;
};

export default function HeaderNav({ user, isAdmin }: HeaderNavProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current && !menuRef.current.contains(event.target as Node) &&
                menuButtonRef.current && !menuButtonRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
        else document.removeEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

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
                <Link href="/mypage/consultation" className="text-base font-bold text-slate-600 hover:text-primary-600 transition-colors px-2 py-1">
                    相談する
                </Link>
                {user ? (
                    <>
                        <Link href="/mypage" className="text-base font-bold text-slate-600 hover:text-primary-600 transition-colors px-2 py-1">
                            マイページ
                        </Link>
                        <SignOutButton />
                    </>
                ) : (
                    <>
                        <Link href="/login" className="text-base font-bold text-primary-600 hover:text-primary-700 transition-colors px-3 py-1.5 border border-primary-200 rounded-lg hover:bg-primary-50">
                            ログイン
                        </Link>
                        <Link href="/register" className="text-base font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors px-4 py-2 rounded-lg shadow-md">
                            新規登録
                        </Link>
                    </>
                )}
                <Link href="/for-clients" className="text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors px-4 py-2 rounded-full shadow-md ml-2">
                    採用企業様へ
                </Link>
            </nav>

            {/* Mobile Navigation Toggle */}
            <div className="md:hidden flex items-center">
                <button ref={menuButtonRef} onClick={toggleMenu} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full">
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div ref={menuRef} className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-lg p-4 flex flex-col gap-4 md:hidden z-50 animate-in slide-in-from-top-5">
                    {isAdmin && (
                        <Link href="/admin/jobs" onClick={toggleMenu} className="text-base font-bold text-red-600 hover:text-red-700 py-2 border-b border-slate-100">
                            管理画面
                        </Link>
                    )}
                    <Link href={user ? "/jobs" : "/login"} onClick={toggleMenu} className="text-base font-bold text-slate-600 hover:text-primary-600 py-2 border-b border-slate-100">
                        求人を探す
                    </Link>
                    <Link href="/mypage/consultation" onClick={toggleMenu} className="text-base font-bold text-slate-600 hover:text-primary-600 py-2 border-b border-slate-100">
                        相談する
                    </Link>
                    <Link href="/for-clients" onClick={toggleMenu} className="text-base font-bold text-slate-600 hover:text-primary-600 py-2 border-b border-slate-100">
                        採用企業様へ
                    </Link>
                    <div className="flex flex-col gap-3 mt-2">
                        {user ? (
                            <>
                                <Link href="/mypage" onClick={toggleMenu} className="w-full">
                                    <Button variant="outline" className="w-full justify-center">マイページ</Button>
                                </Link>
                                <div className="pt-2">
                                    <form action={async () => { await logout(); setIsMenuOpen(false); }}>
                                        <Button variant="ghost" className="text-base font-bold text-slate-600 hover:text-primary-600 w-full justify-center">ログアウト</Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={toggleMenu}>
                                    <Button variant="outline" className="w-full justify-center">ログイン</Button>
                                </Link>
                                <Link href="/register" onClick={toggleMenu}>
                                    <Button className="w-full justify-center bg-primary-600 hover:bg-primary-700 text-white">新規登録</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
```

## 作成・修正してほしいファイル
- `components/HeaderNav.tsx` — ナビゲーションUIのリニューアル（メインの変更対象）
- `components/Header.tsx` — 必要に応じてレイアウト微調整

## 制約
- `Header.tsx` の Server Component 構造（Supabase認証取得）は変更しない
- `HeaderNav.tsx` の Props（`user`, `isAdmin`）のインターフェースは維持する
- `SignOutButton` コンポーネントと `logout` Server Action はそのまま使う
- 既存の外部クリックでメニューを閉じる機能は維持する
- Tailwind CSS のカスタムカラー: primary-50〜950（オレンジ系）、secondary-50〜950（スレート系）

## ⚠️ 完了したら必ず: Claude への引き継ぎ文を作ってください

作業完了後、以下の形式で「Gemini → Claude 引き継ぎ」を作ってください。
このテキストを Claude に貼ると、スムーズに引き継ぎができます：

---
### Claude へのコピペ用テンプレート（完了時に記入してください）

```
# Gemini → Claude 引き継ぎ

## 作業内容
ヘッダーナビゲーションの UI リニューアルを実施しました

## 作成したファイル
- （新規ファイルがあれば記載）

## 修正したファイル
- `components/HeaderNav.tsx` — {変更内容}
- `components/Header.tsx` — {変更内容}

## 完了状態
- [ ] 完了（全て実装済み）
- [ ] 部分完了（{残課題}）
- [ ] 失敗（{理由}）

## その他
{特記事項があれば自由に記述}
```
