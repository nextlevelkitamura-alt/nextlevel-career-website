-- =============================================================
-- Fix: workplace_access に含まれる駅名を nearest_station に移動
--
-- 旧AI後処理が代表1駅だけ nearest_station に入れ、
-- 残りを workplace_access に「駅名・駅名 いずれもアクセス可能」として
-- 格納していた問題を修正
-- =============================================================

-- 1. 「いずれもアクセス可能」パターンの修正
-- workplace_access = "馬喰横山駅・馬喰町駅・東日本橋駅 いずれもアクセス可能"
-- → nearest_station に全駅を改行区切りで移動、workplace_access をクリア
UPDATE jobs
SET
  nearest_station = regexp_replace(
    split_part(workplace_access, ' いずれもアクセス可能', 1),
    '・',
    E'\n',
    'g'
  ),
  workplace_access = NULL
WHERE workplace_access LIKE '%いずれもアクセス可能%';

-- 2. workplace_access に駅名リスト + 徒歩時間があるケース
-- 例: "馬喰横山、馬喰町、東日本橋、浅草橋、小伝馬町駅 徒歩5分"
-- → nearest_station に駅名を移動、workplace_access は徒歩時間のみ残す
-- ※ nearest_station が1駅のみの場合に限定
UPDATE jobs
SET
  nearest_station = regexp_replace(
    regexp_replace(
      split_part(workplace_access, ' 徒歩', 1),
      '、',
      E'\n',
      'g'
    ),
    '・',
    E'\n',
    'g'
  ),
  workplace_access = '徒歩' || split_part(workplace_access, ' 徒歩', 2)
WHERE workplace_access ~ '.+[、・].+徒歩[0-9]+分'
  AND nearest_station IS NOT NULL
  AND nearest_station NOT LIKE E'%\n%';
