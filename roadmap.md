# 求人機能 最適化ロードマップ

## 対象
- 求人登録（管理画面）
- 求人一覧表示（`/jobs`）
- 求人詳細表示（`/jobs/[id]`）

## 目標（KPI）
- 一覧API P95: `<= 300ms`
- 詳細API P95: `<= 250ms`
- 登録処理失敗率: `<= 0.5%`
- 登録処理の部分失敗（jobsだけ保存される等）: `0件`

## 現状の主なボトルネック
- 一覧取得が `select("*") + 詳細リレーション` で過剰取得。
- `/jobs` が `force-dynamic` + 全件取得 + クライアント側フィルタ。
- エリア検索がDBで絞れず、取得後フィルタになっている。
- 登録処理が巨大1関数で、複数テーブル保存が非トランザクション。
- `job_code` が乱数生成のみで衝突対策が弱い。

## 最適化方針（設計）
1. Read/Write 分離（CQRSライト）
- 書き込み: 正規化テーブル（`jobs`, `dispatch_job_details`, `fulltime_job_details`, `job_attachments`）。
- 読み取り: 一覧専用の軽量View/Materialized Viewを用意（カード表示に必要な列のみ）。

2. 一覧と詳細で取得カラムを完全分離
- 一覧: `id, title, area, search_areas, type, category, salary, hourly_wage, tags, job_code, created_at, expires_at` + 最小限の詳細列。
- 詳細: 現行同等のフル列。

3. 検索をDB側に寄せる
- `search_areas` は `GIN` インデックス＋一致条件を整理。
- 部分一致は必要最小限にし、都道府県単位は正規化カラムを追加（例: `primary_prefecture`）。
- タグは `GIN(tags)` を利用。

4. 登録処理をトランザクション化
- Supabase RPC（Postgres function）で「jobs作成 + 詳細作成 + 添付メタ保存」を1トランザクション化。
- 添付ファイルアップロード後のDB保存失敗時は補償処理（不要ファイル削除）を実装。

5. キャッシュ戦略を明確化
- 一覧: `revalidate` ベース（30-120秒）＋タグマスタは長めTTL。
- 詳細: `revalidate`（60-300秒）＋応募/閲覧等の副作用は非同期。
- 管理画面更新後は対象パスのみ `revalidatePath`。

## 実装ロードマップ

## Phase 1（即効改善: 1-2日）
- `app/jobs/actions.ts` の一覧クエリを軽量化（`*`廃止）。
- 一覧をページング化（`limit`, `offset` または cursor）。
- `/jobs` の初期絞り込みをサーバー側で実施（URLパラメータ対応）。
- `getRecommendedJobs` の取得列を最小化。

成果物
- 一覧表示の転送量削減
- 初回表示速度改善

## Phase 2（検索最適化: 2-3日）
- マイグレーション追加:
  - `jobs(expires_at, created_at desc)` 複合インデックス
  - `GIN(search_areas)`, `GIN(tags)`
  - 必要なら `primary_prefecture` 追加＋B-Tree index
- エリア検索ロジックをSQL条件中心へ置換。

成果物
- 検索時の全件取得を解消
- DB負荷とレスポンスの安定化

## Phase 3（登録処理の堅牢化: 3-4日）
- `createJob`/`updateJob` の入力整形を共通化（`schema + mapper`）。
- RPC化でトランザクション保存へ移行。
- `job_code` をDB制約で一意化（`UNIQUE`）し、採番をDB側に移管。
- 添付処理を並列化（上限付き）し、失敗時の補償処理を追加。

成果物
- 部分保存バグの防止
- メンテしやすい登録ロジック

## Phase 4（運用最適化: 継続）
- メトリクス計測（API時間、エラー率、件数）を定点観測。
- スロークエリ監視（Supabase query insights）。
- 高頻度条件に合わせて追加インデックスを微調整。

## 推奨ディレクトリ再編
- `app/jobs/actions.ts`:
  - `getPublicJobsList`（一覧専用）
  - `getPublicJobDetail`（詳細専用）
  - `searchPublicJobs`（検索専用）
- `app/admin/actions/jobs.ts`:
  - `normalizeJobForm.ts`（入力整形）
  - `jobWriteService.ts`（保存オーケストレーション）

## 先に着手すべき順序
1. 一覧クエリ軽量化 + ページング
2. インデックス整備 + 検索SQL化
3. 登録処理トランザクション化
4. 計測と再調整

