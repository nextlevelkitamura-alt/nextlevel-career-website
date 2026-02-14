# 仕様書: AI求人抽出

## 概要

求人原稿（PDF/テキスト）から構造化データを自動抽出し、下書き求人として保存する機能。
Gemini 2.0 Flash API を使用。

---

## 操作ルール

### 抽出フロー

| ステップ | 操作 | 説明 |
|----------|------|------|
| 1 | ファイルアップロード | 管理者が PDF またはテキストファイルをアップロード |
| 2 | AI 抽出実行 | Gemini API で構造化データに変換 |
| 3 | 雇用形態判定 | 抽出結果の `type` から派遣/正社員を自動判定 |
| 4 | 企業名匿名化 | 企業名を検出し、自動で汎用表現に置換（元の企業名も保持） |
| 5 | バリデーション | 必須項目・型チェック・相互依存チェック |
| 6 | 下書き保存 | `draft_jobs` + `dispatch_job_details` or `fulltime_job_details` に保存 |
| 7 | 管理者確認 | DraftJobEditor で確認・修正 |
| 8 | 公開 | 下書きから本番求人に変換 |

### チャット修正（AI Refinement）フロー

| ステップ | 操作 | 説明 |
|----------|------|------|
| 1 | 修正対象選択 | 管理者がチェックボックスで修正対象フィールドを選択 |
| 2 | 自然言語で指示 | 「時給を1500円に変更して」等のテキスト入力 |
| 3 | AI 修正実行 | 選択フィールドのみ修正した JSON を返却 |
| 4 | 差分表示 | 変更前後の差分を項目別に表示 |
| 5 | 適用判断 | 管理者が項目別に適用/不適用を選択 |

---

## 抽出項目一覧

### 共通項目（jobs テーブル）

| 項目 | フィールド名 | 型 | 必須 | 説明 |
|------|-------------|-----|------|------|
| 求人タイトル | `title` | text | ✅ | 職種名を含む簡潔なタイトル |
| 雇用形態 | `type` | text | ✅ | 「正社員」「派遣」「紹介予定派遣」等 |
| カテゴリ | `category` | text | ✅ | 職種カテゴリ（マスタデータに準拠） |
| エリア | `area` | text | ✅ | 勤務地のエリア（マスタデータに準拠） |
| 給与 | `salary` | text | | 給与テキスト（例: 「時給1,400円」「年収400〜600万円」） |
| 時給 | `hourly_wage` | integer | | 時給の数値のみ（派遣向け検索用） |
| 仕事内容 | `description` | text | | 仕事内容の詳細 |
| 応募資格 | `requirements` | text/json | | 条件リスト（JSON配列 or テキスト） |
| 勤務時間 | `working_hours` | text | | 勤務時間帯 |
| 休日 | `holidays` | text/json | | 休日情報（JSON配列 or テキスト） |
| 福利厚生 | `benefits` | text/json | | 福利厚生（JSON配列 or テキスト） |
| 最寄駅 | `nearest_station` | text | | 最寄駅と徒歩分 |
| 交通費 | `commute_allowance` | text | | 交通費支給条件 |
| 勤務先名 | `workplace_name` | text | | 勤務先の名称 |
| 勤務先住所 | `workplace_address` | text | | 勤務先の住所 |
| 勤務先アクセス | `workplace_access` | text | | アクセス方法 |
| 服装タイプ | `attire_type` | text | | 服装規定（自由、オフィスカジュアル等） |
| 髪型 | `hair_style` | text | | 髪型・髪色の規定 |
| 勤務期間 | `period` | text | | 雇用期間（長期、3ヶ月以上等） |
| 開始日 | `start_date` | text | | 就業開始時期 |

### 派遣専用項目（dispatch_job_details テーブル）

