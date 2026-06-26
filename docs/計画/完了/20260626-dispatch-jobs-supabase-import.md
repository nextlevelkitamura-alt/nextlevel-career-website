---
タイトル: 未掲載派遣求人PDFのSupabase登録
状態: 完了
優先度: 高
作成日: 2026-06-26
更新日: 2026-06-26
見積もり工数: 2h
ロードマップ: ""
---

# 未掲載派遣求人PDFのSupabase登録

## 概要

デスクトップの `未掲載候補_派遣求人票_20260626` にある派遣求人票PDF 18件を、NextLevel Career Site のSupabase本番DBへ求人データとして登録する。

足りない情報は無理に補完しない。PDFから取れる情報を優先し、未記載の項目は空欄、または `general_notes` / `shift_notes` に原文ベースで残す。タイトルだけは `nextlevel-job-title-generator` 方針に合わせて、一覧で同じ型に偏らない掲載向けタイトルへ整える。

## 対象ファイル

- `scripts/import-dispatch-unpublished-jobs.ts` — PDF抽出済み情報を `create_job_with_details` RPC で登録するスクリプト
- `docs/企画/20260626-dispatch-unpublished-jobs-publication-plan.md` — 掲載優先度とタイトル案の根拠

## 登録対象

18件すべてを登録対象にする。

- A候補: 1468, 1464, 1291, 1290, 1458, 1470, 1321, 1022, 1435
- B候補: 1252, 1293, 505, 1465, 1472
- C候補: 1420, 1, 8, 9

C候補もユーザー指示に合わせて登録する。ただし短期・北海道・開始日過去などのリスクは原文情報として残す。

## 登録方針

1. `job_code` は `D260626-{案件No}` で固定し、再実行時は既存をスキップする。
2. `type` はすべて `派遣`。
3. `published_at` は登録実行時刻。
4. `expires_at` は終了予定が明確な短期案件だけ設定する。
   - `1420`: 2026-07-31
   - `8`: 2026-07-31
5. `listing_source_name` は `dispatch_pdf_20260626`。
6. 派遣先企業名は原則非公開。`dispatch_job_details.client_company_name` には元情報を保持し、`is_client_company_public=false` にする。
7. `1900年1月0日` は長期扱いの帳票値なので、DBには入れず `end_date="長期"` にする。
8. 求人名や住所が欠けている案件は、分かる範囲で登録し、確認事項を `general_notes` に残す。
9. PDFファイルは `job-documents/dispatch_pdf_20260626/` にアップロードし、`job_attachments` / `pdf_url` / `listing_source_url` に紐づける。
10. 相談LPで派遣求人を見せられるよう、A候補中心の求人を `dispatch` / `undecided` の利用可能日へ追加する。

## 実装手順

1. スクリプトをdry-runで実行し、18件のpayloadが作れることを確認する。
2. `job_code` 重複チェックで既存登録がないことを確認する。
3. `--execute` で登録する。
4. 登録後に `listing_source_name='dispatch_pdf_20260626'` の件数と主要項目を確認する。
5. 管理画面または公開求人一覧で表示確認する。

## 実行結果

- dry-run: 18件すべて `READY`
- 実登録: 18件作成、0件スキップ、0件失敗
- `listing_source_name='dispatch_pdf_20260626'`: 18件
- `dispatch_job_details`: 18件
- `get_public_jobs_list_rpc(p_type='派遣', p_limit=50)`: 登録18件すべて表示対象に含まれることを確認
- PDF Storage: `job-documents/dispatch_pdf_20260626/` に18件アップロード
- `job_attachments`: 登録18件すべてにPDF添付あり
- `jobs.pdf_url` / `jobs.listing_source_url`: 登録18件すべてStorage公開URLへ更新
- `jobs.title`: 既存派遣求人の掲載トーンに合わせて18件更新
- 相談LP `consultation_date_jobs`: 2026-06-26〜2026-07-31の利用可能な `dispatch` / `undecided` 枠へ200リンク追加
  - `dispatch`: 100リンク
  - `undecided`: 100リンク

登録した `job_code`:

- `D260626-1468`
- `D260626-1464`
- `D260626-1291`
- `D260626-1290`
- `D260626-1458`
- `D260626-1470`
- `D260626-1321`
- `D260626-1022`
- `D260626-1435`
- `D260626-1252`
- `D260626-1293`
- `D260626-505`
- `D260626-1465`
- `D260626-1472`
- `D260626-1420`
- `D260626-1`
- `D260626-8`
- `D260626-9`

## 完了条件

- [x] dry-runで18件が対象として表示される
- [x] Supabase本番DBに18件が登録される、または既存分が冪等にスキップされる
- [x] `jobs` と `dispatch_job_details` の紐づきが18件分確認できる
- [x] タイトルが勤務時間先頭になっていない
- [x] 既存派遣求人に近い `【駅名】業務名｜時給・条件` 型を中心にタイトルを更新
- [x] `listing_source_name='dispatch_pdf_20260626'` で抽出できる
- [x] PDFがStorageにアップロードされ、求人添付として参照できる
- [x] 相談LPの派遣/未定ルートに今回求人のリンクが追加される
- [x] 登録結果を完了報告に記載する
