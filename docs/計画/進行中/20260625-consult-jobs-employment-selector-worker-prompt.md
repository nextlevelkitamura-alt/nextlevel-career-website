# 別チャット初回プロンプト: 相談予約下の画像なし求人導線

あなたは NextLevel Career Site の実装担当です。

## 目的

`/consult-jobs` の予約枠カード直下に、画像なしの雇用形態別求人導線を実装してください。

実装後は、元チャットが監督・レビューします。あなたの完了報告はレビュー材料になります。

## 最初に必ず読むもの

1. `AGENTS.md`
2. `docs/ROADMAP.md`
3. `docs/計画/進行中/`
4. `docs/計画/進行中/20260625-consult-jobs-employment-selector.md`
5. `docs/企画/assets/consult-jobs-employment-selector-no-image-mobile.png`

## 現在の前提

- 通常作業場所は既存の `main` worktree
- 既存 worktree には他作業の未コミット差分がある可能性が高い
- 作業開始時に `git status --short --branch` を確認し、無関係な差分を戻さない
- 実装後は対象ファイルだけを stage して、小さくコミットする
- push / deploy はしない

## 実装範囲

追加する画面:

- `/consult-jobs` の予約枠カード直下
- 新規セクション名: `求人も一緒に見る`
- 見出し左のアイコンは不要。絶対に置かない
- サブコピー: `相談前に条件に合う求人を確認`

UI:

- `派遣 {件数}件` / `正社員 {件数}件` のタブ
- 選択中の雇用形態に合うおすすめ求人を最大2から3件表示
- 求人カードは画像なし
- カード内容:
  - 雇用形態バッジ
  - 求人タイトル
  - 給与
  - エリア
  - タグ2から3個
  - `求人詳細を見る` ボタン
- 下部に `すべての求人を見る` リンク
  - 正社員: `/jobs?type=正社員`
  - 派遣: `/jobs?type=派遣`

初期選択:

- 選択中ルートが `dispatch`: 派遣
- 選択中ルートが `fulltime`: 正社員
- 選択中ルートが `undecided`: 件数が多い方。迷う場合は派遣

## 触ってよいファイル

- `app/consult-jobs/page.tsx`
- `app/consult-jobs/actions.ts`
- `app/consult-jobs/demoData.ts`
- `components/consult-jobs/ConsultJobsClient.tsx`
- `components/consult-jobs/ConsultationJobList.tsx`
- 必要なら `components/consult-jobs/ConsultationEmploymentJobPreview.tsx` を新規作成

## 触らないファイル

- `.env*`
- `supabase/migrations/`
- `app/jobs/page.tsx`
- `app/jobs/JobsClient.tsx`
- `components/SearchForm.tsx`
- 既存の管理画面系ファイル
- このタスクに関係ないリファクタ

## データ取得方針

既存 `/jobs` は `type` クエリ対応済みなので、求人一覧側は変更しない。

`/consult-jobs` 用に、派遣と正社員のサマリーを作る。

```ts
type ConsultationEmploymentKey = "dispatch" | "fulltime";

type ConsultationEmploymentJobGroup = {
  key: ConsultationEmploymentKey;
  label: "派遣" | "正社員";
  typeQuery: "派遣" | "正社員";
  total: number;
  listUrl: string;
  jobs: ConsultationJobCard[];
};

type ConsultationEmploymentJobSummary = {
  dispatch: ConsultationEmploymentJobGroup;
  fulltime: ConsultationEmploymentJobGroup;
};
```

推奨:

- `app/jobs/actions.ts` の `getPublicJobsList` を server 側で再利用できるなら使う
- 直接 Supabase query でもよいが、公開求人条件と期限切れ除外は既存一覧と揃える
- 件数は求人一覧の総件数と揃える
- 表示求人は各雇用形態3件程度
- `type=派遣` は既存求人一覧と同じ扱いにする

## クリック導線

- `求人詳細を見る` は `/jobs/[id]`
- クリック時は可能なら既存 `recordConsultationLpClick` に `clickType: "job_detail"` と `jobId` を渡す
- `すべての求人を見る` は単純に `/jobs?type=正社員` または `/jobs?type=派遣`
- `clickType` を増やすための DB 変更はしない

## 受け入れ条件

- `/consult-jobs?demo=1` で画像なし求人導線が表示される
- 「求人も一緒に見る」の左横にアイコンがない
- 求人カード内に画像枠、サムネイル枠、写真プレースホルダーがない
- タブ切替で派遣/正社員の表示が切り替わる
- 件数が表示される
- `すべての求人を見る` が選択中タブに応じた `/jobs?type=...` へ向く
- モバイル幅でテキストやボタンが重ならない

## 検証

最低限:

```bash
npx tsc --noEmit
```

可能なら:

```bash
npm run lint
npm run build
```

表示確認:

- `/consult-jobs?demo=1`
- モバイル幅
- 正社員タブ
- 派遣タブ
- `求人詳細を見る`
- `すべての求人を見る`

## 完了報告フォーマット

次の形式で元チャットへ報告してください。

```md
## 完了報告

- branch/worktree:
- base commit:
- commit:
- 変更ファイル:
- 実装内容:
- 検証:
- 表示確認:
- 未解決リスク:
- local main:
- origin/main:
- production:
```

## 注意

- 画像を使わない
- 見出し左アイコンを置かない
- DB migration を追加しない
- 無関係な既存差分を戻さない
- push / deploy しない
