---
feature: 求人UIの改善（カード・詳細ページ）+ DB項目拡張
type: improvement
method: impl + tdd (DB変更部分)
created: 2026-02-09
updated: 2026-02-12
status: planning
---

# 設計プラン: 求人UIの改善 + DB項目拡張

> **📋 関連ドキュメント**: [差分分析レポート](../analysis/job-schema-gap-analysis.md)

## リサーチ結果サマリー

### 実データ分析:
- **派遣求人票**: 20件分析
- **正社員求人票**: 4件分析
- → 実際の求人票フォーマットからDB設計を見直し

### 重要な発見:
1. **派遣と正社員でデータ構造が大きく異なる**
   - 派遣: 時給・交通費・駅近・即日スタート重視
   - 正社員: 企業情報・年収・キャリアパス重視
2. **現在のDBに不足している項目が多数**
   - 企業情報（会社名、業界、従業員数等）
   - 研修・試用期間の詳細
   - 訴求ポイント（仕事の醍醐味、歓迎要件等）
3. **自動タグ生成に必要なデータが一部不足**

### 競合サイトの共通要素（再確認）:
- **時給を最も目立たせる**（大きいフォント、色付き）
- **最寄駅 + 徒歩分**を必ず表示
- **訴求タグを多用**（未経験OK、即日、交通費支給、残業なし等）
- **勤務期間**（長期/短期）をカードに表示
- **交通費支給**をタグまたは独立項目で表示
- 写真なしが標準 → タグとテキストで情報量を確保

---

## 要件（更新版）

### Phase 0: DB項目の拡張（最優先）

> **⚠️ 重要**: UI改善の前に、実データに合わせたDB設計が必要

#### 🔴 HIGH（必須追加項目）:

**企業情報系（正社員で重要）:**
- `company_name` (text) — 会社名
- `industry` (text) — 業界
- `company_overview` (text) — 会社概要

**雇用条件系（派遣で重要）:**
- `client_company_name` (text) — 就業先企業名（派遣）
- `end_date` (text) — 終了日（派遣）
- `training_period` (text) — 研修期間・内容
- `training_salary` (text) — 研修中の給与（派遣）
- `actual_work_hours` (text) — 1日の実働時間
- `work_days_per_week` (text) — 出勤日数

**勤務条件系:**
- `overtime_hours` (text) — 残業時間
- `probation_period` (text) — 試用期間
- `probation_details` (text) — 試用期間詳細

**訴求ポイント系:**
- `appeal_points` (text) — 仕事の醍醐味・やりがい

#### 🟡 MEDIUM（あると良い項目）:
- `company_address`, `company_size`, `established_date`, `business_overview`
- `nail_policy`, `shift_notes`, `general_notes`
- `welcome_requirements`, `department_details`
- `part_time_available`, `smoking_policy`
- `annual_holidays` (integer)

#### 設計方針の選択:

**方針 A**: 単一テーブル（全項目を jobs テーブルに追加）
- ✅ シンプル
- ❌ NULL値が多い

**方針 B（推奨）**: テーブル分離
```sql
jobs (共通項目)
dispatch_job_details (派遣専用)
fulltime_job_details (正社員専用)
```
- ✅ 最適化されたデータ構造
- ✅ 拡張性高い
- ❌ JOIN必要（パフォーマンス考慮）

### Phase 1: カードUI改善

**既存データで表示する項目:**
1. 最寄駅（`nearest_station`）
2. 交通費支給（`commute_allowance`）→ タグ表示
3. 勤務期間（`period`）
4. 勤務時間（`working_hours`）→ 簡潔に
5. 時給の数値表示（`hourly_wage`）→ 大きく目立たせる

**新規追加データで表示する項目:**
1. 企業名（`company_name` or `client_company_name`）
2. 残業時間（`overtime_hours`）
3. 年間休日（`annual_holidays`）
4. 訴求ポイント（`appeal_points` の一部）

**レイアウト変更:**
- **派遣**: 時給を最大サイズで表示
- **正社員**: 年収範囲を目立たせる
- 最寄駅を勤務地の横に表示
- 自動生成タグを追加

**自動タグ生成ロジック:**
- `commute_allowance` に「全額」→ 「交通費全額支給」
- `overtime_hours` が「なし」→ 「残業なし」
- `start_date` に「即日」→ 「即日スタート」
- `attire` に「自由」→ 「服装自由」
- `requirements` に「未経験」→ 「未経験OK」
- `annual_holidays` >= 120 → 「年間休日120日以上」

### Phase 2: 詳細ページ改善
- 時給/給与を目立つ位置に固定表示
- **服装規定セクション追加**（派遣のみ）
  - 服装・髪型・ネイルの詳細を見やすく表示
  - アイコン付きで視認性向上
- 訴求ポイントセクション追加（`appeal_points`）
- 企業情報セクション追加（正社員のみ）
  - ⚠️ **企業名は控えめに表示**（大きく目立たせない）
- 応募ボタンのスティッキー化

