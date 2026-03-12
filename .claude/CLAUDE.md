# NextLevel Career Site - プロジェクトルール

## ドキュメント構造

| ディレクトリ | 役割 | AI操作権限 |
|-------------|------|-----------|
| `docs/ROADMAP.md` | 3ヶ月ロードマップ | 読む。変更時は即コミット&プッシュ |
| `docs/proposals/` | 企画・アイデア | 新規作成OK。**実装は不可** |
| `docs/plans/active/` | 進行中の計画 | 実装対象。完了時は completed/ に移動 |
| `docs/plans/backlog/` | 承認済み未着手 | 読むだけ。着手時に active/ に移動 |
| `docs/plans/completed/` | 完了した計画 | 読むだけ |
| `docs/specs/` | 仕様書 | 参照用。変更時は確認を求める |
| `docs/infra/` | インフラ・環境設定 | 参照用 |
| `docs/archive/` | 過去の記録 | 読むだけ |

## 企画ライフサイクル

```
1. アイデア   → docs/proposals/YYYYMMDD-slug.md (状態: アイデア)
2. 提案       → 仕様・工数を追記 (状態: 提案)
3. 採用       → proposals/accepted/ に移動、ROADMAP.md に週割当
4. 不採用     → proposals/rejected/ に移動（理由記録）
5. 計画化     → plans/backlog/ または plans/active/ に移動
6. 実装       → plans/active/ で作業 (状態: 進行中)
7. 完了       → plans/completed/ に移動 (状態: 完了)
```

## フロントマター状態値の一覧

| 状態 | 意味 | 使用場所 |
|------|------|---------|
| アイデア | 思いつき段階 | proposals/ |
| 提案 | 仕様を書いた段階 | proposals/ |
| 採用 | 採用決定 | proposals/accepted/ |
| 不採用 | 不採用（理由つき） | proposals/rejected/ |
| 進行中 | 実装中 | plans/active/ |
| ブロック中 | ブロッカーあり | plans/active/ |
| 完了 | 完了 | plans/completed/ |

## フロントマター優先度

| 優先度 | 意味 |
|--------|------|
| 高 | 収益化・本業に直結 |
| 中 | UX改善・管理効率化 |
| 低 | 技術的負債・将来対応 |

## ROADMAP.md 変更ルール

変更したら即座に実行:
```bash
git pull && git add docs/ROADMAP.md && git commit -m "ROADMAP: {変更内容}" && git push
```

## 作業開始時の読み込み順

1. `.claude/CLAUDE.md`（このファイル）
2. `docs/ROADMAP.md`（全体計画）
3. `docs/plans/active/`（進行中タスク）

## コーディング規約

- **言語**: TypeScript（日本語コメント・コミットメッセージ）
- **フレームワーク**: Next.js 14 (App Router), Tailwind CSS
- **DB**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash
- **メール**: Resend
- **ホスティング**: Google Cloud Run

## 禁止事項

- `.env` ファイルの出力・コミット
- 破壊的変更の無断実行
- `proposals/` 内のアイデアの勝手な実装
- `docs/ROADMAP.md` の変更後にコミット・プッシュを忘れること
