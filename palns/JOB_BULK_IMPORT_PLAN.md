# 求人一括取り込み＆マスタデータ整理 実装計画

## 1. 概要・目的

### 1.1 背景
- 多数の求人を効率的に取り込む必要がある
- 現在のマスタデータ（福利厚生・休日・タグ等）に重複・曖昧さがある
- AIによる求人抽出は1件ずつで、大量処理に対応していない

### 1.2 目標
1. **マスタデータの整理と統一**: 重複を排除し、階層的な分類体系を導入
2. **一括取り込み機能**: 複数の求人PDFを一度にアップロード・承認できる仕組み
3. **AI機能の強化**: 階層的タグ付け、重複検出、信頼度スコアリング

### 1.3 成功指標
- 求人取り込み時間が1件あたり3分以上 → 10件で5分以下に削減
- マスタデータの重複が現状の約30% → 0%に
- AI抽出精度が約70% → 90%以上に

---

## 2. 現状の課題分析

### 2.1 マスタデータの問題点

#### 重複・曖昧さの具体例
```
【例1】休日関連が複数カテゴリに分散
- holidays: ["土日祝休み", "年間休日120日以上"]
- tags: ["残業なし", "長期休暇あり"]  ← これも休日・休暇関連では？

【例2】働き方の条件が分散
- benefits: ["リモートワーク可"]
- tags: ["残業なし", "残業少なめ", "週3日からOK"]  ← 統一されていない

【例3】応募条件とタグの境界不明
- requirements: ["未経験OK", "20代活躍中"]
- tags: ["急募", "大量募集"]  ← これは応募条件とも言える
```

#### データ保存形式の不統一
```
- tags: PostgreSQL text[] 型
- holidays/benefits/requirements: JSON文字列（text型）
→ パース処理が異なり、コードが複雑化
```

#### 二重管理
```
- app/constants/jobMasters.ts（コード内ハードコード）
- job_options テーブル（DB）
→ どちらが正か不明瞭
```

### 2.2 一括取り込みの問題点
```
現在のフロー:
1. PDFを1つ選択
2. AI抽出ボタンを押す
3. 確認して保存
4. 次のPDFに進む（繰り返し）

→ 10件の求人なら30分以上かかる
→ エラーがあっても一覧で見れない
→ 再編集の手間が大きい
```

---

## 3. マスタデータ整理

### 3.1 新しい分類体系

#### 大カテゴリ（5つ）と小カテゴリ

| 大カテゴリ | 小カテゴリ | 内容 | 元カテゴリ |
|:---|:---|:---|:---|
| **work_conditions** | 勤務地 | 駅チカ、車通勤OK、転勤なし | tags |
| | 勤務時間 | 残業なし、残業少なめ、週3日からOK | tags |
| | 働き方 | リモート可、服装自由、シフト制 | benefits, tags |
| **holidays** | 週休制度 | 完全週休2日、土日祝休み | holidays |
| | 年間休日 | 年間休日120日以上 | holidays |
| | 長期休暇 | 夏季休暇、年末年始、GW休暇 | holidays, tags |
| | その他休暇 | 有給休暇、慶弔、育児休暇 | holidays |
| **compensation** | 給与体系 | 賞与あり、昇給あり | benefits |
| | 手当 | 交通費全額支給、住宅手当、家族手当 | benefits |
| | 福利厚生 | 社会保険完備、退職金、寮・社宅 | benefits |
| | キャリア | 研修制度、資格取得支援、社員登用 | benefits |
| **requirements** | 経験 | 未経験OK、経験者優遇、ブランクOK | requirements |
| | 学歴 | 学歴不問、大卒以上 | requirements |
| | 対象者 | 第二新卒、フリーター、主婦(夫) | requirements |
| | スキル | PCスキル、Excelスキル | requirements |
| **recruitment_info** | 緊急度 | 急募、大量募集 | tags |
| | 企業タイプ | 外資系、大手、ベンチャー | tags |
| | その他 | オープニングスタッフ | tags |

### 3.2 データベース設計

#### job_options テーブル拡張

