# プロジェクト全体像 (CONTEXT)

> このファイルは /refresh で生成・更新されました

## 目的

素晴らしい転職サイトを作る — キャリアアップを目指す求職者向けの求人検索・応募・相談プラットフォームを提供する。

---

## 現在の実装機能

### ユーザー認証
- ファイル: `app/login/page.tsx`, `app/register/page.tsx`
- 説明: Supabase Auth を使用したメールアドレス認証、パスワードリセット機能

### 求人検索・閲覧
- ファイル: `app/jobs/page.tsx`, `components/JobCard.tsx`, `components/SearchForm.tsx`
- 説明: エリア、カテゴリ、キーワードによる求人検索、カード一覧表示

### 求人詳細
- ファイル: `app/jobs/[id]/page.tsx`
- 説明: 求人詳細情報の表示、応募ボタン、おすすめ求人表示

### 応募機能
- ファイル: `components/jobs/ApplyButton.tsx`, `app/jobs/actions.ts`
- 説明: 求人への応募、応募履歴の保存

### マイページ
- ファイル: `app/mypage/page.tsx`, `app/mypage/layout.tsx`
- 説明: 応募履歴、プロフィール編集、チャット相談履歴

### チャット相談機能
- ファイル: `app/mypage/chat/page.tsx`, `app/admin/chat/page.tsx`
- 説明: 求職者と管理者の1対1チャット、リアルタイム更新

### キャリア診断
- ファイル: `app/diagnosis/page.tsx`, `app/diagnosis/result/page.tsx`, `app/diagnosis/actions.ts`
- 説明: AIによるキャリア診断、診断結果の表示

### 管理画面 - 求人管理
- ファイル: `app/admin/jobs/page.tsx`, `app/admin/jobs/[id]/page.tsx`, `app/admin/jobs/create/page.tsx`
- 説明: 求人のCRUD操作、下書き保存、公開/非公開

### 管理画面 - AI抽出機能
- ファイル: `components/admin/AiExtractButton.tsx`, `app/admin/actions.ts`
- 説明: 求人原稿テキストからAIで自動抽出・整形

### 管理画面 - チャットAI修正
- ファイル: `components/admin/ChatAIRefineDialog.tsx`, `components/admin/RefinementPreview.tsx`
- 説明: 自然言語での指示で求人内容をAI修正、項目別認証UI

### 管理画面 - バッチアップロード
- ファイル: `app/admin/batch-import/page.tsx`, `components/admin/BatchUploadSection.tsx`
- 説明: 複数の求人原稿を一括アップロード・公開

### 管理画面 - マスタ管理
- ファイル: `app/admin/masters/page.tsx`, `app/admin/masters/options/page.tsx`, `app/admin/masters/clients/page.tsx`
- 説明: エリア、カテゴリ、タグ、選考フローのマスタデータ管理

### 管理画面 - 応募管理
- ファイル: `app/admin/applications/page.tsx`, `app/admin/applications/ApplicationDetailModal.tsx`
- 説明: 応募一覧、応募詳細の表示・管理

### 管理画面 - ユーザー管理
- ファイル: `app/admin/users/page.tsx`, `app/admin/users/UserDetailModal.tsx`
- 説明: ユーザー一覧、ユーザー詳細の表示・管理

### 管理画面 - 企業お問い合わせ
- ファイル: `app/admin/corporate-inquiries/page.tsx`
- 説明: 企業からのお問い合わせ管理

### 企業向けLP
- ファイル: `app/for-clients/page.tsx`, `components/client-lp/`
- 説明: 企業向けのランディングページ、サービス紹介、お問い合わせフォーム

---

## 技術スタック

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Icons**: Lucide React

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime

### AI
- **API**: Google Gemini 2.0 Flash
- **用途**: 求人抽出、チャット修正、キャリア診断

### Infrastructure
- **Hosting**: Vercel
- **Email**: Resend

---

## 技術的負債・注意点

### 進行中の修正
- AI相談機能の入力バグ（IME変換中のEnter誤送信）— 修正済み、手動検証待ち

### 既知の問題
- 特になし

---

## 残課題

### UI改善
- 求人カードの雇用形態表示・タグの色統一（実装中）

### 機能拡張（検討中）
- 求人お気に入り機能
- 求人シェア機能
- 通知機能の拡充（メール通知設定）
- 統計ダッシュボード

---

## 関連ドキュメント

- [ROADMAP.md](./ROADMAP.md) — 全体計画
- [PROJECT_MASTER.md](../PROJECT_MASTER.md) — 設計図
- [status.md](./status.md) — 現在のステータス

---

最終更新: 2026-02-07
