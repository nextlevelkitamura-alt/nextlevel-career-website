---
タイトル: バナー単位の成績計測・フィルター
状態: 進行中
優先度: 中
作成日: 2026-07-01
見積もり工数: 12
ロードマップ: ""
---

# バナー単位の成績計測・フィルター

## 背景・課題

管理画面「バナー」分析タブに、**バナー名・公開日での絞り込み**と、**この日〜この日での計測**が欲しいという要望。

調査の結果、現状には2つの構造的な問題がある。

### 1. "バナー" という言葉が2つの別物を指している

| | 名前 | 公開日 | 現状の計測との関係 |
|---|---|---|---|
| ①トップのバナー（`banners`テーブル / `/admin/banners`） | ○ `title` | ○ `starts_at` / `ends_at` | **紐づいていない** |
| ②今の「バナー」分析タブ | 相談ルート名 | ✕ | これを集計している |

②の分析タブ（`getConsultJobsBannerAnalytics`）は、実は`banners`テーブルとは無関係で、`/consult-jobs`ページのPV + 相談ルート(route)別クリックを集計しているだけ。

### 2. クリックが「どのバナー経由か」を記録していない

- `lib/analytics.ts` の `recordPageView` は `page_path`（固定文字列 `/consult-jobs`）しか記録しない。
- `consultation_lp_clicks` は `route_slug` のみで `banner_id` を持たない。
- よって現状のデータでは「バナーA=○クリック / バナーB=○クリック」の分解が**原理的にできない**。

→ 「バナー名でフィルター」を実現するには、まず**計測側に banner_id を仕込む基盤追加**が必要。UIだけの話ではない。

### 3. フィルターがリロードで消える

`AnalyticsDashboard.tsx` の状態は全て `useState` のみ。リロードで タブ・期間・日付が全リセットされ、バナータブにすら戻らない。

## 提案内容

「トップのバナー単位」で成績を見られるようにする。計測基盤の追加を伴うため、価値の出る順に3フェーズに分割する。

### Phase 1: フィルターのURL永続化（スキーマ変更なし・即効）

- `AnalyticsDashboard.tsx` の `activeTab` / `period` / `bannerStartAt` / `bannerEndAt`（+ 後述のバナー選択）を **URLクエリ**（`?tab=banner&period=30d&from=...&to=...&banner=...`）に持たせる。
- `useSearchParams` で初期化、`router.replace` で更新。
- 効果: リロードで保持される・**期間指定リンクを共有できる**。localStorageより素直（ブックマーク/戻る操作も効く）。
- 既存の「開始日時〜終了日時」フィルターは実装済みなので、これで実用になる。

### Phase 2: バナークリック計測 + バナー単位UI（本命）

既存の `recordConsultationLpClick` と同型のパターンで実装する。

**データモデル**（新規テーブル）
```sql
create table banner_clicks (
  id uuid primary key default gen_random_uuid(),
  banner_id uuid references banners(id) on delete set null,
  banner_title text,                 -- クリック時点の名前をスナップショット（バナー削除後も履歴が残る）
  clicked_at timestamptz not null default now(),
  visitor_hash text,
  user_id uuid references auth.users(id) on delete set null,
  is_bot boolean not null default false,
  user_agent text
);
create index on banner_clicks (banner_id, clicked_at);
create index on banner_clicks (clicked_at);
```
- `on delete set null` + `banner_title` スナップショットで、バナー削除後も成績履歴が消えないようにする（`deleteBanner` はハード削除のため）。

**記録側**
- `recordBannerClick(bannerId)` サーバーアクション（`recordConsultationLpClick` と同型: visitor_hash / is_bot / user_agent 付き）。
- `components/BannerCarousel.tsx` の `<Link>` / `<a>` に `onClick` を足し、`void recordBannerClick(banner.id)` を fire-and-forget。
  - 注意: 同一タブの外部`<a>`遷移だと fetch が中断されうる。`<Link>`（SPA遷移）と `target=_blank` は生き残る。堅牢にするなら軽量ビーコン用APIルート + `fetch(..., { keepalive: true })` を検討（v1は`<Link>`前提で可）。

**集計側**
- 生の行をJSで数えると**先日修正した1000件上限バグに再び当たる**ため、集計は必ず Postgres 側で行う。
- RPC `get_banner_click_counts(p_from, p_to)` → `banner_id, banner_title, count` を GROUP BY で返す（`has_recent_page_view` と同じRPC流儀）。
- `getBannerPerformance(dateRange)` サーバーアクション: 上記RPCの結果を `banners`（title / starts_at / ends_at / is_active）とJOINして返す。
- 選択バナーの日別推移が欲しい場合は `get_banner_click_daily(p_banner_id, p_from, p_to)` を追加。

**UI（`BannerAnalyticsPanel` / `AnalyticsDashboard`）**
- バナー選択フィルター（名前で検索できるドロップダウン、公開期間を併記）。
- テーブル: バナー名 / 公開期間 / クリック数 / 構成比。
- バナー選択で日別推移グラフをそのバナーに絞り込み。
- 既存の日付範囲フィルターをそのまま入力に使う。

### Phase 3（将来）: 表示回数・CTR

- 「クリック数」だけでなく CTR を出すには **表示回数（impression）** の計測が必要。
- カルーセルは自動再生 + 複数バナーが枠を共有するため impression 計測は設計が重い。要望が出たら別企画で。

## 重要な注意点

- **計測は後ろ向きには効かない。** バナークリック履歴はデプロイ後から蓄積が始まり、**過去の成績は復元できない**。導入が早いほど早くデータが貯まる。
- 「バナー」という名称が①②で衝突しているため、タブ名やラベルの整理（例: ②を「相談LP」に改称）も併せて検討すると混乱が減る。

## 期待される効果

- どのバナーが効いているかを名前・公開期間で判断でき、バナー入れ替えの意思決定が速くなる。
- 期間指定リンクの共有で、定点観測・レポート共有がしやすくなる。

## 工数見積もり

| 作業 | 見積もり |
|------|---------|
| Phase 1: URL永続化 | 2h |
| Phase 2: migration（テーブル+RPC） | 2h |
| Phase 2: 記録側（action + カルーセル計測） | 2h |
| Phase 2: 集計action + バナー単位UI | 4h |
| テスト・検証（tsc / build / 実データ確認） | 2h |
| **合計** | **12h** |

## 未確定事項（実装前に要決定）

- Phase 1 だけ先に出すか、Phase 2 まとめてか。
- バナー削除時の履歴保持方針（本案: スナップショット方式）で良いか。
- タブ名 "バナー" の改称をするか。
