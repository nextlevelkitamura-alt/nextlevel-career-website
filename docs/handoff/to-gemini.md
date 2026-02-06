# Claude → Gemini 引き継ぎ

> この内容を Gemini 3.0 Pro にコピペストしてください

## 更新日時
2026-02-07

## プロジェクト
NextLevel Career Site: 素晴らしい転職サイト

## Gemini にやってもらいたいこと
求人カードと求人詳細ページでの「雇用形態表示」と「タグ」の色を正しく表示してください。

## 現在の問題
- 正社員の文字に青色がついている ✅
- **派遣の文字に色がついていない** ❌（これを直してほしい）
- タグにも雇用形態に合わせた色がついていない ❌（これも直してほしい）

## 画面イメージ
- 雰囲気: シンプル・清潔感のある転職サイト
- 配色:
  - 正社員: **青系統**（`text-blue-600`, `bg-blue-50`, `border-blue-200`）
  - 派遣: **ピンク系統**（`text-pink-600`, `bg-pink-50`, `border-pink-200`）
- レイアウト: カード型の求人一覧

## 技術情報
- フレームワーク: Next.js 14.2.33
- スタイリング: Tailwind CSS
- UIライブラリ: Radix UI + shadcn/ui

## 作成・修正してほしいファイル
- `lib/utils.ts` - スタイルユーティリティ関数（`getEmploymentTypeStyle`, `getJobTagStyle`）
- `components/JobCard.tsx` - 求人カードコンポーネント
- `app/jobs/[id]/page.tsx` - 求人詳細ページ

## 既存コンポーネント
- `components/JobCard.tsx` - 求人一覧カード
- `components/ui/` - shadcn/ui コンポーネント

## データ構造
- 雇用形態（`type` フィールド）: "正社員", "派遣", "紹介予定派遣" など
- 派遣系はすべてピンク色で統一

## 参考資料（Gemini にも見てほしい）
- `docs/ROADMAP.md` — 全体像
- `docs/Gemini.md` — 技術スタック・デザイン方針
- `lib/utils.ts` — 現在のスタイル関数

## 期待する結果
1. 求人カードで「派遣」の文字に**ピンク色**が表示される
2. 求人詳細ページでも「派遣」の文字に**ピンク色**が表示される
3. タグが雇用形態に合わせて色分けされる（正社員→青、派遣→ピンク）

## 完了したら
完了したら `/gemini-done` を実行してください。
`docs/handoff/from-gemini.md` に結果を記入してください。