| 項目 | フィールド名 | 型 | 説明 |
|------|-------------|-----|------|
| 就業先企業名 | `client_company_name` | text | 派遣先の企業名（匿名化対象） |
| 研修期間 | `training_period` | text | 研修期間・内容 |
| 研修中給与 | `training_salary` | text | 研修中の時給等 |
| 実働時間 | `actual_work_hours` | text | 1日の実働時間 |
| 出勤日数 | `work_days_per_week` | text | 週の出勤日数 |
| 契約終了日 | `end_date` | text | 契約期間の終了日 |
| ネイル | `nail_policy` | text | ネイルの可否・規定 |
| 備考 | `general_notes` | text | その他の備考 |

### 正社員専用項目（fulltime_job_details テーブル）

| 項目 | フィールド名 | 型 | 説明 |
|------|-------------|-----|------|
| 会社名 | `company_name` | text | 企業名（匿名化対象） |
| 業界 | `industry` | text | 業界（IT、メーカー等） |
| 会社概要 | `company_overview` | text | 会社の概要 |
| 従業員数 | `company_size` | text | 従業員数 |
| 年収下限 | `annual_salary_min` | integer | 年収の下限（万円） |
| 年収上限 | `annual_salary_max` | integer | 年収の上限（万円） |
| 残業時間 | `overtime_hours` | text | 月平均残業時間 |
| 年間休日 | `annual_holidays` | integer | 年間休日数 |
| 試用期間 | `probation_period` | text | 試用期間 |
| 試用期間詳細 | `probation_details` | text | 試用期間中の条件 |
| 訴求ポイント | `appeal_points` | text | 仕事の魅力・やりがい |
| 歓迎要件 | `welcome_requirements` | text | 歓迎スキル・経験 |
| 企業名公開 | `is_company_name_public` | boolean | 企業名を公開するか（デフォルト: false） |

---

## 企業名匿名化ルール

### 検出対象
- 正社員: `company_name` フィールド
- 派遣: `client_company_name` フィールド

### 匿名化処理（AI抽出時に自動実行）

| 条件 | 匿名化後の表現 | 例 |
|------|---------------|-----|
| 企業名が抽出された | 業界 + 「企業」 | 「大手IT企業」「食品メーカー」 |
| 業界が不明の場合 | 「非公開企業」 | — |

### データ保存

```
company_name = "株式会社トヨタ自動車"  ← 元の企業名（管理者のみ閲覧可）
company_name_anonymous = "大手自動車メーカー"  ← 匿名化後の表示名
is_company_name_public = false  ← デフォルトは非公開
```

### 表示ロジック
- `is_company_name_public = true` → `company_name` を表示
- `is_company_name_public = false` → `company_name_anonymous` を表示
- 管理画面では常に `company_name` を表示（匿名化後の値も併記）

---

## バリデーションルール

### 必須項目チェック

| 項目 | ルール |
|------|--------|
| `title` | 空でないこと |
| `type` | 「正社員」「派遣」「紹介予定派遣」「契約社員」のいずれか |
| `area` | マスタデータに存在すること |

### 型チェック

| 項目 | ルール |
|------|--------|
| `hourly_wage` | 正の整数（800〜5000 の範囲） |
| `annual_salary_min` | 正の整数（200〜2000 の範囲、万円） |
| `annual_salary_max` | `annual_salary_min` 以上 |
| `annual_holidays` | 正の整数（0〜365 の範囲） |

### 相互依存チェック

| 条件 | チェック内容 | レベル |
|------|------------|--------|
| 派遣の場合 | `hourly_wage` があること | 警告 |
| 正社員の場合 | `annual_salary_min` があること | 警告 |
| `annual_salary_max` がある場合 | `annual_salary_min` もあること | エラー |

---

## 制約

- 1回の抽出で Gemini API を **1回のみ** 呼び出す（コスト削減）
- バリデーション失敗時は警告表示のみ（抽出結果は保存する）
- 企業名匿名化は抽出時に自動実行、後から公開に切り替え可能
- マスタデータ（エリア、カテゴリ）に完全一致しない場合は最も近い値を提案

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-02-13 | 初版作成 |
