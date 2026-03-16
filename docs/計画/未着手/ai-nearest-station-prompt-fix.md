---
タイトル: AIプロンプト改善 - nearest_station 複数駅対応
種別: バグ修正
手法: impl
作成日: 2026-03-16
状態: 未着手
優先度: 高
---

# AIプロンプト改善 - nearest_station 複数駅対応

## 背景・問題

`utils/gemini.ts` の `analyzeJobContent` プロンプトに `nearest_station` の定義がなかった。
その結果、AI が「代表1駅のみ nearest_station に保存し、残りの駅を workplace_access に
『馬喰横山駅・馬喰町駅 いずれもアクセス可能』のように混入させる」という誤動作をしていた。

後から `20260316_fix_nearest_station_multi.sql` のマイグレーションで修正したが、
プロンプトが修正されていないため同じ問題が再発する。

また、本来 AI 抽出で `nearest_station` を使っているのは `analyzeJobContent`（`app/actions/analyzeJob.ts` から呼ぶ求人分析）ではなく、
`app/admin/actions/ai.ts` の `buildExtractionSystemInstruction` / `buildExtractionUserPrompt` 経由の PDF 読み込みフローである。
そちらは `utils/promptBuilder.ts` で管理されているため、修正対象はそちら。

## 目的

1. `nearest_station` に全アクセス可能な駅を改行区切りで出力させる
2. `workplace_access` には徒歩時間・アクセス方法のみを残す（駅名リスト禁止）
3. 同様の問題がないか `utils/promptBuilder.ts` を確認・整合

## スコープ

- ✅ `utils/promptBuilder.ts` の nearest_station・workplace_access 定義の修正
- ✅ `utils/gemini.ts` の `analyzeJobContent` にも同様の定義を追加（将来対応）
- ❌ 既存データの再修正（マイグレーションで対応済み）
- ❌ フロントエンドの表示変更

## 実装フェーズ

### Phase 1: promptBuilder.ts の確認・修正
- [ ] `utils/promptBuilder.ts` を読んで `nearest_station` と `workplace_access` の定義を確認
- [ ] nearest_station の説明を以下に変更:
  ```
  nearest_station: "就業場所へのアクセスに使える全駅名を改行区切りで出力。
  例: '馬喰横山\n馬喰町\n東日本橋'。単一駅の場合は改行なしで出力。"
  ```
- [ ] workplace_access の説明に制約を追加:
  ```
  workplace_access: "徒歩時間・アクセス方法のみ記載。駅名リストはnearest_stationに入れること。
  例: '徒歩5分' / '徒歩3〜7分'"
  ```

### Phase 2: analyzeJobContent のプロンプト補強（追加）
- [ ] `utils/gemini.ts` の `analyzeJobContent` 出力 JSON に nearest_station フィールドを追加
  - 定義: 「全アクセス可能な駅を改行区切りで」
  - workplace_access との分離ルールを明記

### Phase 3: 動作確認
- [ ] 複数駅が記載された求人テキストをテストデータとして用意
- [ ] プロンプト変更後の出力が改行区切りになっているか確認

## 実装対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `utils/promptBuilder.ts` | nearest_station・workplace_access の定義を修正（メイン） |
| `utils/gemini.ts` | analyzeJobContent の出力 JSON に nearest_station を追加 |

---

## 新しいチャットで使う指示文章

```
以下の計画書に従って実装してください。

【計画書】docs/計画/進行中/ai-nearest-station-prompt-fix.md

【作業内容】
AIプロンプトの nearest_station フィールド定義を修正します。

背景: AI が複数駅を workplace_access に混入させていた問題の根本修正。
- utils/promptBuilder.ts を読んで nearest_station の定義を確認し、
  「全駅を改行区切りで出力」「workplace_access には駅名を入れない」よう修正する。
- utils/gemini.ts の analyzeJobContent にも同様の定義を追加する。

まず utils/promptBuilder.ts を読んでから実装してください。
/impl で実装してください。
```
