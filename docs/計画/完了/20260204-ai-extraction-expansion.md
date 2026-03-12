# Implementation Plan: AI抽出項目の拡張と統合

## 1. Requirements Restatement

ユーザーからの要望を整理すると、以下の3つの改善点があります：

1. **AI抽出で追加できる項目を増やす**
   - 管理画面で既に入力可能だが、AI抽出未対応のフィールドを追加対応
   - 特に給与関連、勤務先情報、雇用条件などの詳細フィールド

2. **まとめられる部分はまとめる**
   - 交通関連: 最寄駅、勤務地備考、交通費、通勤方法
   - 勤務地関連: エリア、勤務先名、住所、アクセス
   - 給与関連: 給与、給与形態、給与詳細、時給

3. **AIで手直しできるように選択肢を用意する**
   - JobAIRefineButtonで選択・修正可能なフィールドを拡張
   - ユーザーがAI refinement で手直しできる項目を増やす

## 2. Risk Assessment

- **LOW**: 型定義の追加 — 既存フィールドの拡張のみ
- **LOW**: AI抽出プロンプトの更新 — 既存パターンに追加
- **MEDIUM**: AI抽出精度の検証 — 新規フィールドの抽出精度確認が必要
- **LOW**: UIコンポーネントの更新 — 既存コンポーネントの拡張
- **MEDIUM**: 既存求人データとの互換性 — 新フィールドが空の場合のフォールバック処理

## 3. Dependencies

- Next.js 15
- Supabase（既存スキーマ）
- Gemini 2.0 Flash API（AI抽出用）
- Tailwind CSS（スタイリング）
- 追加ライブラリ: なし

## 4. Implementation Phases

### Phase 1: 型定義の更新

**対象ファイル**:
- `app/admin/actions.ts` の `ExtractedJobData`
- `utils/types.ts` の `DraftJob`

**タスク**:
- [ ] ExtractedJobData に以下を追加:
  - `hourly_wage?: number`
  - `salary_description?: string`
  - `period?: string`
  - `start_date?: string`
  - `workplace_name?: string`
  - `workplace_address?: string`
  - `workplace_access?: string`
  - `attire?: string`

- [ ] `npx tsc --noEmit` で型エラー確認

**注意**: `attire_type`, `hair_style` は既に対応済みのため、追加不要

### Phase 2: AI抽出プロンプトの更新

**対象ファイル**: `app/admin/actions.ts` の `extractJobDataFromFile`

**タスク**:
- [ ] 給与関連の抽出ルールを追加:
  ```
  ### 給与詳細の抽出について
  - hourly_wage: 時給の数値のみ抽出（例: 1400）
  - salary_description: 給与に関する補足情報を抽出
  ```

- [ ] 雇用条件の抽出ルールを追加:
  ```
  ### 雇用条件について
  - period: 雇用期間を抽出（例: 長期、3ヶ月以上、〇月まで）
  - start_date: 就業開始時期を抽出（例: 即日、4月1日〜）
  ```

- [ ] 勤務先情報の抽出ルールを追加:
  ```
  ### 勤務先情報について
  - workplace_name: 勤務先名称を抽出（例: 株式会社〇〇商事 札幌支店）
  - workplace_address: 住所を抽出（例: 〒060-0001 北海道札幌市中央区...）
  - workplace_access: アクセス方法を抽出（例: JR札幌駅から徒歩5分）
  - attire: 服装・髪型を一文で抽出（例: オフィスカジュアル、ネイルOK）
  ```

- [ ] 共通化・まとめの考慮:
  - 交通関連情報（nearest_station + location_notes + commute_allowance）は文脈からまとめて抽出
  - 勤務地関連情報（area + workplace_address + workplace_access）は関連付けて抽出

### Phase 3: AI refinementの拡張

**対象ファイル**: `app/admin/actions.ts` の `refineJobWithAI`

**タスク**:
- [ ] fieldDescriptions に以下を追加:
  ```typescript
  hourly_wage: "時給（検索用）",
  salary_description: "給与詳細",
  period: "雇用期間",
  start_date: "就業開始時期",
  workplace_name: "勤務先名",
  workplace_address: "勤務地住所",
  workplace_access: "アクセス",
  ```

- [ ] AI refinementプロンプトに追加フィールドの説明を追加
- [ ] マスタデータに準拠させる必要がある項目は制約を追加

