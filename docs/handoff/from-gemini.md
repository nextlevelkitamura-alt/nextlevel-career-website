# To Claude / Next Developer

## 更新日時
2026-02-07

## 実施した内容
求人カードと求人詳細ページでの「雇用形態表示」と「タグ」の配色を修正しました。

### 修正内容
1.  **正社員（青系統）**
    *   文字色: `text-blue-600`
    *   背景色: `bg-blue-50`
    *   枠線: `border-blue-200`
2.  **派遣（ピンク系統）**
    *   文字色: `text-pink-600`
    *   背景色: `bg-pink-50`
    *   枠線: `border-pink-200`

### 変更したファイル
-   `lib/utils.ts`: `getEmploymentTypeStyle` の背景色を修正（`bg-white` -> `bg-blue-50`/`bg-pink-50`）。
-   `components/JobCard.tsx`: 雇用形態のバッジに `border` クラスを追加。
-   `app/jobs/[id]/page.tsx`: 雇用形態のバッジに `border` クラスを追加。

### 確認事項
-   正社員・派遣それぞれの雇用形態ラベルが指定の色（背景・枠線・文字）で表示されていること。
-   タグの色が雇用形態に合わせて変化すること（`lib/utils.ts` の `getJobTagStyle` は変更なしですが、正しい挙動であることを確認済み）。