```sql
-- 既存のjob_optionsテーブルにカラム追加
ALTER TABLE job_options
ADD COLUMN IF NOT EXISTS main_category text,
ADD COLUMN IF NOT EXISTS sub_category text,
ADD COLUMN IF NOT EXISTS legacy_category text,
ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS keywords text[];

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_job_options_main_category ON job_options(main_category);
CREATE INDEX IF NOT EXISTS idx_job_options_legacy_category ON job_options(legacy_category);
CREATE INDEX IF NOT EXISTS idx_job_options_active ON job_options(is_active) WHERE is_active = true;

-- コメント追加
COMMENT ON COLUMN job_options.main_category IS '大カテゴリ（work_conditions, holidays, compensation, requirements, recruitment_info）';
COMMENT ON COLUMN job_options.sub_category IS '小カテゴリ（勤務地、週休制度、給与体系など）';
COMMENT ON COLUMN job_options.legacy_category IS '旧カテゴリ（後方互換性のため保持）';
COMMENT ON COLUMN job_options.keywords IS 'AIマッチング用キーワード';
```

#### 既存のjobsテーブルの保存形式統一（オプション）

```sql
-- 方案A: すべてtext[]型に統一（シンプル）
ALTER TABLE jobs
ALTER COLUMN holidays TYPE text[] USING
  CASE
    WHEN holidays IS NULL THEN NULL
    WHEN holidays = '' THEN '{}'
    ELSE string_to_array(replace(replace(holidays, '[', ''), ']', ''), ',')
  END;

ALTER TABLE jobs
ALTER COLUMN benefits TYPE text[] USING
  CASE
    WHEN benefits IS NULL THEN NULL
    WHEN benefits = '' THEN '{}'
    ELSE string_to_array(replace(replace(benefits, '[', ''), ']', ''), ',')
  END;

ALTER TABLE jobs
ALTER COLUMN requirements TYPE text[] USING
  CASE
    WHEN requirements IS NULL THEN NULL
    WHEN requirements = '' THEN '{}'
    ELSE string_to_array(replace(replace(requirements, '[', ''), ']', ''), ',')
  END;
```

### 3.3 マイグレーション手順

#### ステップ1: 既存データの分析

```sql
-- 現在のマスタデータの使用状況を確認
SELECT
    category,
    COUNT(*) as count,
    array_agg(label ORDER BY label) as labels
FROM job_options
GROUP BY category
ORDER BY category;
```

#### ステップ2: マッピングテーブル作成

```sql
-- 既存データから新構造へのマッピング
UPDATE job_options
SET
    main_category = CASE
        WHEN category = 'holidays' THEN 'holidays'
        WHEN category = 'benefits' THEN 'compensation'
        WHEN category = 'requirements' THEN 'requirements'
        WHEN category = 'tags' THEN
            CASE
                WHEN label IN ('駅チカ・駅ナカ', '車通勤OK', '転勤なし') THEN 'work_conditions'
                WHEN label IN ('残業なし', '残業少なめ', '週3日からOK', '週4日からOK') THEN 'work_conditions'
                WHEN label IN ('リモートワーク可', '服装自由', 'シフト制', '完全シフト制', '平日休み', '土日祝のみOK') THEN 'work_conditions'
                WHEN label IN ('長期休暇あり') THEN 'holidays'
                WHEN label IN ('急募', '大量募集', 'オープニングスタッフ') THEN 'recruitment_info'
                WHEN label IN ('外資系企業', '大手企業', 'ベンチャー企業') THEN 'recruitment_info'
                ELSE 'recruitment_info' -- デフォルト
            END
    END,
    sub_category = CASE
        WHEN category = 'holidays' THEN
            CASE
                WHEN label IN ('完全週休2日制', '週休2日制', '土日祝休み') THEN '週休制度'
                WHEN label IN ('年間休日120日以上') THEN '年間休日'
                WHEN label IN ('夏季休暇', '年末年始休暇', 'GW休暇') THEN '長期休暇'
                ELSE 'その他休暇'
            END
        WHEN category = 'benefits' THEN
            CASE
                WHEN label IN ('賞与あり', '昇給あり') THEN '給与体系'
                WHEN label IN ('交通費全額支給', '交通費規定支給', '残業代全額支給', '住宅手当', '家族手当') THEN '手当'
                WHEN label IN ('社会保険完備', '退職金制度', '寮・社宅あり', 'PC貸与') THEN '福利厚生'
                WHEN label IN ('研修制度あり', '資格取得支援', '社員登用あり') THEN 'キャリア'
                ELSE 'その他'
            END
        WHEN category = 'requirements' THEN
            CASE
                WHEN label IN ('未経験OK', '経験者優遇', 'ブランクOK') THEN '経験'
                WHEN label IN ('学歴不問', '大卒以上') THEN '学歴'
                WHEN label IN ('第二新卒歓迎', 'フリーター歓迎', '主婦(夫)活躍中', '20代活躍中', '30代活躍中') THEN '対象者'
                WHEN label IN ('PCスキル（基本操作）', 'Excelスキル', '英語力不問') THEN 'スキル'
                ELSE 'その他'
            END
        WHEN category = 'tags' THEN
            CASE
                WHEN label IN ('駅チカ・駅ナカ', '車通勤OK', '転勤なし') THEN '勤務地'
                WHEN label IN ('残業なし', '残業少なめ', '週3日からOK', '週4日からOK', 'リモートワーク可', '服装自由', 'シフト制', '完全シフト制', '平日休み', '土日祝のみOK') THEN '勤務時間'
                WHEN label IN ('急募', '大量募集', 'オープニングスタッフ') THEN '緊急度'
                WHEN label IN ('外資系企業', '大手企業', 'ベンチャー企業') THEN '企業タイプ'
                ELSE 'その他'
            END
    END,
    legacy_category = category,
    keywords = ARRAY[label]
WHERE category IS NOT NULL;
```