### Phase 3: 入力フォームの分離
- 派遣用フォーム
- 正社員用フォーム
- 共通項目の抽出
- **企業名公開トグル**の追加
  - 企業名を公開するかどうかを選択可能
  - 非公開時は「大手メーカー」「IT企業」等の表現で代替

### Phase 4: AI登録の改善（今週実施）
- 抽出精度・チャット修正・バッチ処理
- 新しいDB項目に対応したプロンプト更新
- **企業名の匿名化オプション**
  - AI抽出時に企業名を自動で検出
  - 「○○社」「非公開」等に置換
- **API料金の最適化**
  - Gemini API呼び出し回数の削減
  - プロンプトの最適化（トークン数削減）
  - バッチ処理の効率化

## リスク評価

### Phase 0（DB拡張）:
- **HIGH**: DB変更のため、既存データへの影響を慎重に確認
- **MEDIUM**: マイグレーションの複雑性（特にテーブル分離の場合）
- **MEDIUM**: AI抽出プロンプトの更新が必要

### Phase 1〜2（UI改善）:
- **LOW**: UI変更のみ、フロントエンド側の対応
- **LOW**: 既存データを活用するだけ

### Phase 3（フォーム分離）:
- **MEDIUM**: 入力フォームの複雑化、バリデーション追加

## 依存関係
- Phase 0完了後に Phase 1〜3を並行実施可能
- AI抽出機能の更新（別プラン）は Phase 0完了後に着手

## 実装フェーズ

### Phase 0: DB項目の拡張（必須）
**方針確定が必要**: 方針A（単一テーブル）or 方針B（テーブル分離）

#### 方針A採用の場合:
- [ ] マイグレーションファイル作成（新規カラム追加）
- [ ] TypeScript型定義更新（DraftJob、Job等）
- [ ] 既存データの確認（NULL値の影響）

#### 方針B採用の場合:
- [x] マイグレーションファイル作成（新規テーブル作成）
- [x] TypeScript型定義更新（DispatchJobDetails, FulltimeJobDetails等）
- [x] JOIN クエリの実装
- [x] RLS (Row Level Security) の設定

### Phase 1: カードUI改善
- [x] 雇用形態別の表示分岐（JobCard内で派遣/正社員を判定）
  - ※ 別コンポーネント分離ではなく、1コンポーネントで条件分岐（シンプル）
- [x] 時給/年収の視認性向上（派遣:ピンク2xl, 正社員:ブルー2xl）
- [x] 新規項目の表示追加（最寄駅、勤務時間、年収範囲）
- [x] 自動タグ生成ロジック実装（utils/jobTagGenerator.ts）
- [x] レイアウト調整（給与→エリア+駅→勤務時間→休日→タグ）

### Phase 2: 詳細ページ改善
- [ ] 訴求ポイントセクション追加（`appeal_points`）
- [ ] 企業情報セクション追加（正社員のみ）
- [ ] 給与情報の固定表示
- [ ] 応募ボタンのスティッキー化
- [ ] 情報構成の見直し

### Phase 3: 入力フォームの分離
- [ ] 共通フォームコンポーネント作成
- [ ] 派遣用フォーム作成（dispatch-job-form.tsx）
- [ ] 正社員用フォーム作成（fulltime-job-form.tsx）
- [ ] バリデーション追加
- [ ] AI抽出結果の自動入力対応

## 実装対象ファイル

### Phase 0（DB拡張）:
- 新規: `supabase/migrations/YYYYMMDD_add_job_details_extended.sql`
- 変更: `utils/types.ts`（型定義更新）

### Phase 1（カードUI）:
- 変更: `components/JobCard.tsx`（分岐追加 or 分離）
- 新規: `components/JobCardDispatch.tsx`
- 新規: `components/JobCardFulltime.tsx`
- 変更: `app/jobs/jobsData.ts`（fetch時の取得カラム追加）
- 新規: `utils/jobTagGenerator.ts`（自動タグ生成ロジック）

### Phase 2（詳細ページ）:
- 変更: `app/jobs/[id]/page.tsx`

### Phase 3（フォーム分離）:
- 変更: `app/admin/jobs/new/page.tsx`
- 新規: `components/admin/DispatchJobForm.tsx`
- 新規: `components/admin/FulltimeJobForm.tsx`

## 推奨実装方式

### Phase 0:
→ **/tdd** (DB変更のため、慎重にテスト実装)

### Phase 1〜2:
→ **/impl** (UI変更、ロジック軽微)
→ **Gemini 3.0 Pro** にデザイン案を出してもらうのも有効

### Phase 3:
→ **/impl** (フォーム実装)

---

## 次のアクション

1. **方針の確定**: 方針A（単一テーブル）or 方針B（テーブル分離）
2. **Phase 0の実装**: DB項目拡張
3. **Phase 1の実装**: カードUI改善
4. **Phase 2の実装**: 詳細ページ改善
5. **Phase 3の実装**: フォーム分離

---

**最終更新**: 2026-02-12
**次回レビュー**: Phase 0完了後
