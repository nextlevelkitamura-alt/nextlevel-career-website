-- =============================================================
-- 1. カテゴリ一覧取得用 RPC
-- 2. 検索ロジックをカテゴリ優先に修正
-- =============================================================

-- カテゴリ一覧取得: 有効な求人に存在するカテゴリのみ返す
CREATE OR REPLACE FUNCTION get_distinct_categories_rpc()
RETURNS TABLE (category text)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT unnest(j.category) AS category
  FROM jobs j
  WHERE j.category IS NOT NULL
    AND array_length(j.category, 1) > 0
    AND (j.expires_at IS NULL OR j.expires_at > now())
  ORDER BY category;
$$;

-- 検索ロジック修正: カテゴリ設定済みならカテゴリのみで判定
DROP FUNCTION IF EXISTS job_matches_search_category(text, text[], text, text, text);

CREATE OR REPLACE FUNCTION job_matches_search_category(
  p_category text,
  p_job_categories text[],
  p_job_category_detail text,
  p_job_title text,
  p_job_description text
)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  WITH normalized AS (
    SELECT normalize_job_search_category(p_category) AS c
  ),
  has_category AS (
    SELECT COALESCE(array_length(p_job_categories, 1), 0) > 0 AS val
  ),
  keywords AS (
    SELECT CASE (SELECT c FROM normalized)
      WHEN '事務' THEN ARRAY['事務','営業事務','一般事務','経理','総務','人事','労務','データ入力','秘書','受付']::text[]
      WHEN '営業' THEN ARRAY['営業','法人営業','個人営業','ルート営業','セールス','インサイドセールス','フィールドセールス']::text[]
      WHEN 'コールセンター' THEN ARRAY['コールセンター','テレオペ','受電','発信','問い合わせ対応','コンタクトセンター','カスタマーサポート']::text[]
      WHEN 'IT・エンジニア' THEN ARRAY['it','エンジニア','se','社内se','開発','プログラマ','プログラマー','インフラ','ネットワーク','ヘルプデスク']::text[]
      WHEN 'クリエイティブ' THEN ARRAY['クリエイティブ','デザイナー','webデザイナー','ui','ux','動画編集','ライター','ディレクター']::text[]
      WHEN '販売・接客' THEN ARRAY['販売','接客','店舗','ショップ','アパレル','レジ','ホール','サービススタッフ','カウンセラー']::text[]
      WHEN '製造・軽作業' THEN ARRAY['製造','軽作業','工場','ライン','倉庫','検品','梱包','仕分け','ピッキング','物流']::text[]
      WHEN '医療・介護' THEN ARRAY['医療','介護','看護','看護師','准看護師','病院','クリニック','ケア','ヘルパー','医療事務','歯科']::text[]
      WHEN 'リモート' THEN ARRAY['リモート','在宅','テレワーク','フルリモート']::text[]
      ELSE ARRAY[]::text[]
    END AS list
  )
  SELECT
    -- 検索カテゴリ未指定 → 全件ヒット
    (SELECT c FROM normalized) = ''
    -- 求人にカテゴリが設定されている → カテゴリの一致のみで判定
    OR (
      (SELECT val FROM has_category)
      AND (SELECT c FROM normalized) = ANY(
        SELECT lower(unnest) FROM unnest(COALESCE(p_job_categories, ARRAY[]::text[]))
      )
    )
    -- 求人にカテゴリが未設定 → キーワードフォールバック
    OR (
      NOT (SELECT val FROM has_category)
      AND EXISTS (
        SELECT 1
        FROM unnest((SELECT list FROM keywords)) AS keyword
        WHERE lower(
          COALESCE(p_job_category_detail, '') || ' ' ||
          COALESCE(p_job_title, '') || ' ' ||
          COALESCE(p_job_description, '')
        ) LIKE ('%' || lower(keyword) || '%')
      )
    );
$$;