#### ステップ3: jobMasters.ts の更新

```typescript
// app/constants/jobMastersV2.ts（新ファイル）
export const JOB_MASTERS_V2 = {
    work_conditions: {
        勤務地: [
            "駅チカ・駅ナカ",
            "車通勤OK",
            "転勤なし"
        ],
        勤務時間: [
            "残業なし",
            "残業少なめ",
            "週3日からOK",
            "週4日からOK"
        ],
        働き方: [
            "リモートワーク可",
            "服装自由",
            "シフト制",
            "完全シフト制",
            "平日休み",
            "土日祝のみOK"
        ]
    },
    holidays: {
        週休制度: [
            "完全週休2日制",
            "週休2日制",
            "土日祝休み"
        ],
        年間休日: [
            "年間休日120日以上"
        ],
        長期休暇: [
            "長期休暇あり",
            "夏季休暇",
            "年末年始休暇",
            "GW休暇"
        ],
        その他休暇: [
            "有給休暇",
            "慶弔休暇",
            "産前産後休暇",
            "育児休暇"
        ]
    },
    compensation: {
        給与体系: [
            "賞与あり",
            "昇給あり"
        ],
        手当: [
            "交通費全額支給",
            "交通費規定支給",
            "残業代全額支給",
            "住宅手当",
            "家族手当"
        ],
        福利厚生: [
            "社会保険完備",
            "退職金制度",
            "寮・社宅あり",
            "PC貸与"
        ],
        キャリア: [
            "研修制度あり",
            "資格取得支援",
            "社員登用あり"
        ]
    },
    requirements: {
        経験: [
            "未経験OK",
            "経験者優遇",
            "ブランクOK"
        ],
        学歴: [
            "学歴不問",
            "大卒以上"
        ],
        対象者: [
            "第二新卒歓迎",
            "フリーター歓迎",
            "主婦(夫)活躍中",
            "20代活躍中",
            "30代活躍中"
        ],
        スキル: [
            "PCスキル（基本操作）",
            "Excelスキル",
            "英語力不問"
        ]
    },
    recruitment_info: {
        緊急度: [
            "急募",
            "大量募集"
        ],
        企業タイプ: [
            "外資系企業",
            "大手企業",
            "ベンチャー企業"
        ],
        その他: [
            "オープニングスタッフ"
        ]
    }
} as const;

// ヘルパー関数
export type MainCategory = keyof typeof JOB_MASTERS_V2;

export function getFlatMasterList(
    mainCategory: MainCategory,
    subCategory?: string
): string[] {
    const category = JOB_MASTERS_V2[mainCategory];

    if (subCategory && typeof category === 'object') {
        return category[subCategory as keyof typeof category] || [];
    }

    return Object.values(category).flat();
}

export function getAllMasterOptions() {
    const result: {
        mainCategory: MainCategory;
        subCategory: string;
        label: string;
    }[] = [];

    for (const [mainCat, subCats] of Object.entries(JOB_MASTERS_V2)) {
        for (const [subCat, labels] of Object.entries(subCats)) {
            for (const label of labels) {
                result.push({
                    mainCategory: mainCat as MainCategory,
                    subCategory: subCat,
                    label
                });
            }
        }
    }

    return result;
}
```

