---
status: completed
category: bugfix
priority: high
created: 2025-02-05
completed: 2025-02-05
related: []
---

# attireカラムエラーの修正

## 完了日

2025-02-05

## 実装内容の概要

求人更新時に発生していたデータベーススキーマエラーを修正しました。`attire`カラムなど不足していたカラムのマイグレーションファイルを作成し、存在しない`gender_ratio`カラムへの参照をコードから削除しました。

## 詳細

詳細な実装記録は `docs/summaries/20260205-fix-attire-column-error-summary.md` を参照してください。

## 変更ファイル

- `supabase/migrations/20260205_add_attire_column.sql` - 新規作成
- `supabase/migrations/20260205_add_missing_job_columns.sql` - 新規作成
- `app/admin/actions.ts` - gender_ratio参照を削除
- `app/admin/jobs/create/page.tsx` - gender_ratio参照を削除
- `app/admin/jobs/[id]/edit/EditJobForm.tsx` - gender_ratio参照を削除
- `components/admin/JobPreviewModal.tsx` - gender_ratio参照を削除
