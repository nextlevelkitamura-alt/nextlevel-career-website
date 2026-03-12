# UX & Performance Improvement Plan

## 概要
ユーザー体験(UX)の向上とサイトパフォーマンス、SEOの強化を目的とした改修計画。
特に「チャットのレスポンス体験」と「Googleしごと検索(Google for Jobs)対応」を重点的に行う。

## 1. Chat Optimistic UI Refinement (チャット体験向上)
現状の実装でもOptimistic UI（楽観的UI）は導入されているが、Server ActionのレスポンスとSupabase Realtimeのイベント競合により、メッセージが重複したり一瞬消えたりする「ちらつき」のリスクがある。これを解消し、堅牢にする。

### 現状の課題
- `handleSubmit` での State 更新（Temp -> Real）と、Realtime Subscription の `INSERT` イベント受信のタイミングによって、同一メッセージが重複表示される可能性がある。
- 送信中のステータス表示が「スピナー」のみで、ユーザーへの完了フィードバックが弱い。

### 実装方針
1. **重複排除ロジックの強化**:
   - `useChat.ts` 内で、メッセージの deduplication ロジックを改良する。
   - クライアント側で一時ID (`temp-id`) を管理し、Realtime イベント受信時に「そのメッセージが自分が送信したものか」を特定し、既存の `temp-id` を正規IDに置き換える処理（またはマージ）を行う。
2. **送信ステータスの視覚化**:
   - メッセージの横に「送信済み」「既読」などのステータスアイコンを追加（既読機能はバックエンド対応が必要なため、まずは送信完了チェックマーク）。

## 2. SEO & Structured Data (Googleしごと検索対応)
求人サイトとして最も重要な「Googleしごと検索」への掲載を確実にするため、構造化データ(JSON-LD)を実装する。

### 実装方針
- **JobPosting 構造化データの追加**:
  - `app/jobs/[id]/page.tsx` (求人詳細ページ) にて、`script type="application/ld+json"` を出力するコンポーネントを追加。
  - 求人データ (`salary`, `location`, `employmentType` 等) を Google のスキーマに合わせてマッピングする。
- **Metadata の拡充**:
  - OGP画像の動的生成（今回はスコープ外だが、静的設定は見直す）。

## 3. Performance Tuning (パフォーマンス最適化)
Core Web Vitals の改善、特に LCP (Largest Contentful Paint) / CLS (Cumulative Layout Shift) 対策。

### 実装方針
- **`next/image` の適用**:
  - 現在 `<img>` タグを使用している箇所（プロフィール画像、添付画像など）を `next/image` に置き換える。
  - `next.config.mjs` に Supabase Storage のドメイン許可設定を追加。
  - これにより、画像の遅延読み込みとサイズ最適化が自動化される。

## 実装ステップ

### Step 1: SEO Structure Data (JSON-LD)
- [ ] `components/jobs/JobPostingSchema.tsx` の作成
- [ ] 求人詳細ページへの埋め込み
- [ ] Google Rich Results Test での検証

### Step 2: Performance (next/image)
- [ ] `next.config.mjs` 設定変更
- [ ] ChatUI, AdminUI, JobCard 等の `img` タグ置換
- [ ] レイアウト崩れの確認・修正

### Step 3: Chat Optimistic UI Fix
- [ ] `useChat.ts` のリファクタリング（重複排除ロジック）
- [ ] UIへの「送信完了」インジケータ追加

## ユーザー確認事項
- チャットの「既読」機能は今回のスコープに含めますか？（DBスキーマ変更が必要なため、今回は「送信完了」までに留めることを推奨します）