### 3.4 後方互換性の確保

- `legacy_category` カラムで旧カテゴリを保持
- 既存の求人データの `tags`/`holidays`/`benefits`/`requirements` はそのまま維持
- 新規作成・編集時のみ新構造を使用
- 表示時は legacy_category で判定し、古いデータも正しく表示

---

## 4. 一括取り込み機能

### 4.1 ユーザーフロー（3段階承認）

```
【ステップ1: アップロード】
  複数ファイルをドロップまたは選択
  → 抽出モード選択（通常/匿名）
  → [抽出開始]

【ステップ2: プレビュー & 編集】
  抽出結果一覧表示
  → 個別に[編集]ボタンで詳細確認・修正
  → AI信頼度スコア表示（★★★★☆ 85%）
  → チェックボックスで選択
  → [選択した求人を一括承認]

【ステップ3: 最終確認 & 公開】
  公開前の最終確認
  → [〇件を一括公開]
  → draft_jobs から jobs に移動
```

### 4.2 テーブル設計

```sql
-- 下書き求人テーブル
CREATE TABLE draft_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 基本情報（jobs と同じ構造）
    title text NOT NULL,
    area text,
    type text,
    salary text,
    category text,
    tags text[],
    description text,
    requirements text,
    working_hours text,
    holidays text,
    benefits text,
    selection_process text,

    -- AI抽出情報
    ai_analysis jsonb,
    source_file_url text,
    source_file_name text,

    -- 管理情報
    batch_id uuid,
    extraction_status text,  -- 'success' | 'warning' | 'error'
    extraction_warnings text[],
    ai_confidence int,  -- 0-100

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- バッチ管理テーブル
CREATE TABLE extraction_batches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    total_files int,
    processed_count int DEFAULT 0,
    success_count int DEFAULT 0,
    warning_count int DEFAULT 0,
    error_count int DEFAULT 0,

    status text,  -- 'processing' | 'completed' | 'failed'

    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- インデックス
CREATE INDEX idx_draft_jobs_batch_id ON draft_jobs(batch_id);
CREATE INDEX idx_draft_jobs_status ON draft_jobs(extraction_status);
CREATE INDEX idx_extraction_batches_status ON extraction_batches(status);

-- RLS ポリシー
ALTER TABLE draft_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_batches ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能
CREATE POLICY "Admins can manage draft_jobs" ON draft_jobs
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage extraction_batches" ON extraction_batches
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### 4.3 API設計

#### Server Actions

```typescript
// app/admin/actions.ts に追加

/**
 * バッチ抽出を開始
 */
export async function startBatchExtraction(files: File[], mode: 'standard' | 'anonymous') {
    // 1. バッチレコード作成
    // 2. ファイルをStorageにアップロード
    // 3. 各ファイルに対して非同期でAI抽出開始
    // 4. バッチIDを返却
}

/**
 * バッチ処理の進捗を取得
 */
export async function getBatchProgress(batchId: string) {
    // バッチの進捗状況を返却
    return {
        total: 10,
        processed: 7,
        success: 5,
        warning: 2,
        error: 0,
        status: 'processing'
    };
}

/**
 * 下書き求人一覧を取得
 */
export async function getDraftJobs(batchId: string) {
    // 指定バッチの下書き求人一覧を返却
}

/**
 * 下書き求人を更新
 */
export async function updateDraftJob(id: string, data: Partial<Job>) {
    // 下書き求人を更新
}

/**
 * 下書き求人を一括公開
 */
export async function publishDraftJobs(ids: string[]) {
    // draft_jobs から jobs に移動
    // draft_jobs から削除
}
```

### 4.4 UI設計

#### コンポーネント構成

```
/app/admin/batch-import/page.tsx        ★ メインページ
  ├── BatchUploadSection.tsx            ファイルアップロード
  ├── BatchProgressSection.tsx          進捗表示
  └── DraftJobsList.tsx                 下書き一覧
      └── DraftJobCard.tsx              各求人カード
          ├── AIConfidenceIndicator     信頼度表示
          ├── DraftJobEditor.tsx        編集モーダル
          │   ├── JobFormFields         フォームフィールド
          │   └── AIRefineButton        AI修正機能
          └── BatchConfirmDialog        一括公開確認
