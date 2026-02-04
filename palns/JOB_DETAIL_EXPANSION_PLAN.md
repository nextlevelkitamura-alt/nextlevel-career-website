# Job Detail Expansion Plan

## 概要
求人詳細情報を大幅に拡充し、ユーザーにとって「分かりやすい」「応募したくなる」求人ページを実現します。
提供された参考画像を元に、給与詳細、雇用条件、勤務先情報などを構造化して管理・表示できるようにします。

## 1. Database Schema Update
Supabaseの `jobs` テーブルに以下のカラムを追加します。

### 新規追加カラム
| カラム名 | 型 | 説明 |
| :--- | :--- | :--- |
| `hourly_wage` | `integer` | 時給（検索・ソート用数値）。例: `1400` |
| `salary_description` | `text` | 給与詳細コメント（未経験/経験者の区分け、昇給条件など）。 |
| `period` | `text` | 雇用期間。例: 「3ヶ月以上の長期」「即日〜長期」 |
| `start_date` | `text` | 開始時期。例: 「即日スタート」「来月から」 |
| `workplace_name` | `text` | 勤務先名称（※求職者向けには店舗名などを表示）。 |
| `workplace_address` | `text` | 勤務地詳細住所。 |
| `workplace_access` | `text` | 最寄駅・アクセス情報。 |
| `attire` | `text` | 服装・髪型規定。 |
| `gender_ratio` | `text` | 男女比（任意）。 |

※ 既存の `salary` カラムは「表示用見出し（例: 時給1400円〜）」として維持し、`hourly_wage` はソートやフィルタリングに使用します。

## 2. Admin UI Update (管理画面)
求人作成・編集画面 (`app/admin/jobs/create/page.tsx`, `EditJobForm.tsx`) を改修し、新フィールドの入力欄を追加します。

### 実装等の変更点
- **セクション分割**: フォームを以下の論理セクションに整理します。
    1. **基本情報**: タイトル, エリア, 時給(数値), 表示用給与, 職種
    2. **詳細条件**: 期間, 開始日, 勤務時間, 休日, 応募資格
    3. **給与詳細**: 給与詳細テキスト (Markdown or Textarea)
    4. **勤務先情報**: 名称, 住所, アクセス, 服装
    5. **その他**: 福利厚生, 選考プロセス, タグ
- **AI抽出機能のアップデート**: 
    - `extractJobDataFromFile` 等のAI処理ロジックを更新し、PDFからこれらの新フィールドも抽出できるようにプロンプトを調整します（※これは実装フェーズで調整）。

## 3. Frontend UI Update (求人詳細ページ)
`app/jobs/[id]/page.tsx` を大幅リニューアルし、リッチな詳細表示を実装します。

### 新UIコンポーネント構成
- **Header Section**: タイトル, タグ, エリア, **時給(強調表示)**
- **Info Grid**: アイコン付きのスペック表（期間, 開始日, 勤務時間, 勤務地）
- **Detailed Sections**:
    - **給与**: 詳細テキスト、内訳など
    - **雇用条件**: テーブル形式で見やすく表示（添付画像1参照）
    - **仕事内容**: 既存のまま（箇条書き対応などを強化）
    - **勤務先**: 地図リンク（Google Maps URL生成）、アクセス情報
    - **応募方法**: フロー表示

## 実装ステップ

### Step 1: Migration
- [ ] マイグレーションファイル作成: `supabase/migrations/YYYYMMDD_expand_job_details.sql`
- [ ] ローカル/リモートへの適用

### Step 2: Types & Actions
- [ ] `utils/types.ts` (または `actions.ts` 内型定義) の更新
- [ ] `createJob`, `updateJob` Server Actions の更新

### Step 3: Admin UI
- [ ] `components/admin/JobFormFields.tsx` などのコンポーネント分割（フォームが肥大化しているため推奨）
- [ ] 新フィールド入力欄の実装

### Step 4: Frontend UI
- [ ] `app/jobs/[id]/page.tsx` の各種セクション実装
- [ ] UIデザイン調整（Shadcn UI + Tailwind）

### Step 5: AI Tuning (Optional but recommended)
- [ ] PDFからの抽出プロンプトの更新（新フィールド対応）

## 確認事項
- **Google Maps**: `workplace_address` から自動でリンクを生成しますか？（Yes推奨）
- **時給**: `salary` 文字列と `hourly_wage` 数値の二重管理になりますが、検索機能強化のために数値を分離します。
