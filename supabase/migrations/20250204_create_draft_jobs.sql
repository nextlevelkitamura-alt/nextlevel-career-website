-- ==========================================
-- Draft Jobs & Extraction Batches Tables
-- ==========================================
-- These tables support the bulk job import functionality with
-- a 3-stage approval workflow: Extract → Review → Publish
--
-- Date: 2025-02-04
-- Related: JOB_BULK_IMPORT_PLAN.md Section 4.2
-- ==========================================

-- ==========================================
-- 1. Draft Jobs Table
-- ==========================================
-- Stores AI-extracted job data before admin approval
-- Structure mirrors jobs table with additional AI-related fields

CREATE TABLE IF NOT EXISTS draft_jobs (
    -- Primary key
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Basic job information (mirrors jobs table)
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

    -- AI extraction information
    ai_analysis jsonb,
    source_file_url text,
    source_file_name text,
    source_file_type text,

    -- Management fields
    batch_id uuid REFERENCES extraction_batches(id) ON DELETE SET NULL,
    extraction_status text DEFAULT 'success' CHECK (extraction_status IN ('success', 'warning', 'error')),
    extraction_warnings text[],
    ai_confidence int CHECK (ai_confidence >= 0 AND ai_confidence <= 100),

    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ==========================================
-- 2. Extraction Batches Table
-- ==========================================
-- Tracks the progress of bulk extraction operations

CREATE TABLE IF NOT EXISTS extraction_batches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

    -- File counts
    total_files int NOT NULL DEFAULT 0,
    processed_count int NOT NULL DEFAULT 0,
    success_count int NOT NULL DEFAULT 0,
    warning_count int NOT NULL DEFAULT 0,
    error_count int NOT NULL DEFAULT 0,

    -- Status tracking
    status text DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),

    -- User tracking
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- ==========================================
-- 3. Indexes for Performance
-- ==========================================

-- draft_jobs indexes
CREATE INDEX IF NOT EXISTS idx_draft_jobs_batch_id ON draft_jobs(batch_id);
CREATE INDEX IF NOT EXISTS idx_draft_jobs_status ON draft_jobs(extraction_status);
CREATE INDEX IF NOT EXISTS idx_draft_jobs_created_at ON draft_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_draft_jobs_tags ON draft_jobs USING GIN (tags);

-- extraction_batches indexes
CREATE INDEX IF NOT EXISTS idx_extraction_batches_status ON extraction_batches(status);
CREATE INDEX IF NOT EXISTS idx_extraction_batches_created_by ON extraction_batches(created_by);
CREATE INDEX IF NOT EXISTS idx_extraction_batches_created_at ON extraction_batches(created_at DESC);

-- ==========================================
-- 4. Row Level Security (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE draft_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_batches ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can manage draft_jobs" ON draft_jobs;
DROP POLICY IF EXISTS "Admins can manage extraction_batches" ON extraction_batches;

-- draft_jobs policies
CREATE POLICY "Admins can view draft_jobs" ON draft_jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can insert draft_jobs" ON draft_jobs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can update draft_jobs" ON draft_jobs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can delete draft_jobs" ON draft_jobs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- extraction_batches policies
CREATE POLICY "Admins can view extraction_batches" ON extraction_batches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can insert extraction_batches" ON extraction_batches
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can update extraction_batches" ON extraction_batches
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

CREATE POLICY "Admins can delete extraction_batches" ON extraction_batches
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- ==========================================
-- 5. Helper Functions
-- ==========================================

-- Function to update batch progress
CREATE OR REPLACE FUNCTION update_batch_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.batch_id IS NOT NULL THEN
        UPDATE extraction_batches
        SET
            processed_count = processed_count + 1,
            success_count = CASE WHEN NEW.extraction_status = 'success' THEN success_count + 1 ELSE success_count END,
            warning_count = CASE WHEN NEW.extraction_status = 'warning' THEN warning_count + 1 ELSE warning_count END,
            error_count = CASE WHEN NEW.extraction_status = 'error' THEN error_count + 1 ELSE error_count END
        WHERE id = NEW.batch_id;

        -- Check if all files are processed
        UPDATE extraction_batches
        SET
            status = CASE
                WHEN processed_count >= total_files THEN 'completed'
                ELSE 'processing'
            END,
            completed_at = CASE
                WHEN processed_count >= total_files THEN now()
                ELSE NULL
            END
        WHERE id = NEW.batch_id AND processed_count >= total_files;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update batch progress
DROP TRIGGER IF EXISTS trigger_update_batch_progress ON draft_jobs;
CREATE TRIGGER trigger_update_batch_progress
    AFTER INSERT OR UPDATE ON draft_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_batch_progress();

-- ==========================================
-- 6. Comments for Documentation
-- ==========================================

COMMENT ON TABLE draft_jobs IS 'AI抽出された求人データの一時保存テーブル。管理者の承認前に保存される。';
COMMENT ON TABLE extraction_batches IS '一括抽出処理のバッチ管理テーブル。進捗状況を追跡する。';

COMMENT ON COLUMN draft_jobs.batch_id IS '関連するextraction_batchesのID';
COMMENT ON COLUMN draft_jobs.extraction_status IS '抽出ステータス（success: 成功, warning: 要確認, error: エラー）';
COMMENT ON COLUMN draft_jobs.ai_confidence IS 'AI抽出の信頼度スコア（0-100）';
COMMENT ON COLUMN draft_jobs.source_file_url IS '元のPDF/画像ファイルのStorage URL';

COMMENT ON COLUMN extraction_batches.total_files IS 'アップロードされたファイル数';
COMMENT ON COLUMN extraction_batches.processed_count IS '処理完了したファイル数';
COMMENT ON COLUMN extraction_batches.status IS 'バッチのステータス（processing: 処理中, completed: 完了, failed: 失敗）';

-- ==========================================
-- 7. Verification Queries (for testing)
-- ==========================================

-- Check draft_jobs structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'draft_jobs'
-- ORDER BY ordinal_position;

-- Check extraction_batches structure
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'extraction_batches'
-- ORDER BY ordinal_position;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload config';