### Phase 4: JobAIRefineButtonの拡張

**対象ファイル**: `components/admin/JobAIRefineButton.tsx`

**タスク**:
- [ ] currentData の型定義を拡張して新フィールドを含める
- [ ] 新フィールドの選択チェックボックスを追加:
  - 時給（検索用）
  - 給与詳細
  - 雇用期間
  - 就業開始時期
  - 勤務先名
  - 勤務地住所
  - アクセス

**実装イメージ**:
```tsx
// 既存のチェックボックスに追加
<div className="flex items-center space-x-2">
  <Checkbox
    id="hourly_wage"
    checked={selectedFields.includes("hourly_wage")}
    onCheckedChange={(checked) => toggleField("hourly_wage", checked)}
  />
  <label htmlFor="hourly_wage" className="text-sm">時給（検索用）</label>
</div>
```

### Phase 5: startBatchExtractionの更新

**対象ファイル**: `app/admin/actions.ts` の `startBatchExtraction`

**タスク**:
- [ ] draft_jobs への insert に新フィールドを追加:
  ```typescript
  hourly_wage: extractedData.hourly_wage,
  salary_description: extractedData.salary_description,
  period: extractedData.period,
  start_date: extractedData.start_date,
  workplace_name: extractedData.workplace_name,
  workplace_address: extractedData.workplace_address,
  workplace_access: extractedData.workplace_access,
  attire: extractedData.attire,
  ```

### Phase 6: UI上のグループ化（オプション）

**目的**: ユーザビリティ向上のため、関連フィールドをグループ化して表示

**対象**: JobAIRefineButton のフィールド選択UI

**タスク**:
- [ ] フィールドをカテゴリ別にグループ化:
  ```
  □ 給与関連
    □ 時給（検索用）
    □ 給与詳細

  □ 勤務条件
    □ 雇用期間
    □ 就業開始時期

  □ 勤務先情報
    □ 勤務先名
    □ 勤務地住所
    □ アクセス
  ```

## 5. Estimated Complexity

- **Medium**

理由:
- 既存パターンに沿った追加作業
- AIプロンプトの調整が必要だが、既存のフォーマットがある
- UIのグループ化はオプションだが、ユーザビリティ向上に寄与

## 6. Critical Files

| ファイル | 変更内容 | 優先度 |
|---|---|---|
| `app/admin/actions.ts` | ExtractedJobData型拡張、AI抽出プロンプト更新、refinement拡張 | **HIGH** |
| `components/admin/JobAIRefineButton.tsx` | 選択可能フィールドの拡張、UIグループ化 | **HIGH** |
| `utils/types.ts` | DraftJob型拡張 | **MEDIUM** |

## 7. Verification Checklist

### 型・ビルド
- [ ] `npx tsc --noEmit` で型エラーなし
- [ ] `npm run build` でビルド成功

### AI抽出機能
- [ ] PDFアップロードで新フィールドが正しく抽出される
- [ ] 時給が数値として抽出される
- [ ] 勤務先情報が正しく抽出される
- [ ] 既存フィールドの抽出精度に悪影響がない

### AI Refinement機能
- [ ] JobAIRefineButtonで新フィールドが選択可能
- [ ] AI refinementで新フィールドが修正される
- [ ] マスタデータに準拠した修正が行われる

### データ整合性
- [ ] 既存求人で表示が崩れない
- [ ] 新規作成した求人で全フィールドが保存される
- [ ] ドラフト求人→本番求人の移行時にデータ欠落なし

## 8. Implementation Order

1. **Phase 1** (型定義の更新)
2. **Phase 2** (AI抽出プロンプトの更新)
3. **Phase 5** (startBatchExtractionの更新)
4. **Phase 3** (AI refinementの拡張)
5. **Phase 4** (JobAIRefineButtonの拡張)
6. **Phase 6** (UIグループ化 - オプション)

## 9. Notes

- 既存の `attire_type`, `hair_style` はAI抽出対応済みのため、追加不要
- `attire` フィールドは後方互換性のために残す（一文でまとめた服装・髪型情報）
- 交通関連・勤務地関連のフィールドは、AIプロンプトで文脈を考慮した抽出を行う
- UIのグループ化はオプションだが、ユーザビリティ向上のため推奨
