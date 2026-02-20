---
feature: booking-clicks-drilldown
type: feature
method: impl
created: 2026-02-20
status: planning
---

# 設計プラン: クリック分析ドリルダウン機能

## 要件

管理画面のアナリティクスにおいて、応募クリック・相談クリックの詳細分析ができる機能を実装する。

### ユースケース
- 管理者が「どの地域・業種・雇用形態の求人でクリックが多いか」を把握したい
- 概要カードのクリック数から、詳細な内訳を確認したい
- 期間を指定して分析したい

### 具体要件
1. **新規ページ** `/admin/analytics/clicks` を作成
2. **分析軸**: 地域・業種・雇用形態の3軸で集計
3. **クリック履歴テーブル**: 日時・求人名・種別・地域・業種の個別リスト
4. **期間フィルター**: 7日/30日/90日/全期間（既存のPeriodSelectorを再利用）
5. **概要カードからの遷移**: 既存の「応募クリック」「相談クリック」カードをクリック可能に

## リスク評価

| 項目 | レベル | 説明 |
|------|--------|------|
| DB負荷 | LOW | `booking_clicks` は軽量テーブル、JOINも1テーブルのみ |
| データ量 | LOW | クリック数はせいぜい数千〜数万件、現時点では0件 |
| 既存機能への影響 | LOW | 新規ページ追加のみ、既存コードは変更なし |
| パフォーマンス | LOW | 集計クエリはインデックス活用で高速化可能 |

## 依存関係

| 依存先 | 種別 | 状態 |
|--------|------|------|
| `booking_clicks` テーブル | DB | ✅ 作成済み |
| `jobs` テーブル | DB | ✅ 既存 |
| `PeriodSelector` コンポーネント | UI | ✅ 既存 |
| `checkAdmin()` | Auth | ✅ 既存 |

必要なインデックス（追加推奨）:
```sql
CREATE INDEX IF NOT EXISTS idx_booking_clicks_job_id ON booking_clicks(job_id);
CREATE INDEX IF NOT EXISTS idx_booking_clicks_clicked_at ON booking_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_booking_clicks_click_type ON booking_clicks(click_type);
```

## 実装フェーズ

### Phase 1: データ取得ロジック
- [ ] `getClicksBreakdown()` Server Action
  - 期間・クリックタイプでフィルタリング
  - 地域別集計
  - 業種別集計
  - 雇用形態別集計
  - クリック一覧取得（ページネーション対応）

### Phase 2: UIコンポーネント
- [ ] `/admin/analytics/clicks/page.tsx`
- [ ] `ClicksDrilldownDashboard.tsx`
- [ ] `BreakdownCards.tsx` - 地域/業種/雇用形態の集計カード
- [ ] `ClickHistoryTable.tsx` - クリック履歴テーブル
- [ ] `PeriodSelector` の再利用

### Phase 3: 概要カードとの連携
- [ ] `OverviewCards.tsx` にリンク追加
- [ ] URLパラメータでクリックタイプ・期間を引き継ぎ

### Phase 4: インデックス追加
- [ ] Supabaseでインデックス作成（SQL実行）

## 実装対象ファイル

### 新規作成
- `app/admin/analytics/clicks/page.tsx`
- `app/admin/analytics/clicks/components/ClicksDrilldownDashboard.tsx`
- `app/admin/analytics/clicks/components/BreakdownCards.tsx`
- `app/admin/analytics/clicks/components/ClickHistoryTable.tsx`

### 変更
- `app/admin/analytics/actions.ts` - データ取得関数追加
- `app/admin/analytics/components/OverviewCards.tsx` - リンク追加
- `docs/specs/booking-clicks-analytics.md` - 仕様書作成（新規）

## 推奨実装方式

**`/impl`** （UI・スタイル・小機能向き）

理由:
- 複雑なビジネスロジックなし
- Supabaseクエリ + 表示のみ
- 既存コンポーネントの再利用が可能
- テストは手動検証で十分

## UIデザイン案

### ページ構成
```
┌─────────────────────────────────────────────┐
│  分析 > クリック詳細                           │
├─────────────────────────────────────────────┤
│  [7日] [30日] [90日] [全期間]  [応募▼] [相談▼]│
├─────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │地域別  │ │業種別  │ │雇用形態│          │
│  │  TOP5 │ │  TOP5  │ │  TOP5  │          │
│  └────────┘ └────────┘ └────────┘          │
├─────────────────────────────────────────────┤
│  クリック履歴                                │
│  ┌─────────────────────────────────────────┐│
│  │日時    │求人名  │種別│地域│業種│雇用    ││
│  ├─────────────────────────────────────────┤│
│  │2/20... │事務... │応募│東京│ OA│派遣    ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### 概要カードからの遷移
- カード全体をクリック可能に
- URL: `/admin/analytics/clicks?type=apply&period=30d`
- パラメータで自動フィルタリング
