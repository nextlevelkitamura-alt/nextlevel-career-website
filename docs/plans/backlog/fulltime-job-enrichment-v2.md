---
feature: 正社員求人情報拡充 v2
type: improvement
method: impl + db
created: 2026-02-18
status: planning
---

# 設計プラン: 正社員求人情報拡充 v2

> 参考: en-japan の正社員求人フォーマット（スクリーンショット 2026-02-18）

## 要件

### 1. 複数勤務地対応（正社員）
大企業では複数拠点が一般的。勤務地を複数記載できるようにする。

- **対象**: 正社員のみ
- **変更範囲**: DB追加 → AI抽出 → 入力フォーム → 詳細表示

設計方針:
- `fulltime_job_details` に `work_locations` text カラムを追加
- 1行=1勤務地（改行区切り）でシンプルに管理
- 既存の `jobs.area` は「主要エリア」として維持（検索用）

表示イメージ:
```
勤務地
📍 東京都千代田区（本社）
📍 東京都渋谷区
📍 愛知県名古屋市（豊田事務所）
◎転勤なし
```

### 2. 勤務時間シフト制対応（正社員）
シフト制・固定制を区別して表示できるようにする。

- **対象**: 正社員・派遣共通（既存 `working_hours` フィールド活用）
- **変更範囲**: AIプロンプトのみ改善（DB変更なし）

設計方針:
- AIが出力フォーマットを統一する
  - 固定: `09:00〜18:00（休憩60分）`
  - シフト制: `シフト制\n早番: 08:00〜17:00\n遅番: 13:00〜22:00`
- 表示側は `whitespace-pre-line` で対応済み（変更不要）

### 3. 売上高フィールド追加（正社員）
会社概要に売上高を表示できるようにする。

- **対象**: 正社員のみ
- **変更範囲**: DB追加 → AI抽出 → 入力フォーム → 詳細表示

設計方針:
- `fulltime_job_details` に `annual_revenue` text カラムを追加
- 複数年度の実績を記載できるようテキスト型で管理
- 例: `500億円（2025年3月期）\n444億円（2024年3月期）`

### 4. 選考フロー詳細化・STEP表示（正社員・派遣共通）
入社までの流れをSTEP形式で視覚的に表示する。

- **対象**: 正社員・派遣どちらも
- **変更範囲**: AIプロンプト改善 + 表示コンポーネント改善

設計方針:
- 既存の `jobs.selection_process` フィールドをSTEP形式で出力するようAI改善
- 出力フォーマット:
  ```
  STEP1:Web履歴書による書類選考
  STEP2:適性テスト＋面接2回
  STEP3:内定
  ```
- 表示パーサー: `STEP\d+:` を検出してスタイル付きステップカードで表示
- 色: STEP番号ごとに primary-500 グラデーション

表示イメージ（en-japan参考）:
```
入社までの流れ
[STEP1] → [STEP2] → [STEP3]
  書類選考   面接2回    内定
```

### 5. 派遣求人詳細ページのアイコン追加
正社員詳細ページと同じスタイルのアイコンを派遣詳細ページにも適用する。

- **対象**: 派遣のみ
- **変更範囲**: `app/jobs/[id]/page.tsx` の派遣セクション部分のみ（UIのみ）
- **DB変更なし・AI変更なし**

アイコンマッピング:
| セクション | アイコン |
|------------|---------|
| 雇用形態 | Briefcase |
| 職種 | FileText |
| 給与 | Banknote |
| 勤務地 | MapPin |
| 最寄駅・アクセス | Train |
| 勤務時間 | Clock |
| 勤務期間 | CalendarDays |
| 仕事内容 | FileText |
| 応募資格 | UserCheck |
| 福利厚生 | Shield |
| 服装・身だしなみ | Shirt |

---

## リスク評価

| 項目 | リスク | 理由 |
|------|--------|------|
| 複数勤務地 DB追加 | LOW | NULLableカラム追加のみ、既存データに影響なし |
| 売上高 DB追加 | LOW | 同上 |
| 選考フローSTEP表示 | LOW | フィールドは既存、表示パーサー追加のみ |
| AIプロンプト変更 | MEDIUM | 既存データの再抽出には影響しない（新規登録から適用） |
| 派遣アイコン追加 | LOW | UIのみ、既存ロジック変更なし |

---

## 依存関係

- Supabase マイグレーション（#1, #3）
- `app/admin/actions.ts` の AI抽出プロンプト（#2, #4）
- `components/admin/FulltimeJobFields.tsx` のフォーム（#1, #3）
- `app/jobs/[id]/page.tsx` の表示（#1, #3, #4, #5）

---

## 実装フェーズ

### Phase A: UIのみ（DB変更なし）→ /impl
- [ ] 5. 派遣詳細ページにアイコン追加（`app/jobs/[id]/page.tsx` 派遣セクション）
- [ ] 4. 選考フローSTEP表示コンポーネント（正社員・派遣両方）

### Phase B: DB追加 + AI更新 → /impl
- [ ] マイグレーション: `fulltime_job_details` に `work_locations`, `annual_revenue` カラム追加
- [ ] 型定義更新: `utils/types.ts`
- [ ] AIプロンプト更新: `app/admin/actions.ts`（複数勤務地・売上高・シフト制・STEP選考）
- [ ] フォーム更新: `components/admin/FulltimeJobFields.tsx`（複数勤務地テキストエリア・売上高）

### Phase C: 表示 → /impl
- [ ] `app/jobs/[id]/page.tsx`: 複数勤務地の表示（正社員）
- [ ] `app/jobs/[id]/page.tsx`: 売上高の表示（会社概要セクション）

---

## 実装対象ファイル

| ファイル | Phase | 変更内容 |
|---------|-------|---------|
| `supabase/migrations/YYYYMMDD_add_fulltime_locations_revenue.sql` | B | 新カラム追加 |
| `utils/types.ts` | B | FulltimeJobDetails型に新フィールド追加 |
| `app/admin/actions.ts` | B | AIプロンプト改善（複数勤務地・売上高・シフト・STEP選考） |
| `components/admin/FulltimeJobFields.tsx` | B | 複数勤務地textarea・売上高input追加 |
| `app/jobs/[id]/page.tsx` | A,C | 派遣アイコン・STEP表示・新フィールド表示 |

---

## 推奨実装順序

1. **Phase A** から開始（DBなし、即実装可能）
   - 派遣ページのアイコン追加 → `/impl`
   - 選考フローSTEP表示 → `/impl`
2. **Phase B** でDB+AI更新
3. **Phase C** で新フィールド表示追加

---

**最終更新**: 2026-02-18
