---
feature: 求人エディタAI統一・データ堅牢化
type: feature
method: impl
created: 2026-02-21
status: planning
---

# 設計プラン: 求人エディタAI統一・データ堅牢化

## 要件

### 背景
- 編集画面のAI抽出UXが新規作成と大きく異なり、使い勝手が悪い
- 編集画面では「AI読込」ボタンで全フィールドが一括上書きされ、選択的な適用ができない
- 新規作成→編集でデータが引き継がれないケースがある（fulltime/dispatch詳細テーブル未作成）

### 目的
1. **編集画面のAI抽出体験を新規作成と同等にする**
2. **AI抽出結果を項目別に適用/スキップできる差分プレビューUIを追加**
3. **データ保存の堅牢化（詳細テーブルの確実な作成・更新）**

### スコープ
- ✅ 編集画面（EditJobForm）のAI抽出UX改善
- ✅ 新規作成画面（create）への差分プレビューUI追加
- ✅ データ保存の堅牢化（createJob / updateJob）
- ❌ DraftJobEditor（バッチインポート）は対象外（後回し）

---

## リスク評価

| リスク | レベル | 対策 |
|--------|--------|------|
| EditJobFormの大幅改修 | MEDIUM | 既存UIを壊さないよう段階的に実装 |
| 差分プレビューのUI複雑度 | MEDIUM | ChatAIRefineDialogの既存パターンを再利用 |
| データ移行（既存の欠落データ） | LOW | 編集時にAI再抽出で補完可能 |

## 依存関係

- 既存コンポーネント: AiExtractButton, ChatAIRefineDialog, FileUploader
- Server Actions: extractJobDataFromFile, processExtractedJobData, createJob, updateJob
- DB: jobs, fulltime_job_details, dispatch_job_details, job_attachments

---

## 実装フェーズ

### Phase 1: 差分プレビューコンポーネント（新規）
- [ ] `AiExtractionPreview` コンポーネント作成
  - AI抽出結果と現在のフォーム値を比較
  - フィールドごとに「前→後」の差分表示
  - チェックボックスで適用/スキップ選択
  - 「全選択」「全解除」ボタン
  - 「適用」ボタンで選択フィールドのみフォームに反映
  - 空の変更は「（空）→（値）」のように表示

### Phase 2: 編集画面のAI抽出UX統一
- [ ] EditJobFormに `AiExtractButton` を追加
  - 既存のFileUploaderの「AI読込」は維持
  - プレビューファイル選択時にAiExtractButtonを表示
  - 雇用形態に応じたモード自動選択（dispatch=anonymous, fulltime=standard）
- [ ] AI抽出結果を `AiExtractionPreview` で表示
  - 直接フォームに上書きせず、まず差分プレビューを表示
  - ユーザーが選択的に適用
- [ ] 事前登録ファイル選択（DraftFileSelector）を編集画面でも利用可能に
  - job_draft_filesから選択してプレビュー表示

### Phase 3: 新規作成画面への差分プレビュー統合
- [ ] create/page.tsx の `handleAiExtracted` を差分プレビュー経由に変更
  - 初回（フォーム空の場合）は全フィールド自動選択で表示
  - 2回目以降（既に値がある場合）は差分プレビューで選択的適用
- [ ] AiExtractButton の呼び出しフローを統一

### Phase 4: データ保存の堅牢化
- [ ] `createJob` の修正
  - fulltime_job_details / dispatch_job_details を必ず作成（空でも行を作る）
  - welcome_requirements の保存位置を統一
- [ ] `updateJob` の修正
  - UPSERT のロバスト化（idがない場合はINSERT）
  - 詳細テーブルが存在しない場合の自動作成
- [ ] 編集画面の「詳細データ未保存」警告を改善
  - 警告 + 自動修復ボタン（空の詳細レコードを作成）

---

## 実装対象ファイル

### 新規作成
| ファイル | 内容 |
|---------|------|
| `components/admin/AiExtractionPreview.tsx` | 差分プレビューUI（新規） |

