# Implementation Summary: attireカラムエラーの修正

完了日: 2025-02-05

## 元のプラン

- プランファイル: `docs/plans/active/20260205-fix-attire-column-error.md`
- 作成日: 2025-02-05
- 完了日: 2025-02-05

## 実装内容

### 元の問題

ユーザーが求人更新時に以下のエラーが発生：

```
Could not find the 'attire' column of 'jobs' in the schema cache
```

さらに調査の結果、`gender_ratio`カラムの参照も同様のエラーを引き起こしていることが判明。

### 解決策

1. **attireカラムの追加**: `jobs`テーブルに`attire`カラムを追加するマイグレーションを作成
2. **gender_ratio参照の削除**: コード内のすべての`gender_ratio`参照を削除

### 実装フェーズ

#### Phase 1: マイグレーションファイルの作成
- [x] `supabase/migrations/20260205_add_attire_column.sql` を作成
- [x] `supabase/migrations/20260205_add_missing_job_columns.sql` を作成（追加で必要なカラム）

#### Phase 2: コード修正
- [x] `app/admin/actions.ts` - `gender_ratio`のformData取得・insert/updateを削除（2箇所）
- [x] `app/admin/jobs/create/page.tsx` - `formData.set("gender_ratio", "")`とpreviewの`gender_ratio: ""`を削除
- [x] `app/admin/jobs/[id]/edit/EditJobForm.tsx` - 型定義と`formData.set("gender_ratio", "")`を削除
- [x] `components/admin/JobPreviewModal.tsx` - 型定義と男女比の表示UIを削除

#### Phase 3: デプロイ
- [x] Git commit & push
- [x] Vercelデプロイ（自動）

## 実装の記録

### 発見された問題

当初は`attire`カラムの欠如が問題だと考えられていましたが、実際の調査で以下のことが判明：

1. `attire`カラムは必要（後方互換性のため）
2. `attire_type`, `hair_style`, `commute_allowance`, `job_category_detail`カラムも必要
3. **`gender_ratio`カラムはデータベースに存在しない**が、コード内で参照されていることが真の問題

### 解決アプローチ

- 既存のカラム（`attire`, `attire_type`など）を追加するマイグレーションを作成
- 存在しないカラム（`gender_ratio`）への参照をすべて削除

### カラムの役割

- `attire`: 服装・髪型を一文で表現した文字列（後方互換性用）
- `attire_type`: 服装をプルダウンで選択
- `hair_style`: 髪型をプルダウンで選択
- `gender_ratio`: 男女比（現在は使用しない）

## 使用した技術

- 言語: TypeScript
- データベース: Supabase (PostgreSQL)
- フレームワーク: Next.js 15

## 学んだこと

- データベーススキーマとコードの不一致は、grep等で徹底的に調査することで特定できる
- 複数のカラムが不足している場合は、一度にまとめてマイグレーションを作成するのが効率的
- 型チェック（`npx tsc --noEmit`）でエラーがないことを確認してからデプロイすること

## 関連ファイル

### 作成したファイル
- `supabase/migrations/20260205_add_attire_column.sql`
- `supabase/migrations/20260205_add_missing_job_columns.sql`

### 修正したファイル
- `app/admin/actions.ts` - 4箇所のgender_ratio参照を削除
- `app/admin/jobs/create/page.tsx` - 2箇所のgender_ratio参照を削除
- `app/admin/jobs/[id]/edit/EditJobForm.tsx` - 型定義とformData.setを削除
- `components/admin/JobPreviewModal.tsx` - 型定義と表示UIを削除

### Gitコミット
- `f04e0d2` - fix: remove gender_ratio references to fix database schema error
