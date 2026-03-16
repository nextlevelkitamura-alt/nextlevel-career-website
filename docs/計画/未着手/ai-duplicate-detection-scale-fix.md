---
タイトル: AI重複検出 - スケール問題修正
種別: バグ修正（予防的）
手法: impl
作成日: 2026-03-16
状態: 未着手
優先度: 高
---

# AI重複検出 - スケール問題修正

## 背景・問題

`utils/gemini.ts` の `detectDuplicateJob` 関数は、重複チェック時に
**既存の全求人データをプロンプトに渡す設計**になっている。

```typescript
// utils/gemini.ts:311-319
const existingJobsSummary = existingJobs.map(job => (
    `ID: ${job.id}\nタイトル: ${job.title}\nエリア: ${job.area || '未指定'}\n...`
)).join('\n\n');
```

現時点で `detectDuplicateJob` 自体は Admin 画面から直接呼ばれていないが（テストのみ）、
今後の求人インポートフロー（DraftJobEditor 等）に組み込む際に、
求人数が増えると以下のリスクがある：

- 100件 × 5フィールド ≒ 数千トークン → API コスト増大
- 500件超 → コンテキスト上限（100万トークン）に近づく
- レスポンス時間が求人数に線形比例

## 目的

1. `detectDuplicateJob` を呼ぶ前に、**エリア・雇用形態で候補を絞り込む**
2. 渡す件数を上限 `DUPLICATE_CHECK_CANDIDATE_LIMIT = 20` に制限
3. 関数のシグネチャは変更せず、呼び出し側で対応（後方互換性維持）

## スコープ

- ✅ `utils/gemini.ts` に `DUPLICATE_CHECK_CANDIDATE_LIMIT` 定数追加
- ✅ `utils/gemini.ts` の `detectDuplicateJob` に件数上限チェックを追加（警告ログ）
- ✅ 呼び出し側のフィルタリングヘルパー関数を追加（`utils/gemini.ts` 内または新ファイル）
- ❌ 既存のテストは変更しない（テストは mock を使用しているため影響なし）
- ❌ DB クエリの変更は行わない（フィルタリングはアプリ層で対応）

## 実装フェーズ

### Phase 1: 定数追加 + 警告ログ
- [ ] `utils/gemini.ts` に定数を追加:
  ```typescript
  export const DUPLICATE_CHECK_CANDIDATE_LIMIT = 20;
  ```
- [ ] `detectDuplicateJob` の冒頭に上限チェックを追加:
  ```typescript
  if (existingJobs.length > DUPLICATE_CHECK_CANDIDATE_LIMIT) {
    console.warn(`[detectDuplicateJob] 候補が ${existingJobs.length} 件あります。
    上位 ${DUPLICATE_CHECK_CANDIDATE_LIMIT} 件のみチェックします。
    呼び出し前にフィルタリングすることを推奨します。`);
  }
  const candidates = existingJobs.slice(0, DUPLICATE_CHECK_CANDIDATE_LIMIT);
  // 以降は candidates を使用
  ```

### Phase 2: フィルタリングヘルパー追加
- [ ] `utils/gemini.ts` に呼び出し元で使うヘルパーを追加:
  ```typescript
  /**
   * 重複チェック候補を絞り込む（エリア・雇用形態で事前フィルタリング）
   */
  export function filterDuplicateCandidates(
    newJobData: ExtractedJobData,
    allJobs: Job[],
    limit = DUPLICATE_CHECK_CANDIDATE_LIMIT
  ): Job[] {
    return allJobs
      .filter(job =>
        (!newJobData.area || job.area === newJobData.area) &&
        (!newJobData.type || job.employment_type === newJobData.type)
      )
      .slice(0, limit);
  }
  ```

### Phase 3: 動作確認
- [ ] 既存テスト（`utils/__tests__/gemini.test.ts`）が通ることを確認
- [ ] 件数が 20 件超の場合に警告ログが出ることを確認

## 実装対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `utils/gemini.ts` | 定数追加・上限チェック・フィルタリングヘルパー追加 |

---

## 新しいチャットで使う指示文章

```
以下の計画書に従って実装してください。

【計画書】docs/計画/進行中/ai-duplicate-detection-scale-fix.md

【作業内容】
utils/gemini.ts の detectDuplicateJob にスケール対策を追加します。

具体的には:
1. DUPLICATE_CHECK_CANDIDATE_LIMIT = 20 の定数追加
2. 渡す候補が上限超の場合に警告ログを出し、20件にスライス
3. 呼び出し前にフィルタリングするヘルパー関数 filterDuplicateCandidates を追加

関数のシグネチャは変更しないこと（後方互換）。
既存テスト utils/__tests__/gemini.test.ts が通ることを確認してください。

/impl で実装してください。
```
