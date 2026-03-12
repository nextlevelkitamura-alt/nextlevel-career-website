# NextLevel Career Site - ドキュメント

## ディレクトリ構成

```
docs/
├── ROADMAP.md              # 3ヶ月ロードマップ（正式版）
├── CONTEXT.md              # 詳細仕様・実装ガイド
├── tools.md                # 使用ツール一覧
│
├── proposals/              # 企画・アイデア
│   ├── _TEMPLATE.md        # 企画テンプレート
│   ├── accepted/           # 採用済み（plans/ への昇格待ち）
│   └── rejected/           # 不採用（理由記録）
│
├── plans/                  # 実装計画
│   ├── _TEMPLATE.md        # 計画テンプレート
│   ├── active/             # 進行中
│   ├── backlog/            # 承認済み・未着手
│   ├── completed/          # 完了
│   └── fixes/              # 修正計画
│
├── specs/                  # 仕様書
│   ├── ai-extraction.md
│   └── booking-clicks-analytics.md
│
├── analysis/               # 分析ドキュメント
│
├── infra/                  # インフラ・環境設定
│   ├── deployment-setup.md
│   └── .env.schema
│
└── archive/                # 過去の記録
    ├── summaries/          # 完了プランのサマリー
    ├── handoff/            # AI間引き継ぎ
    ├── quality/            # 品質監査
    └── Gemini.md           # Gemini設定ガイド
```

## 企画ライフサイクル

1. **アイデア** → `proposals/` に作成 (status: idea)
2. **提案** → 仕様・工数を追記 (status: proposed)
3. **採用** → `proposals/accepted/` に移動 → ROADMAP.md に週割当
4. **計画化** → `plans/backlog/` or `plans/active/` に移動
5. **実装** → `plans/active/` で作業 (status: active)
6. **完了** → `plans/completed/` に移動 (status: completed)

## 主要ドキュメント

- [ROADMAP.md](ROADMAP.md) — 3ヶ月ロードマップ
- [CONTEXT.md](CONTEXT.md) — 詳細仕様・実装ガイド
- [AI抽出仕様](specs/ai-extraction.md)
- [クリック分析仕様](specs/booking-clicks-analytics.md)
- [デプロイ設定](infra/deployment-setup.md)
