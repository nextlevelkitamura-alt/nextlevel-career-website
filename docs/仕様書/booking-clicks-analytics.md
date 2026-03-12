# クリック分析ドリルダウン機能 仕様書

## 概要

管理画面 `/admin/analytics/clicks` にて、応募クリック・相談クリックの詳細分析を行う機能。

## ページ構成

### URL構造
```
/admin/analytics/clicks?type=apply|consult&period=7d|30d|90d|all
```

- `type`: クリックタイプ（省略時は `apply`）
- `period`: 集計期間（省略時は `30d`）

### レイアウト

#### 1. ヘッダー・フィルター
```
分析 > クリック詳細

[7日] [30日] [90日] [全期間]  [クリック種別: ▼]
```

- `PeriodSelector` コンポーネントを再利用
- クリック種別ドロップダウン: 応募/相談/すべて

#### 2. 集計カードエリア
3つのカードを横並び（モバイルでは縦積み）:

| 地域別 TOP5 | 業種別 TOP5 | 雇用形態別 |
|:-----------|:-----------|:----------|
| 東京: 45%   | OA事務: 30% | 派遣: 60% |
| 大阪: 25%   | 営業: 25%   | 正社員: 40% |
| ...         | ...         |            |

- 円グラフまたは棒グラフで可視化
- クリック数と割合を表示

#### 3. クリック履歴テーブル

| 日時 | 求人名 | 種別 | 地域 | 業種 | 雇用形態 |
|-----|--------|------|------|------|----------|
| 2026/02/20 14:32 | 東京都中央区のOA事務 | 応募 | 東京 | OA事務 | 派遣 |
| 2026/02/20 12:15 | 営業職（正社員） | 相談 | 大阪 | 営業 | 正社員 |

- ページネーション: 20件/ページ
- 日時で降順ソート（最新が上）
- 求人名クリックで求人詳細ページへ遷移

## 操作ルール

### フィルター操作
- 期間変更: 全ての集計を再計算
- クリック種別変更: 全ての集計を再計算
- URLパラメータも更新（ブラウザバック対応）

### 概要カードからの遷移
- `/admin/analytics` の「応募クリック」「相談クリック」カードをクリック
- 対応する `type` と現在の `period` を引き継いで遷移

### データがない場合
- 集計カード: 「データがありません」と表示
- 履歴テーブル: 「クリックデータがありません」と表示

## データ仕様

### 集計クエリ

```sql
-- 地域別
SELECT j.area, COUNT(*) as count
FROM booking_clicks bc
JOIN jobs j ON bc.job_id = j.id
WHERE bc.click_type = $type
  AND ($period IS NULL OR bc.clicked_at >= $since)
GROUP BY j.area
ORDER BY count DESC
LIMIT 5;

-- 業種別
SELECT j.category, COUNT(*) as count
FROM booking_clicks bc
JOIN jobs j ON bc.job_id = j.id
WHERE bc.click_type = $type
  AND ($period IS NULL OR bc.clicked_at >= $since)
GROUP BY j.category
ORDER BY count DESC
LIMIT 5;

-- 雇用形態別
SELECT j.type, COUNT(*) as count
FROM booking_clicks bc
JOIN jobs j ON bc.job_id = j.id
WHERE bc.click_type = $type
  AND ($period IS NULL OR bc.clicked_at >= $since)
GROUP BY j.type
ORDER BY count DESC;

-- 履歴一覧（ページネーション）
SELECT
  bc.clicked_at,
  j.title,
  bc.click_type,
  j.area,
  j.category,
  j.type
FROM booking_clicks bc
JOIN jobs j ON bc.job_id = j.id
WHERE bc.click_type = $type
  AND ($period IS NULL OR bc.clicked_at >= $since)
ORDER BY bc.clicked_at DESC
LIMIT 20 OFFSET $page * 20;
```

## 制約

- 管理者（`is_admin = true`）のみアクセス可能
- RLSポリシーにより、一般ユーザーは参照不可

## エッジケース

### jobs テーブルのレコードが削除された場合
- `ON DELETE CASCADE` により `booking_clicks` も削除される
- 履歴テーブルには表示されない（仕様）

### area/category/type が NULL の場合
- 集計: 「（未設定）」としてグループ化
- 表示: 「-」または「未設定」

### 期間指定でデータが0件の場合
- 各集計: 0件として表示
- 履歴テーブル: 空状態表示

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-02-20 | 初版作成 |
