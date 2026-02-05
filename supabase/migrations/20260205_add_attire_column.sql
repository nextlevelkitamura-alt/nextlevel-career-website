-- 服装・髪型（まとめ）カラムを追加
-- このカラムは、服装・髪型を一文で表現した文字列を保持します
-- 例: "オフィスカジュアル、ネイルOK", "私服OK", "制服貸与あり"

-- jobs テーブル
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS attire text;

-- draft_jobs テーブル
ALTER TABLE draft_jobs ADD COLUMN IF NOT EXISTS attire text;
