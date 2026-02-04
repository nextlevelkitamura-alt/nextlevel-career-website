-- ==========================================
-- Extend job_options table for hierarchical master data structure
-- ==========================================
-- This migration adds support for a hierarchical category structure
-- while maintaining backward compatibility with the legacy flat structure.
--
-- New structure:
--   - main_category: Top-level category (work_conditions, holidays, compensation, requirements, recruitment_info)
--   - sub_category: Second-level category (勤務地, 週休制度, 給与体系, etc.)
--   - legacy_category: Original category for backward compatibility
--   - sort_order: Display order within sub-category
--   - is_active: Enable/disable options
--   - keywords: Array of keywords for AI matching
--
-- Date: 2025-02-04
-- Related: JOB_BULK_IMPORT_PLAN.md Section 3.2
-- ==========================================

-- Add new columns to job_options
ALTER TABLE job_options
ADD COLUMN IF NOT EXISTS main_category text,
ADD COLUMN IF NOT EXISTS sub_category text,
ADD COLUMN IF NOT EXISTS legacy_category text,
ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS keywords text[];

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_options_main_category ON job_options(main_category);
CREATE INDEX IF NOT EXISTS idx_job_options_sub_category ON job_options(sub_category);
CREATE INDEX IF NOT EXISTS idx_job_options_legacy_category ON job_options(legacy_category);
CREATE INDEX IF NOT EXISTS idx_job_options_active ON job_options(is_active) WHERE is_active = true;

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_job_options_category_composite ON job_options(main_category, sub_category, is_active);

-- Add comments for documentation
COMMENT ON COLUMN job_options.main_category IS '大カテゴリ（work_conditions, holidays, compensation, requirements, recruitment_info）';
COMMENT ON COLUMN job_options.sub_category IS '小カテゴリ（勤務地、週休制度、給与体系など）';
COMMENT ON COLUMN job_options.legacy_category IS '旧カテゴリ（tags, holidays, benefits, requirements）- 後方互換性のため保持';
COMMENT ON COLUMN job_options.sort_order IS '表示順序（同一サブカテゴリ内でのソート用）';
COMMENT ON COLUMN job_options.is_active IS '有効/無効フラグ（無効な選択肢は非表示）';
COMMENT ON COLUMN job_options.keywords IS 'AIマッチング用キーワード配列（類似語・別名を含む）';

-- ==========================================
-- Data Migration: Map existing data to new structure
-- ==========================================

-- Update existing records with new category structure
-- This mapping follows the hierarchy defined in app/constants/jobMastersV2.ts

