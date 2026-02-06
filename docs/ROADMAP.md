# NextLevel Career Site - ROADMAP

> キャリアアップを目指す求職者向けの求人検索・応募・相談プラットフォーム

## ビジョン

素晴らしい転職サイトを作る — ユーザーにとって分かりやすく、使いやすく、効果的なキャリアアッププラットフォームを提供する。

---

## 技術スタック

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **UI Components**: shadcn/ui, Radix UI, Lucide React
- **AI**: Google Gemini 2.0 Flash (Gemini API)
- **Email**: Resend
- **Hosting**: Vercel
- **Testing**: Jest

---

## 実装方針

- **ロジック**: Claude Code (`/tdd`, `/d`)
- **UI**: Gemini 3.0 Pro / Claude Code

---

## 現在のフェーズ

### Phase 1: コア機能開発

---

## 機能一覧

### 実装済み

#### ユーザー向け機能
- ✅ ユーザー登録・ログイン (Supabase Auth)
- ✅ パスワードリセット
- ✅ 求人検索・一覧表示
- ✅ 求人詳細ページ
- ✅ 求人応募機能
- ✅ マイページ
- ✅ 応募履歴管理
- ✅ プロフィール編集
- ✅ アバター画像アップロード
- ✅ チャット相談機能
- ✅ キャリア診断
- ✅ おすすめ求人表示

#### 企業向け機能
- ✅ 企業向けLP (`/for-clients`)
- ✅ 企業お問い合わせフォーム
- ✅ お問い合わせ管理（管理画面）

#### 管理画面機能
- ✅ 求人管理（CRUD）
- ✅ 下書き管理
- ✅ AI抽出機能（求人原稿から自動抽出）
- ✅ チャットAI修正機能（自然言語で求人内容を修正）
- ✅ 項目別認証UI（修正案を個別に適用/不適用）
- ✅ バッチ一括アップロード・公開
- ✅ ユーザー管理
- ✅ 応募管理
- ✅ マスタデータ管理（エリア、カテゴリ、タグ、選考フローなど）
- ✅ 管理者間チャット機能
- ✅ 通知機能

#### その他
- ✅ レスポンシブデザイン（モバイルファースト）
- ✅ SEO 対応 (robots.txt, sitemap.xml)
- ✅ エラーハンドリング
- ✅ ログ送信

---

### 進行中のプラン

#### AI相談機能の入力バグ修正
- ファイル: `docs/plans/active/20260205-fix-chat-ai-input.md`
- 状態: 手動検証待ち（修正適用済み、型チェック済み）
- 内容: 日本語入力（IME変換中）にEnterを押すと誤送信される問題を修正

---

### 未実装・検討中の機能

- ○ 通知機能の拡充（メール通知設定）
- ○ 求人お気に入り機能
- ○ 求人シェア機能
- ○ 応募ステータスの変更通知
- ○ 統計ダッシュボード

---

## 雇用形態の色分け仕様

| 雇用形態 | 色（Tailwind） |
|---------|----------------|
| 正社員 | 青 (`text-blue-600`, `bg-blue-50`, `border-blue-200`) |
| 派遣 / 紹介予定派遣 | ピンク (`text-pink-600`, `bg-pink-50`, `border-pink-200`) |

> タグの色も雇用形態に合わせて統一

---

## 完了履歴

### 2026-02-07
- `/refresh` 実施 — プロジェクト全体の整理とドキュメント再構築

### 2026-02-05
- AI修正機能の拡張と項目別認証UI
  - 詳細条件フィールド（勤務先、給与、雇用条件）のAI抽出対応
  - 項目別認証UI（チェックボックス）の実装

### 2026-02-05
- attire カラムエラーの修正

### 2026-02-04
- チャットボット風AI Refinement機能の実装

### 2025-02-XX
- 求人詳細ページの拡張
- AI抽出機能の拡張

---

## 関連ドキュメント

- [PROJECT_MASTER.md](../PROJECT_MASTER.md) — プロジェクト全体設計
- [CONTEXT.md](./CONTEXT.md) — 仕様書・実装詳細
- [status.md](./status.md) — 現在のステータス
- [index.md](./index.md) — ドキュメントインデックス
- [handoff/gemini-usage-guide.md](./handoff/gemini-usage-guide.md) — Gemini 2.0 Flash実装ガイド

---

最終更新: 2026-02-07
