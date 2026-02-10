# Claude → Gemini 引き継ぎ

> この内容を Gemini 3.0 Pro にコピペストしてください

## 更新日時
2026-02-09

## プロジェクト
NextLevel Career Site: キャリアアップを目指す求職者向けの求人検索・応募・相談プラットフォーム

## Gemini にやってもらいたいこと
求人の見え方を改善してください（カードUI、詳細ページ、おすすめ表示）

## 画面イメージ

### カードUI（情報重視・Indeed風）
- 情報を詰め込み、給与やタグも見えるようにする
- 現在の情報量を維持しつつ、より見やすく整理
- 雇用形態・タグの配色は維持（正社員=青ソリッド、派遣=ピンクソリッド）

### 詳細ページ（重要情報固定）
- 重要な情報（給与、応募ボタン）を常に表示
- スクロールしてもCTAがアクセシブルに

### 配色・雰囲気
- 現在のオレンジ系（primary-600/700など）を基調に維持
- 既存のカラースキームを尊重
- 余計な色は足さず、今の雰囲気を保つ

## 技術情報
- フレームワーク: Next.js 14 (App Router)
- スタイリング: Tailwind CSS
- UIライブラリ: shadcn/ui, Radix UI
- アイコン: Lucide React

## 作成・修正してほしいファイル
- `components/JobCard.tsx` — 求人カード（メイン）
- `app/jobs/[id]/page.tsx` — 求人詳細ページ
- `components/RecommendedJobs.tsx` — おすすめ求人（存在する場合）
- `lib/utils.ts` — 必要に応じてユーティリティ関数を追加

## 既存コンポーネント（再推奨）
- `getEmploymentTypeStyle(type)` — 雇用形態のスタイル取得（青/ピンク）
- `getJobTagStyle(type)` — タグのスタイル取得（雇用形態に合わせる）
- `cn()` — clsx/tailwind-merge のラッパー

## 重要な制約
- 雇用形態の色分けは変更しない（正社員=青、派遣=ピンク）
- オレンジ系（primary-600/700）を基調色として維持
- レスポンシブ対応（モバイルファースト）

## 参考資料（Gemini にも見てほしい）
- `docs/ROADMAP.md` — 全体像、雇用形態の色分け仕様
- `docs/CONTEXT.md` — 現在の実装機能
- `docs/plans/active/current.md` — 今回の改善プラン
- `components/JobCard.tsx` — 現在のカード実装
- `app/jobs/[id]/page.tsx` — 現在の詳細ページ

## 完了したら
完了したら `/gemini-done` を実行してください。
`docs/handoff/from-gemini.md` に結果を記入してください。
