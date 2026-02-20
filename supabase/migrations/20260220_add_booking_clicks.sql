-- ボタンクリック集計テーブル（応募する/相談するのクリック追跡）
CREATE TABLE IF NOT EXISTS booking_clicks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
    click_type text NOT NULL CHECK (click_type IN ('apply', 'consult')),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    clicked_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE booking_clicks ENABLE ROW LEVEL SECURITY;

-- 誰でも挿入可能（未ログインユーザーのクリックも記録する）
CREATE POLICY "Anyone can insert booking clicks"
    ON booking_clicks FOR INSERT
    WITH CHECK (true);

-- 一般ユーザーは参照不可（集計はサービスロール経由で行う）
-- 管理画面からの参照は service_role キーを使用すること
