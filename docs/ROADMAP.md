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
- **Hosting**: Google Cloud Run
- **Container Registry**: Google Container Registry
- **Secrets**: Google Secret Manager
- **Testing**: Jest

---

## インフラ

### Cloud Run設定
- **Region**: asia-northeast1（東京）
- **Min instances**: 0（コスト最適化）
- **Max instances**: 10
- **CPU**: 1 vCPU
- **Memory**: 512 MiB
- **Concurrency**: 80

### 開発環境
- **ローカルURL**: `http://localhost:3003`（ポート: 3003）
- **本番URL**: `https://nextlevel-career-site-rxoneg3z6a-an.a.run.app`

### デプロイ
- **開発**: ローカルDockerビルド＆テスト（`npm run docker:test`）
- **本番**: `npm run deploy`でCloud Runにデプロイ

### 外部サービス設定
- **Supabase プロジェクト**: `oqrvutvyyscvacmxvpkk`
  - [URL Configuration](https://supabase.com/dashboard/project/oqrvutvyyscvacmxvpkk/auth/url-configuration)
  - [Google Provider](https://supabase.com/dashboard/project/oqrvutvyyscvacmxvpkk/auth/providers)
  - Callback URL: `https://oqrvutvyyscvacmxvpkk.supabase.co/auth/v1/callback`
- **GCP プロジェクト**: `gen-lang-client-0809327682`
  - [OAuth 認証情報](https://console.cloud.google.com/apis/credentials?project=gen-lang-client-0809327682)

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

#### 🔧 クリック分析ドリルダウン機能 → [仕様](specs/booking-clicks-analytics.md) | [計画](plans/features/booking-clicks-drilldown.md)
- 状態: 設計完了、実装待ち
- 内容: 応募・相談クリックを地域・業種・雇用形態で分析する詳細ページ

#### 🔧 求人エディタAI統一・データ堅牢化 → [仕様](specs/ai-extraction.md) | [計画](plans/features/job-editor-ai-unification.md)
- 状態: 設計完了、実装待ち
- 内容: 編集画面のAI抽出UXを新規作成と統一、差分プレビューUI追加、データ保存の堅牢化

#### ○ DraftJobEditor の正社員フィールド編集UI
- 状態: 未着手
- 内容: バッチインポート画面（DraftJobEditor）で正社員専用フィールド（企業名、年収レンジ、企業概要など）を手動編集できるUIを追加
- 備考: 現状はAI抽出→自動保存→publishで動作するが、下書き段階での手動編集はできない

---

### 未実装・検討中の機能

#### UI・UX 改善
- 🔧 求人UIの改善（→ Gemini 3.0 Pro に実装中）→ [計画書](plans/features/job-ui-and-ai-improvement.md)
  - カードUIのデザイン改善（アイコン、色、レイアウト）
  - 詳細ページの情報構成改善
  - おすすめ表示の精度向上
- ✅ 正社員求人情報拡充 v2 → [計画書](plans/features/fulltime-job-enrichment-v2.md)
  - ✅ 複数勤務地対応（DB追加 + AI + フォーム + 表示）
  - ✅ 勤務時間シフト制対応（AIプロンプト改善）
  - ✅ 売上高フィールド追加（DB追加 + AI + フォーム + 表示）
  - ✅ 選考フローSTEP形式表示（正社員・派遣共通）
  - ✅ 派遣求人詳細ページにアイコン追加
  - ✅ フォーム→DB→詳細表示の一貫性修正（派遣詳細に未表示フィールド6件追加）

#### AI機能の改善
- ✅ AI求人抽出の改善とAPI料金最適化 (Phase 1-4) → [仕様](specs/ai-extraction.md)
  - ✅ トークン使用量計測・ログ
  - ✅ プロンプト最適化（system instruction分離）
  - ✅ 新DB項目対応（派遣/正社員、型定義・判定ロジック）
  - ✅ バリデーション関数
  - ○ 企業名の匿名化オプション（Phase 5、未実施）
  - ○ DB INSERT・refinement統合（UI側で実施）

#### その他
- ○ 通知機能の拡充（メール通知設定）
- ○ 求人お気に入り機能
- ○ 求人シェア機能
- ○ 応募ステータスの変更通知
- ○ 統計ダッシュボード

---

## 雇用形態の色分け仕様

| 雇用形態 | 色（Tailwind） | スタイル |
|---------|----------------|----------|
| 正社員 | 青 (`text-white`, `bg-blue-600`) | ソリッド（濃い背景・白文字） |
| 派遣 / 紹介予定派遣 | ピンク (`text-white`, `bg-pink-600`) | ソリッド（濃い背景・白文字） |

> タグの色も雇用形態に合わせて統一

---

## 完了履歴

### 2026-02-20
- 正社員AI出力品質改善
  - **福利厚生（benefits）**: ※印・括弧等の記号も含め原文完全転記ルール強化
  - **休日休暇（holidays）**: 括弧内の付帯情報（日数・条件）を含めるよう具体例追加
  - **年間休日（annual_holidays）**: ※条件（「配属先による」等）を含める例追加
  - **勤務時間**: shift_notes フィールド追加で※印の補足情報（所定労働時間、休憩詳細等）を別途保存可能に
  - **給与関連**: 正社員プロンプトで昇給・賞与・通勤交通費の「絶対に空にしない」を強化
  - **必須要件・歓迎要件**: 正社員重点抽出項目の最上位に requirements を追加し「空出力は禁止」と明記
- **DBマイグレーション追加**: `fulltime_job_details` テーブルに `shift_notes` カラム追加
- **UI追加**: `FulltimeJobFields` コンポーネントに勤務時間補足（shift_notes）入力欄追加
- 修正ファイル: `utils/promptBuilder.ts`, `app/admin/actions/jobs.ts`, `components/admin/FulltimeJobFields.tsx`, `utils/types.ts`, `utils/jobDataProcessor.ts`, `app/admin/jobs/[id]/edit/EditJobForm.tsx`, `app/admin/jobs/create/page.tsx`, `supabase/migrations/20260220_add_shift_notes_to_fulltime.sql`
- 派遣詳細ページの未表示フィールド6件を追加（workplace_name, workplace_address, shift_notes, selection_process, client_company_name, start_date）
- フォーム→DB→詳細表示の一貫性を全フィールドで確認・修正完了
- AI抽出プロンプトチューニング（ハルシネーション防止強化）
- 正社員求人データの保存不整合を修正
  - `FulltimeJobDetails` 型に6フィールド追加（education_training, representative, capital, work_location_detail, salary_detail, transfer_policy）
  - バッチインポート時にAI抽出した正社員/派遣専用フィールドを `ai_analysis` JSONBに保存するよう修正
  - `publishDraftJobs` に `fulltime_job_details` / `dispatch_job_details` テーブルへの insert 処理を追加
  - `updateDraftJob` の欠落フィールド（search_areas, hourly_wage 等9項目）を追加
  - 修正ファイル: `utils/types.ts`, `app/admin/actions.ts`, `app/admin/actions/batch.ts`
- 既存ビルドエラー修正（未使用import削除、BookingButton.tsx の any 型 lint 対応）
- GitHub Actions経由でのCloud Runデプロイフロー確立（PR → main マージ → 自動デプロイ）

### 2026-02-16
- 派遣フォームに住所・アクセス欄を追加（DispatchJobFields, create/page.tsx, EditJobForm.tsx）
- AI抽出プロンプト改善
  - 選考プロセス（面談→採用の矢印形式、面談を必ず含む）
  - 仕事内容に改行を含める（2-3段落、箇条書き対応）
  - actual_work_hours / work_days_per_week は数値のみ出力
  - 勤務時間は最大2情報（固定/シフト制フォーマット統一）
  - 実働時間を休憩時間から自動計算
- 求人カード表示統一（salary テキスト優先、空カテゴリタグ非表示）
- ヒーローセクション文字間隔調整（tracking-wide, leading-relaxed）
- EditJobFormビルドエラー修正（DispatchJobFields新props対応）

### 2026-02-13
- GitHub Secrets設定ミス修正 + Cloud Runリダイレクト問題修正
- 求人詳細ページ改善（Phase 2）完了
- AI求人抽出の改善 Phase 1-4（TDD）— トークン計測、プロンプト最適化、新DB項目対応、バリデーション

### 2026-02-12
- Google認証のセッション未確立バグ修正
  - middleware.tsで認証コードを/auth/callbackにリダイレクト
  - callback/route.tsでCookieをredirectレスポンスに明示的に設定
- Google認証の改善（エラーUI追加、ステール状態クリア、環境変数化）

### 2026-02-10
- VercelからGoogle Cloud Runへの移行完了 🚀
  - Dockerマルチステージビルドの実装
  - next.config.mjsにstandalone設定追加
  - Secret Managerによる環境変数管理
  - ローカルからCloud Runへの直接デプロイ完了
  - サービスURL: https://nextlevel-career-site-50463545846.asia-northeast1.run.app

### 2026-02-07
- `/refresh` 実施 — プロジェクト全体の整理とドキュメント再構築
- 求人カードUI改善（雇用形態・タグの色統一）— 正社員→青ソリッド、派遣→ピンクソリッド（Gemini 3.0 Pro）

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

最終更新: 2026-02-20