UPDATE job_options
SET
    main_category = CASE
        -- holidays -> holidays
        WHEN category = 'holidays' THEN
            CASE
                WHEN label IN ('完全週休2日制', '週休2日制', '土日祝休み') THEN 'holidays'
                WHEN label IN ('年間休日120日以上') THEN 'holidays'
                WHEN label IN ('夏季休暇', '年末年始休暇', 'GW休暇') THEN 'holidays'
                ELSE 'holidays'  -- Other holidays
            END
        -- benefits -> compensation or work_conditions
        WHEN category = 'benefits' THEN
            CASE
                WHEN label IN ('賞与あり', '昇給あり') THEN 'compensation'
                WHEN label IN ('交通費全額支給', '交通費規定支給', '残業代全額支給', '住宅手当', '家族手当') THEN 'compensation'
                WHEN label IN ('社会保険完備', '退職金制度', '寮・社宅あり', 'PC貸与') THEN 'compensation'
                WHEN label IN ('研修制度あり', '資格取得支援', '社員登用あり') THEN 'compensation'
                WHEN label IN ('服装自由', 'リモートワーク可') THEN 'work_conditions'
                ELSE 'compensation'  -- Default for benefits
            END
        -- requirements -> requirements
        WHEN category = 'requirements' THEN
            CASE
                WHEN label IN ('未経験OK', '経験者優遇', 'ブランクOK') THEN 'requirements'
                WHEN label IN ('学歴不問', '大卒以上') THEN 'requirements'
                WHEN label IN ('第二新卒歓迎', 'フリーター歓迎', '主婦(夫)活躍中', '20代活躍中', '30代活躍中') THEN 'requirements'
                WHEN label IN ('PCスキル（基本操作）', 'Excelスキル', '英語力不問') THEN 'requirements'
                ELSE 'requirements'  -- Default for requirements
            END
        -- tags -> work_conditions, holidays, or recruitment_info
        WHEN category = 'tags' THEN
            CASE
                WHEN label IN ('駅チカ・駅ナカ', '車通勤OK', '転勤なし') THEN 'work_conditions'
                WHEN label IN ('残業なし', '残業少なめ', '週3日からOK', '週4日からOK') THEN 'work_conditions'
                WHEN label IN ('リモートワーク可', '服装自由', 'シフト制', '完全シフト制', '平日休み', '土日祝のみOK') THEN 'work_conditions'
                WHEN label IN ('長期休暇あり') THEN 'holidays'
                WHEN label IN ('急募', '大量募集', 'オープニングスタッフ') THEN 'recruitment_info'
                WHEN label IN ('外資系企業', '大手企業', 'ベンチャー企業') THEN 'recruitment_info'
                ELSE 'recruitment_info'  -- Default for tags
            END
        ELSE 'recruitment_info'  -- Fallback
    END,
    sub_category = CASE
        -- holidays sub-categories
        WHEN category = 'holidays' THEN
            CASE
                WHEN label IN ('完全週休2日制', '週休2日制', '土日祝休み') THEN '週休制度'
                WHEN label IN ('年間休日120日以上') THEN '年間休日'
                WHEN label IN ('夏季休暇', '年末年始休暇', 'GW休暇') THEN '長期休暇'
                ELSE 'その他休暇'
            END
        -- benefits sub-categories
        WHEN category = 'benefits' THEN
            CASE
                WHEN label IN ('賞与あり', '昇給あり') THEN '給与体系'
                WHEN label IN ('交通費全額支給', '交通費規定支給', '残業代全額支給', '住宅手当', '家族手当') THEN '手当'
                WHEN label IN ('社会保険完備', '退職金制度', '寮・社宅あり', 'PC貸与') THEN '福利厚生'
                WHEN label IN ('研修制度あり', '資格取得支援', '社員登用あり') THEN 'キャリア'
                WHEN label IN ('服装自由', 'リモートワーク可') THEN '働き方'
                ELSE 'その他'
            END
        -- requirements sub-categories
        WHEN category = 'requirements' THEN
            CASE
                WHEN label IN ('未経験OK', '経験者優遇', 'ブランクOK') THEN '経験'
                WHEN label IN ('学歴不問', '大卒以上') THEN '学歴'
                WHEN label IN ('第二新卒歓迎', 'フリーター歓迎', '主婦(夫)活躍中', '20代活躍中', '30代活躍中') THEN '対象者'
                WHEN label IN ('PCスキル（基本操作）', 'Excelスキル', '英語力不問') THEN 'スキル'
                ELSE 'その他'
            END
        -- tags sub-categories
        WHEN category = 'tags' THEN
            CASE
                WHEN label IN ('駅チカ・駅ナカ', '車通勤OK', '転勤なし') THEN '勤務地'
                WHEN label IN ('残業なし', '残業少なめ', '週3日からOK', '週4日からOK', 'シフト制', '完全シフト制', '平日休み', '土日祝のみOK', 'リモートワーク可', '服装自由') THEN '勤務時間'
                WHEN label IN ('急募', '大量募集') THEN '緊急度'
                WHEN label IN ('外資系企業', '大手企業', 'ベンチャー企業') THEN '企業タイプ'
                WHEN label = '長期休暇あり' THEN '長期休暇'
                ELSE 'その他'
            END
        ELSE 'その他'
    END,
    legacy_category = category,  -- Preserve original category
    keywords = ARRAY[category, label]  -- Initial keywords for AI matching
WHERE
    main_category IS NULL  -- Only update records that haven't been migrated yet
    AND category IS NOT NULL;

