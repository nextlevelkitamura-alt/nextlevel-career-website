# Implementation Plan: 求人詳細フィールド拡張 & 表示リデザイン

## 1. Requirements Restatement

- スクリーンショットのような求人ボード（特徴タグ一覧、雇用形態、職種、給与詳細、勤務地階層表示、最寄駅、勤務地備考）を求人詳細ページに表示する
- 求人一覧カードも新フィールドを活用してリッチに表示する
- 管理画面（EditJobForm, DraftJobEditor）で新フィールドを入力可能にする
- AI抽出（Gemini）で新フィールドを自動抽出できるよう最適化する

## 2. Risk Assessment

- **LOW**: DBマイグレーション — 全て NULL 許容のカラム追加のため既存データへの影響なし
- **LOW**: 型定義の更新 — オプショナルフィールドの追加のみ
- **MEDIUM**: AI抽出プロンプト変更 — 抽出精度に影響する可能性あり（テストで検証必要）
- **LOW**: フロントエンド表示 — 新フィールドが空でも表示が崩れないようフォールバック処理が必要

## 3. Dependencies

- Supabase（DBマイグレーション実行）
- 既存の Gemini 2.0 Flash API（プロンプト変更のみ）
- 追加ライブラリ: なし

## 4. Implementation Phases

### Phase 1: DBマイグレーション（新カラム追加）

**対象**: `jobs` テーブル + `draft_jobs` テーブル

追加カラム（7つ、全て `text` 型、NULLable）:

| カラム名 | 説明 | 例 |
|---|---|---|
| `nearest_station` | 最寄駅 | 札幌駅 |
| `location_notes` | 勤務地備考 | 札幌駅徒歩5分以内 |
| `salary_type` | 給与形態 | 月給制, 時給, 年俸制 |
| `raise_info` | 昇給情報 | 昇給年1回 |
| `bonus_info` | 賞与情報 | 賞与年2回 ※業績に準ずる |
| `commute_allowance` | 交通費情報 | 一部支給 5万円/月 |
| `job_category_detail` | 詳細職種名 | 化粧品・コスメ販売(店長・チーフ・サブ) |

- [ ] マイグレーションSQL作成: `supabase/migrations/20260204_add_salary_and_location_details.sql`
- [ ] Supabaseで実行して確認

### Phase 2: 型定義の更新

- [ ] `app/jobs/jobsData.ts` — Job型に7フィールド追加
- [ ] `utils/types.ts` — DraftJob型、ExtractedJobData型に追加
- [ ] `app/admin/jobs/[id]/edit/EditJobForm.tsx` — ローカルJob型に追加
- [ ] `app/admin/actions.ts` — ExtractedJobData interfaceに追加
- [ ] `npx tsc --noEmit` でビルド確認

### Phase 3: Server Actions の更新

**対象ファイル**: `app/admin/actions.ts`

- [ ] `createJob` — formData.get() と insert文に新フィールド追加
- [ ] `updateJob` — formData.get() と updateData に新フィールド追加
- [ ] `updateDraftJob` — update文に新フィールド追加
- [ ] `publishDraftJobs` — draft→jobs の insert に新フィールド追加
- [ ] `startBatchExtraction` — draft_jobs への insert に新フィールド追加

### Phase 4: 管理画面の更新

#### 4-1. EditJobForm.tsx
- [ ] state変数7つ追加
- [ ] 「勤務先情報」セクションに最寄駅・勤務地備考の入力欄追加
- [ ] 「詳細条件」セクションに給与形態・昇給・賞与・交通費・詳細職種名の入力欄追加
- [ ] handleSubmit に formData.set() 追加

#### 4-2. DraftJobEditor.tsx
- [ ] state変数7つ追加
- [ ] フォームに新フィールドの入力欄追加
- [ ] handleSubmit に formData.set() 追加

### Phase 5: フロントエンド表示のリデザイン

#### 5-1. 求人詳細ページ (`app/jobs/[id]/page.tsx`)

タイトルカードの下に以下のセクションを追加・変更:

**特徴セクション**: tags をピンク系バッジで一覧表示

**求人情報テーブル** (dl/dt/dd形式):
```
| 雇用形態   | 正社員                                  |
| 職種       | 化粧品・コスメ販売(店長・チーフ・サブ)  |
| 給与       | 年収400万円 〜 500万円                  |
|            |   月給制/経験・スキルにより優遇          |
|            |   昇給年1回                            |
|            |   賞与年2回 ※業績に準ずる              |
|            |   交通費 一部支給 5万円/月              |
| 勤務地     | 北海道 > 札幌市 > 中央区                |
| 最寄駅     | 札幌駅                                  |
| 勤務地備考 | 札幌駅徒歩5分以内                      |
```

- [ ] 特徴セクション追加
- [ ] 求人情報テーブル（定義リスト形式）追加
- [ ] 給与サブ詳細（salary_type, raise_info, bonus_info, commute_allowance）表示
- [ ] 勤務地セクションに nearest_station, location_notes 追加
- [ ] 空フィールドのフォールバック処理

#### 5-2. 求人カード (`components/JobCard.tsx`)
- [ ] job_category_detail の表示追加（あれば）
- [ ] タグバッジのスタイルをピンク系に変更

### Phase 6: AI抽出プロンプトの最適化

**対象ファイル**: `app/admin/actions.ts`

- [ ] `extractJobDataFromFile` のJSON出力フォーマットに7フィールド追加
- [ ] `commonInstructions` に各フィールドの抽出ルール追加
- [ ] `refineJobWithAI` の `fieldDescriptions` に新フィールド追加
- [ ] `JobAIRefineButton` の対象フィールドに追加
- [ ] テスト: PDFアップロードで新フィールドが抽出されることを確認

## 5. Estimated Complexity

- **Medium**

## 6. Critical Files

| ファイル | 変更内容 |
|---|---|
| `supabase/migrations/20260204_add_salary_and_location_details.sql` | 新規作成 |
| `app/jobs/jobsData.ts` | Job型拡張 |
| `utils/types.ts` | DraftJob, ExtractedJobData型拡張 |
| `app/admin/actions.ts` | CRUD + AI抽出プロンプト更新 |
| `app/admin/jobs/[id]/edit/EditJobForm.tsx` | 管理画面フォーム拡張 |
| `components/admin/DraftJobEditor.tsx` | ドラフト編集フォーム拡張 |
| `app/jobs/[id]/page.tsx` | 求人詳細ページリデザイン |
| `components/JobCard.tsx` | 求人カード表示更新 |
| `components/admin/JobAIRefineButton.tsx` | AI refinement対象フィールド追加 |

## 7. Verification

1. `npm run build` でビルドエラーがないことを確認
2. 管理画面で新フィールドの入力・保存・読み込みを確認
3. 求人詳細ページで新フィールドが正しく表示されることを確認
4. 新フィールドが空の既存求人で表示が崩れないことを確認
5. AI抽出でPDFから新フィールドが抽出されることを確認
6. Vercelへデプロイしてビルド成功を確認
