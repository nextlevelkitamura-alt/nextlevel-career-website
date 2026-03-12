# Gemini 向けプロジェクト情報

## 目的
素晴らしい転職サイトを作成する

## 技術スタック
- フレームワーク: Next.js 14.2.33
- スタイリング: Tailwind CSS
- UIコンポーネント: Radix UI + shadcn/ui

## デザイン方針
- 配色: プライマリー（青系）、セカンダリー（ピンク系）
- 正社員: 青（`text-blue-600`, `bg-blue-50`, `border-blue-200`）
- 派遣: ピンク（`text-pink-600`, `bg-pink-50`, `border-pink-200`）

## 実装中のタスク
- 求人カードのUI改善（雇用形態・タグの色統一）

## 関連ファイル
- `components/JobCard.tsx` - 求人カードコンポーネント
- `app/jobs/[id]/page.tsx` - 求人詳細ページ
- `lib/utils.ts` - スタイルユーティリティ関数