-- Set sort_order based on sub-category order
-- This gives a predictable default order for UI display
UPDATE job_options
SET sort_order = CASE
    -- Work conditions
    WHEN main_category = 'work_conditions' AND sub_category = '勤務地' THEN
        CASE label
            WHEN '駅チカ・駅ナカ' THEN 1
            WHEN '車通勤OK' THEN 2
            WHEN '転勤なし' THEN 3
            ELSE 100
        END
    WHEN main_category = 'work_conditions' AND sub_category = '勤務時間' THEN
        CASE label
            WHEN '残業なし' THEN 1
            WHEN '残業少なめ' THEN 2
            WHEN '週3日からOK' THEN 3
            WHEN '週4日からOK' THEN 4
            ELSE 100
        END
    WHEN main_category = 'work_conditions' AND sub_category = '働き方' THEN
        CASE label
            WHEN 'リモートワーク可' THEN 1
            WHEN '服装自由' THEN 2
            WHEN 'シフト制' THEN 3
            WHEN '完全シフト制' THEN 4
            WHEN '平日休み' THEN 5
            WHEN '土日祝のみOK' THEN 6
            ELSE 100
        END
    -- Holidays
    WHEN main_category = 'holidays' AND sub_category = '週休制度' THEN
        CASE label
            WHEN '完全週休2日制' THEN 1
            WHEN '週休2日制' THEN 2
            WHEN '土日祝休み' THEN 3
            ELSE 100
        END
    WHEN main_category = 'holidays' AND sub_category = '長期休暇' THEN
        CASE label
            WHEN '夏季休暇' THEN 1
            WHEN '年末年始休暇' THEN 2
            WHEN 'GW休暇' THEN 3
            WHEN '長期休暇あり' THEN 4
            ELSE 100
        END
    -- Compensation
    WHEN main_category = 'compensation' AND sub_category = '給与体系' THEN
        CASE label
            WHEN '賞与あり' THEN 1
            WHEN '昇給あり' THEN 2
            ELSE 100
        END
    WHEN main_category = 'compensation' AND sub_category = '手当' THEN
        CASE label
            WHEN '交通費全額支給' THEN 1
            WHEN '交通費規定支給' THEN 2
            WHEN '残業代全額支給' THEN 3
            WHEN '住宅手当' THEN 4
            WHEN '家族手当' THEN 5
            ELSE 100
        END
    -- Requirements
    WHEN main_category = 'requirements' AND sub_category = '経験' THEN
        CASE label
            WHEN '未経験OK' THEN 1
            WHEN '経験者優遇' THEN 2
            WHEN 'ブランクOK' THEN 3
            ELSE 100
        END
    WHEN main_category = 'requirements' AND sub_category = '対象者' THEN
        CASE label
            WHEN '第二新卒歓迎' THEN 1
            WHEN 'フリーター歓迎' THEN 2
            WHEN '主婦(夫)活躍中' THEN 3
            WHEN '20代活躍中' THEN 4
            WHEN '30代活躍中' THEN 5
            ELSE 100
        END
    -- Recruitment info
    WHEN main_category = 'recruitment_info' AND sub_category = '緊急度' THEN
        CASE label
            WHEN '急募' THEN 1
            WHEN '大量募集' THEN 2
            ELSE 100
        END
    WHEN main_category = 'recruitment_info' AND sub_category = '企業タイプ' THEN
        CASE label
            WHEN '大手企業' THEN 1
            WHEN '外資系企業' THEN 2
            WHEN 'ベンチャー企業' THEN 3
            ELSE 100
        END
    ELSE 0
END
WHERE
    sort_order = 0  -- Only set for records that haven't been ordered yet
    AND main_category IS NOT NULL;

-- ==========================================
-- Verification Query (run this to verify migration)
-- ==========================================

-- Check that all records have been migrated
-- SELECT
--     legacy_category,
--     main_category,
--     sub_category,
--     COUNT(*) as count
-- FROM job_options
-- WHERE main_category IS NOT NULL
-- GROUP BY legacy_category, main_category, sub_category
-- ORDER BY legacy_category, main_category, sub_category;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload config';
