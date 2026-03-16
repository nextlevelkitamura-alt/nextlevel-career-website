---
タイトル: 静的駅マップ拡張 + AIプロンプト言語統一
種別: 機能改善
手法: impl
作成日: 2026-03-16
状態: 未着手
優先度: 中
---

# 静的駅マップ拡張 + AIプロンプト言語統一

## 背景・問題

### 問題①: 静的駅マップの限界
`utils/stationResolver.ts` の `STATION_AREA_MAP` は約280駅の手書きマップ。
- 首都圏・関西圏以外（名古屋・福岡・仙台・札幌など）は極端に少ない
- 未登録の駅は `resolveStationArea` が `null` を返し、エリア解決できないまま無視される
- 新駅・改名（高輪ゲートウェイは追加済みだが今後も発生）に追従できない

現状の挙動:
```typescript
// stationResolver.ts:316-319
export function resolveStationArea(stationName: string): string | null {
    const normalized = normalizeStationName(stationName);
    return STATION_AREA_MAP[normalized] ?? null;  // 未登録→null→エリア空白
}
```

### 問題②: プロンプト言語の混在
- `analyzeJobContent` (`utils/gemini.ts:28`) → 英語プロンプト
- `extractHierarchicalTags` (`utils/gemini.ts:169`) → 日本語プロンプト
- `detectDuplicateJob` (`utils/gemini.ts:321`) → 日本語プロンプト

統一されていないため、出力品質のムラが生じる可能性がある。

## 目的

1. 未登録駅でもエリアが空白にならないフォールバック処理を追加
2. `analyzeJobContent` のプロンプトを日本語に統一

## スコープ

- ✅ `utils/stationResolver.ts`: 未登録駅のフォールバック処理追加
  - `nearest_station` のテキストに都道府県名が含まれていれば抽出
  - 例: 「仙台駅」→ null、「仙台（宮城県仙台市）」→ 「宮城県 仙台市」
- ✅ `utils/gemini.ts`: `analyzeJobContent` プロンプトを日本語に統一
- ❌ `STATION_AREA_MAP` 自体の大幅な駅追加（地道な作業のため別タスク）
- ❌ Gemini API で駅名→都道府県を動的に問い合わせる（API コスト増のため保留）

## 実装フェーズ

### Phase 1: フォールバック処理追加
- [ ] `stationResolver.ts` に `resolveStationAreaWithFallback` 関数を追加:
  ```typescript
  /**
   * 駅名からエリアを解決。静的マップになければ nearest_station テキストから
   * 都道府県パターン（「東京都」「神奈川県」等）を抽出してフォールバック
   */
  export function resolveStationAreaWithFallback(
    stationName: string,
    fullText?: string  // nearest_station の全テキスト（「仙台 宮城県仙台市」など）
  ): string | null {
    const fromMap = resolveStationArea(stationName);
    if (fromMap) return fromMap;

    // フォールバック: テキストから「XX県 XX市」パターンを抽出
    const target = fullText || stationName;
    const match = target.match(/([東京都|北海道]|.{2,3}[都道府県])\s*(.{2,10}[市区町村])/);
    return match ? `${match[1]} ${match[2]}` : null;
  }
  ```
- [ ] `validateAndFixLocations` と `buildLocationsFromStations` が
  `resolveStationArea` を呼んでいる箇所を `resolveStationAreaWithFallback` に切り替え

### Phase 2: analyzeJobContent プロンプト日本語化
- [ ] `utils/gemini.ts` の `analyzeJobContent` プロンプトを日本語に書き直し:
  - フィールド定義・説明を日本語に統一
  - 意味は変えず、表現のみ変更
  - JSON 出力フォーマット定義はそのまま（フィールド名は英語のまま）

### Phase 3: 確認
- [ ] 既存テスト `utils/__tests__/gemini.test.ts` が通ることを確認
- [ ] 首都圏外の駅名（例: 「仙台」「札幌」）で `resolveStationAreaWithFallback` が動作確認

## 実装対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `utils/stationResolver.ts` | フォールバック関数追加、既存呼び出し箇所を切り替え |
| `utils/gemini.ts` | analyzeJobContent プロンプトを日本語化 |

---

## 新しいチャットで使う指示文章

```
以下の計画書に従って実装してください。

【計画書】docs/計画/進行中/ai-station-map-and-prompt-unification.md

【作業内容】2つの改善を行います。

① utils/stationResolver.ts にフォールバック処理を追加
   - resolveStationAreaWithFallback 関数を新規追加
   - 静的マップに存在しない駅でも都道府県パターンから抽出できるようにする
   - validateAndFixLocations / buildLocationsFromStations の resolveStationArea 呼び出しを
     resolveStationAreaWithFallback に切り替える

② utils/gemini.ts の analyzeJobContent プロンプトを日本語に統一
   - 英語で書かれているプロンプトを日本語に書き直す
   - JSON 出力フォーマットのフィールド名（英語キー）はそのまま

まず両ファイルを読んでから実装してください。
/impl で実装してください。
```
