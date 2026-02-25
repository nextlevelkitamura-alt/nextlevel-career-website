# 2026-02-23 Manual SQL Steps

## 目的
- Supabase SQL Editorで、1ファイルずつ `Run` できるように分割した手動実行セットです。
- `Analyze (EXPLAIN)` は単一SQLのみ対応なので、関数作成SQLには使わないでください。

## 実行順
### 一括実行（おすすめ）
1. `00_run_all.sql` をSQL Editorに貼り付け
2. `Run` を押す（`Analyze` は使わない）

### 分割実行
1. `01_indexes.sql`
2. `02_unique_job_code_guarded.sql`
3. `03_fn_generate_unique_job_code.sql`
4. `04_fn_create_job_with_details.sql`
5. `05_grants_create_and_generator.sql`
6. `06_fn_update_job_with_details.sql`
7. `07_grants_update.sql`
8. `08_fn_get_public_jobs_list_rpc.sql`
9. `09_fn_search_jobs_by_area_rpc.sql`
10. `10_grants_search_rpcs.sql`

## Analyze の実行例（単一クエリのみ）
```sql
EXPLAIN ANALYZE
SELECT * FROM get_public_jobs_list_rpc('東京', NULL, NULL, 24, 0);
```

```sql
EXPLAIN ANALYZE
SELECT * FROM search_jobs_by_area_rpc('大阪府', '正社員', NULL, 10);
```