## リスクと対策
- リスク: 検索条件変更で結果件数が変わる
- 対策: 既存条件との比較テスト（スナップショット）

- リスク: RPC化で実装複雑化
- 対策: まず `createJob` のみRPC化し、`updateJob` は次段階で移行

- リスク: キャッシュにより更新反映が遅れる
- 対策: 管理画面更新時の `revalidatePath` 対象を明示管理

## 完了条件（Definition of Done）
- 一覧/詳細のP95が目標内
- 登録の部分失敗が再現しない
- 検索で全件取得フォールバックが消える
- 主要パスにテスト追加（一覧検索、詳細取得、登録保存）

## 引き継ぎメモ（2026-02-23）

### 今回の実装反映
- 一覧取得をサーバー主導へ変更:
  - `app/jobs/actions.ts` に `getPublicJobsList` を追加（filter + page + count）
  - 一覧用取得カラムを最小化（`JOB_LIST_SELECT`）
- 詳細取得を明示化:
  - `app/jobs/actions.ts` に `getPublicJobDetail` を追加
  - `app/jobs/[id]/page.tsx` は `getPublicJobDetail` を利用
- 一覧UIをサーバー検索連動に変更:
  - `components/SearchForm.tsx` を URL クエリpush方式へ変更
  - `app/jobs/page.tsx` で `area/type/category/page` を受け取りDB検索
  - `app/jobs/JobsClient.tsx` からクライアント側全件filterを削除
  - `app/jobs/JobsClient.tsx` にページネーションUI（前へ/次へ）を追加
- 推薦・エリア検索クエリを軽量化:
  - `app/jobs/actions.ts` の `getRecommendedJobs` / `searchJobsByArea` を必要列中心に縮小
- DBインデックス追加（マイグレーション）:
  - `supabase/migrations/20260223_optimize_jobs_listing_indexes.sql`
- 管理画面の登録/更新ロジックの安全化（`app/admin/actions/jobs.ts`）:
  - `search_areas`, `tags`, 数値項目のパースを共通ヘルパー化
  - `job_code` 生成を「重複チェック付き採番」へ変更
  - 添付アップロード後にDB登録失敗した場合、Storage側ファイルを削除する補償処理を追加
- `job_code` 一意制約の準備（ガード付き）:
  - `supabase/migrations/20260223_add_unique_job_code_guarded.sql`
  - 既存重複がある場合は index 作成をスキップして NOTICE を出す仕様
- 作成処理のトランザクション化（RPC）:
  - `supabase/migrations/20260223_create_job_with_details_rpc.sql`
  - `create_job_with_details(p_job, p_dispatch, p_fulltime)` を追加
  - `app/admin/actions/jobs.ts#createJob` は RPC 呼び出しへ移行（jobs + details を1トランザクション化）
- 更新処理のトランザクション化（RPC）:
  - `supabase/migrations/20260223_update_job_with_details_rpc.sql`
  - `update_job_with_details(p_job_id, p_job, p_dispatch, p_fulltime)` を追加
  - `app/admin/actions/jobs.ts#updateJob` は RPC 呼び出しへ移行（jobs + details を1トランザクション化）
- 一覧/エリア検索のDB検索化（`search_areas` 対応）:
  - `supabase/migrations/20260223_search_jobs_rpc.sql`
  - `get_public_jobs_list_rpc(...)`, `search_jobs_by_area_rpc(...)` を追加
  - `search_areas` は `unnest(...) ILIKE` でDB側判定（取得後filterを撤廃）
  - `app/jobs/actions.ts` の `getPublicJobsList`, `searchJobsByArea` をRPC呼び出しへ移行
- 既存lint警告の解消:
  - `components/admin/DraftJobsList.tsx` の `useEffect` 依存警告を `useCallback` 導入で修正
- `job_code` のDB採番化:
  - `supabase/migrations/20260223_db_job_code_generator.sql`
  - `generate_unique_job_code()` を追加
  - `create_job_with_details(...)` を差し替え、`job_code` 未指定時はDB側で採番
  - `app/admin/actions/jobs.ts#createJob` のアプリ側採番を削除
- 軽量パフォーマンス計測ログを追加:
  - `lib/perf.ts` を追加（`createPerfTimer`）
  - `app/jobs/actions.ts`（一覧/詳細/エリア検索）で実行時間ログ出力
  - `app/admin/actions/jobs.ts`（create/update）で実行時間ログ出力

### 未着手（次フェーズ）
- P95計測の可視化と回帰監視
