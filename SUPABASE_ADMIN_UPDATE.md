# 管理機能アップデート手順

以下の2つの作業（SQL実行とStorage作成）を行ってください。

## 1. データベースの更新（SQL実行）

[Supabase SQL Editor](https://supabase.com/dashboard/project/oqrvutvyyscvacmxvpkk/sql/new) を開き、以下のSQLを実行してください。

```sql
-- お仕事IDとPDF URLカラムを追加
alter table jobs add column job_code text;
alter table jobs add column pdf_url text;

-- お仕事IDを一意（重複不可）にする
create unique index jobs_job_code_idx on jobs (job_code);
```

## 2. ファイル保存場所（Storage）の作成

1.  Supabaseの左メニューから **Storage** をクリックします。
2.  **New Bucket** ボタンをクリックします。
3.  以下の設定で作成します：
    *   **Name**: `job-documents`
    *   **Public bucket**: **ON** (チェックを入れる)
    *   **Save** をクリック
4.  作成された `job-documents` バケットをクリックして開きます。
5.  **Configuration** タブをクリックします。
6.  **Policies** の **New Policy** をクリックし、**"For full customization"** を選びます。
7.  以下の設定でポリシーを作成します（管理者だけがアップロード・削除できるようにします）：
    *   **Policy Name**: `Allow Admin Access`
    *   **Allowed Operations**: `SELECT`, `INSERT`, `UPDATE`, `DELETE` (全部チェック)
    *   **Target roles**: `authenticated` (デフォルトのまま)
    *   **USING expression**:
        ```sql
        exists (select 1 from profiles where id = auth.uid() and is_admin = true)
        ```
    *   **WITH CHECK expression**:
        ```sql
        exists (select 1 from profiles where id = auth.uid() and is_admin = true)
        ```
    *   **Review** -> **Save Policy**

これで準備完了です！完了したら教えてください。