```

#### DraftJobCard コンポーネント（例）

```tsx
// components/admin/DraftJobCard.tsx
interface DraftJobCardProps {
    draftJob: DraftJob;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleSelect: (id: string) => void;
    isSelected: boolean;
}

export function DraftJobCard({
    draftJob,
    onEdit,
    onDelete,
    onToggleSelect,
    isSelected
}: DraftJobCardProps) {
    const statusColor = {
        success: 'text-green-600',
        warning: 'text-yellow-600',
        error: 'text-red-600'
    }[draftJob.extraction_status];

    return (
        <div className={`border rounded-lg p-4 ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(draftJob.id)}
                    />
                    <div>
                        <h3 className="font-semibold">{draftJob.title}</h3>
                        <p className="text-sm text-gray-600">
                            {draftJob.area} | {draftJob.salary}
                        </p>
                        <div className="flex gap-2 mt-2">
                            {draftJob.tags?.slice(0, 3).map(tag => (
                                <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <AIConfidenceIndicator confidence={draftJob.ai_confidence} />
                    <p className={`text-sm ${statusColor}`}>
                        {draftJob.extraction_status === 'success' && '✓ 抽出成功'}
                        {draftJob.extraction_status === 'warning' && '⚠ 要確認'}
                        {draftJob.extraction_status === 'error' && '✗ エラー'}
                    </p>
                </div>
            </div>
            {draftJob.extraction_warnings?.length > 0 && (
                <div className="mt-3 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                    ⚠ {draftJob.extraction_warnings[0]}
                </div>
            )}
            <div className="mt-3 flex gap-2">
                <button onClick={() => onEdit(draftJob.id)} className="text-blue-600 text-sm">
                    編集
                </button>
                <button onClick={() => onDelete(draftJob.id)} className="text-red-600 text-sm">
                    削除
                </button>
            </div>
        </div>
    );
}
```

### 4.5 エラーハンドリング

#### 抽出エラーの分類

| エラータイプ | 原因 | 対処 |
|:---|:---|:---|
| `file_error` | ファイル形式不正、読み取り失敗 | 該当ファイルのみスキップ |
| `ai_error` | Gemini APIエラー | リトライ（最大3回） |
| `parsing_error` | AI出力のパース失敗 | 手動入力へ誘導 |
| `validation_error` | 必須フィールド不足 | 要確認フラグ |

#### エラー時のUI表示

```tsx
// エラー状態のカード表示
{draftJob.extraction_status === 'error' && (
    <div className="bg-red-50 border border-red-200 rounded p-4">
        <h4 className="font-semibold text-red-700">抽出エラー</h4>
        <p className="text-sm text-red-600 mt-1">
            {draftJob.extraction_warnings?.join(' / ')}
        </p>
        <button className="mt-2 text-sm text-blue-600">
            手動で入力する
        </button>
    </div>
)}
```

---

## 5. AI機能の強化

### 5.1 階層的タグ付け

#### 新しいプロンプト構造

```typescript
// utils/gemini.ts で改善
const HIERARCHICAL_TAGGING_PROMPT = `
あなたはプロの求人アナライザーです。
以下の求人テキストを分析し、階層的なカテゴリでタグ付けしてください。

【大カテゴリ】
- work_conditions: 勤務条件（勤務地、勤務時間、働き方）
- holidays: 休日・休暇（週休、年間休日、長期休暇）
- compensation: 給与・待遇（給与体系、手当、福利厚生、キャリア）
- requirements: 応募条件（経験、学歴、対象者、スキル）
- recruitment_info: 募集情報（緊急度、企業タイプ）

【出力形式】
{
  "work_conditions": {
    "勤務地": ["駅チカ・駅ナカ"],
    "勤務時間": ["残業少なめ"],
    "働き方": ["服装自由"]
  },
  "holidays": {
    "週休制度": ["土日祝休み"],
    "長期休暇": ["夏季休暇", "年末年始休暇"]
  },
  ...
}

【重要】
- マスタデータに存在するラベルのみを使用
- 曖昧な場合は後方互換カテゴリ（legacy_category）を参考に
- 該当するタグがない場合は空配列 []
`;
```

### 5.2 重複検出

```typescript
/**
 * 既存求人との重複を検出
 */
export async function detectDuplicateJob(
    newJobData: ExtractedJobData
): Promise<{ isDuplicate: boolean; similarJobs?: Job[] }> {

    // 既存求人を取得
    const { data: existingJobs } = await supabase
        .from('jobs')
        .select('id, title, area, salary, category')
        .limit(100);

    if (!existingJobs) return { isDuplicate: false };

    // Geminiで類似度判定
    const prompt = `
以下の新しい求人と既存求人リストを比較し、
重複または同一の求人だと思われるものを特定してください。

【新しい求人】
タイトル: ${newJobData.title}
エリア: ${newJobData.area}
給与: ${newJobData.salary}

【既存求人リスト】
${existingJobs.map(j => `
- ID: ${j.id}
  タイトル: ${j.title}
  エリア: ${j.area}
  給与: ${j.salary}
`).join('\n')}

【出力形式】
{
  "is_duplicate": true/false,
  "duplicate_ids": ["uuid1", "uuid2"],
  "reason": "類似の理由"
}
`;

    const result = await gemini.generateContent(prompt);
    const response = JSON.parse(result.response.text());

    if (response.is_duplicate) {
        const similarJobs = existingJobs.filter(j =>
            response.duplicate_ids.includes(j.id)
        );
        return { isDuplicate: true, similarJobs };
    }

    return { isDuplicate: false };
}
```

### 5.3 信頼度スコア

```typescript
/**
 * AI抽出の信頼度スコアを計算
 */
export function calculateAIConfidence(
    extractedData: ExtractedJobData,
    matchResults: TagMatchResults
): number {
    let score = 100;

    // 必須フィールドの欠落
    if (!extractedData.title) score -= 30;
    if (!extractedData.area) score -= 20;
    if (!extractedData.salary) score -= 20;

    // マッチング精度
    const exactMatches = Object.values(matchResults)
        .flat()
        .filter(r => r.match === 'exact').length;
    const newTags = Object.values(matchResults)
        .flat()
        .filter(r => r.match === 'new').length;

    score += exactMatches * 2;
    score -= newTags * 5;

    // 給与フォーマット
    if (extractedData.salary && !extractedData.salary.match(/[0-9]/)) {
        score -= 10;
    }

    return Math.max(0, Math.min(100, score));
}
```

---

## 6. 実装フェーズ

### フェーズ1: マスタデータ整理（優先度: 高）

| タスク | 担当 | 予定工数 | 依存関係 |
|:---|:---|:---|:---|
| 1.1 既存データの分析 | - | 2時間 | - |
| 1.2 job_optionsテーブル拡張 | - | 1時間 | 1.1 |
| 1.3 マイグレーションスクリプト作成 | - | 2時間 | 1.2 |
| 1.4 jobMastersV2.ts作成 | - | 1時間 | 1.2 |
| 1.5 既存データの移行実行 | - | 1時間 | 1.3 |
| 1.6 管理画面の選択UI更新 | - | 4時間 | 1.4 |
| 1.7 テスト | - | 2時間 | 1.6 |
| **小計** | | **13時間** | |

### フェーズ2: 一括取り込み機能（優先度: 高）

| タスク | 担当 | 予定工数 | 依存関係 |
|:---|:---|:---|:---|
| 2.1 draft_jobsテーブル作成 | - | 1時間 | - |
| 2.2 extraction_batchesテーブル作成 | - | 30分 | 2.1 |
| 2.3 Server Actions実装 | - | 4時間 | 2.2 |
| 2.4 BatchUploadSectionコンポーネント | - | 3時間 | - |
| 2.5 BatchProgressSectionコンポーネント | - | 2時間 | 2.4 |
| 2.6 DraftJobsListコンポーネント | - | 3時間 | 2.3 |
| 2.7 DraftJobCardコンポーネント | - | 2時間 | 2.6 |
| 2.8 DraftJobEditorモーダル | - | 3時間 | 2.7 |
| 2.9 一括公開機能 | - | 2時間 | 2.8 |
| 2.10 エラーハンドリング | - | 2時間 | 2.3 |
| 2.11 テスト | - | 3時間 | 2.10 |
| **小計** | | **25.5時間** | |

### フェーズ3: AI機能強化（優先度: 中）

| タスク | 担当 | 予定工数 | 依存関係 |
|:---|:---|:---|:---|
| 3.1 階層的タグ付けプロンプト改善 | - | 2時間 | フェーズ1 |
| 3.2 重複検出機能実装 | - | 3時間 | フェーズ2 |
| 3.3 信頼度スコア実装 | - | 2時間 | 2.3 |
| 3.4 AIConfidenceIndicatorコンポーネント | - | 1時間 | 3.3 |
| 3.5 プロンプトチューニング | - | 3時間 | 3.1 |
| 3.6 テスト | - | 3時間 | 3.5 |
| **小計** | | **14時間** | |

---

## 7. テスト計画

### 7.1 マスタデータ整理のテスト

| テスト項目 | 内容 | 期待結果 |
|:---|:---|:---|
| マイグレーション | 既存データが新構造に移行される | legacy_categoryに旧値、main/subカテゴリに新値 |
| 表示互換性 | 旧データも正しく表示される | 古い求人のタグが表示される |
| 編集機能 | 新構造で選択・保存できる | main_categoryでグループ化された選択肢 |
| AI抽出 | 新構造でタグ付けされる | 階層的なカテゴリでタグが保存される |

### 7.2 一括取り込みのテスト

| テスト項目 | 内容 | 期待結果 |
|:---|:---|:---|
| 正常系（10ファイル） | 10個のPDFを一括アップロード | 全件正常に抽出、一覧表示 |
| エラー処理 | 不正ファイルを含むアップロード | エラー件のみスキップ、他は正常処理 |
| 進捗表示 | 処理中に進捗を確認 | リアルタイムに進捗更新（3/10→7/10） |
| 編集機能 | 下書きを編集して再保存 | 内容が反映される |
| 一括公開 | 複数選択して公開 | 選択件がjobsテーブルに移動 |
| 重複検出 | 既存求人と類似の内容を抽出 | 重複警告が表示される |

### 7.3 AI機能のテスト

| テスト項目 | 内容 | 期待結果 |
|:---|:---|:---|
| タグ付け精度 | 10件のサンプルで抽出 | 正確率90%以上 |
| 重複検出 | 既存求人と似せた内容を抽出 | 重複を検出できる |
| 信頼度スコア | 品質の異なるデータを処理 | 品質に応じたスコア（高い〜低い） |

---

## 8. リリース戦略

### 8.1 段階的リリース

```
【Phase 1】マスタデータ整理のみ
  → 既存機能への影響を最小限に
  → 新規作成・編集時のみ新構造を使用
  → 表示は後方互換

【Phase 2】一括取り込み機能（ベータ）
  → 管理者のみ使用可能
  → 少数の求人でテスト（5〜10件）
  → フィードバック収集

【Phase 3】AI機能強化
  → 階層的タグ付け、重複検出を有効化
  → 信頼度スコア表示

【Phase 4】本番リリース
  → 全管理者に展開
  → 既存の単件取り込みも廃止せず並行運用
```

### 8.2 ロールバック計画

| 問題 | ロールバック方法 |
|:---|:---|
| マスタ移行エラー | 既存のjobMasters.tsに戻す |
| 一括取り込みバグ | 単件取り込み機能を使用 |
| AI精度低下 | 旧プロンプトに戻す |

---

## 9. リスクと対策

| リスク | 影響 | 確率 | 対策 |
|:---|:---|:---|:---|
| 既存求人データの不整合 | 高 | 中 | ① 十分なテスト ② バックアップ取得 ③ 後方互換性確保 |
| AI抽出精度の低下 | 中 | 低 | ① プロンプトチューニング ② 旧機能並行運用 |
| 一括処理時のパフォーマンス問題 | 中 | 中 | ① バッチサイズ制限 ② 進捗表示 ③ タイムアウト設定 |
| Gemini APIのレート制限 | 中 | 中 | ① リトライ処理 ② キューイング ③ エラー表示 |
| ユーザーにとって複雑になる | 低 | 低 | ① シンプルなUI ② チュートリアル |

---

## 10. 次のアクション

1. この計画書の承認を得る
2. フェーズ1（マスタデータ整理）を開始
3. 進捗を `DAILY_TASK.md` に記録

---

*作成日: 2025-02-04*
*ステータス: 承認待ち*
