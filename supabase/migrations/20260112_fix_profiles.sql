-- profilesテーブルにupdated_atカラムがない場合は追加する
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;

-- スキーマキャッシュを強制的にリロード（変更が反映されない場合の対処）
NOTIFY pgrst, 'reload config';