### 修正
| ファイル | 内容 |
|---------|------|
| `app/admin/jobs/[id]/edit/EditJobForm.tsx` | AiExtractButton追加、差分プレビュー統合、DraftFileSelector追加 |
| `app/admin/jobs/create/page.tsx` | 差分プレビュー統合 |
| `app/admin/actions.ts` | createJob/updateJobの堅牢化 |

### 参照のみ（変更なし）
| ファイル | 理由 |
|---------|------|
| `components/admin/AiExtractButton.tsx` | 既存コンポーネント再利用 |
| `components/admin/ChatAIRefineDialog.tsx` | UIパターン参考 |
| `components/admin/FileUploader.tsx` | 連携確認 |

---

## AiExtractionPreview コンポーネント設計

### Props
```typescript
interface AiExtractionPreviewProps {
  currentData: Record<string, unknown>;     // 現在のフォーム値
  extractedData: Record<string, unknown>;   // AI抽出結果
  fieldLabels: Record<string, string>;      // フィールド名→日本語ラベル
  onApply: (selectedFields: string[]) => void; // 選択フィールドを適用
  onCancel: () => void;                     // キャンセル
}
```

### UI構成
```
┌─────────────────────────────────────────────┐
│  AI抽出結果プレビュー                        │
│  ─────────────────────────────────          │
│  [✓ 全選択] [□ 全解除]                      │
│                                              │
│  ☑ タイトル                                  │
│    前: 「事務職」                             │
│    後: 「時給1,500円★大手メーカーでの一般事務」│
│                                              │
│  ☐ 給与（変更なし）                          │
│    現在: 「時給1,500円」                      │
│                                              │
│  ☑ 勤務時間                                  │
│    前: 「9:00-18:00」                         │
│    後: 「9:00～18:00（休憩60分）」            │
│                                              │
│  ☑ 仕事内容                                  │
│    前: （空）                                 │
│    後: 「■お仕事内容\n・データ入力...」        │
│                                              │
│  ... 他のフィールド ...                       │
│                                              │
│         [キャンセル]  [選択項目を適用]         │
└─────────────────────────────────────────────┘
```

### 動作ルール
- 値が変わったフィールドのみ表示（変更なしは折りたたみ）
- 前が空→後に値がある場合はデフォルトで✓（新規追加は基本適用）
- 前に値あり→後に異なる値の場合もデフォルトで✓
- 前に値あり→後が空の場合はデフォルトで☐（既存値の削除は慎重に）

---

## データ保存堅牢化の設計

### createJob の変更点
```typescript
// 現在: 詳細テーブルは値がある場合のみINSERT
// 修正後: 雇用形態に応じて必ずINSERT（空でも行を作成）

if (employmentType === 'fulltime') {
  await supabase.from('fulltime_job_details').insert({
    id: jobData.id,
    company_name: companyName || null,
    // ... 他のフィールド（nullでもINSERT）
  });
}

if (employmentType === 'dispatch') {
  await supabase.from('dispatch_job_details').insert({
    id: jobData.id,
    client_company_name: clientCompanyName || null,
    // ... 他のフィールド（nullでもINSERT）
  });
}
```

### updateJob の変更点
```typescript
// 現在: UPSERT だが、id不存在時にINSERTが失敗する可能性
// 修正後: 明示的に存在チェック → UPSERT

const { data: existing } = await supabase
  .from('fulltime_job_details')
  .select('id')
  .eq('id', jobId)
  .single();

if (existing) {
  // UPDATE
  await supabase.from('fulltime_job_details').update({...}).eq('id', jobId);
} else {
  // INSERT
  await supabase.from('fulltime_job_details').insert({ id: jobId, ... });
}
```

---

## 推奨実装方式

→ `/impl`（テストなし、UI中心の変更のため）

### 実装順序
1. Phase 1: AiExtractionPreviewコンポーネント（独立して作成可能）
2. Phase 2: EditJobFormの改修（メインの改善）
3. Phase 3: create/page.tsxへの統合
4. Phase 4: Server Actionsの堅牢化

### 見積もり
- Phase 1: ステップ3（AiExtractionPreview作成）
- Phase 2: ステップ5（EditJobForm改修 + 統合テスト）
- Phase 3: ステップ3（create統合）
- Phase 4: ステップ3（createJob/updateJob修正）
- 合計: 約14ステップ（中規模）
