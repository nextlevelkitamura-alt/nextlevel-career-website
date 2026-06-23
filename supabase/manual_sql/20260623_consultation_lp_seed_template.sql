-- 日付選択型 相談求人LP 初期データ投入テンプレート
--
-- 使い方:
-- 1. TODO_* の予約URLを実際のURLに置き換える
-- 2. 下部の「日付投入例」「求人紐づけ例」を必要日付・求人IDに置き換えて実行する
-- 3. 求人IDは既存 jobs.id を使う。jobs 本体は変更しない

DO $$
DECLARE
  v_dispatch_route_id uuid;
  v_fulltime_route_id uuid;
  v_undecided_route_id uuid;
  v_dispatch_visit_url text := 'TODO_DISPATCH_VISIT_BOOKING_URL';
  v_fulltime_visit_url text := 'TODO_FULLTIME_VISIT_BOOKING_URL';
  v_fulltime_online_url text := 'TODO_FULLTIME_ONLINE_BOOKING_URL';
  v_undecided_visit_url text := 'TODO_UNDECIDED_VISIT_BOOKING_URL';
BEGIN
  IF v_dispatch_visit_url LIKE 'TODO_%'
    OR v_fulltime_visit_url LIKE 'TODO_%'
    OR v_fulltime_online_url LIKE 'TODO_%'
    OR v_undecided_visit_url LIKE 'TODO_%'
  THEN
    RAISE EXCEPTION 'TODO_* の予約URLを実際のURLに置き換えてから実行してください';
  END IF;

  INSERT INTO consultation_routes (
    slug,
    title,
    subtitle,
    description,
    target_employment_type,
    display_order,
    is_active
  )
  VALUES (
    'dispatch',
    '派遣で働きたい',
    '来社して対面で相談',
    '派遣求人を中心に、来社相談で働き方を確認します。',
    'dispatch',
    10,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    target_employment_type = EXCLUDED.target_employment_type,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active
  RETURNING id INTO v_dispatch_route_id;

  INSERT INTO consultation_routes (
    slug,
    title,
    subtitle,
    description,
    target_employment_type,
    display_order,
    is_active
  )
  VALUES (
    'fulltime',
    '正社員で相談',
    '来社・オンラインで相談',
    '正社員求人を中心に、来社またはオンラインで相談します。',
    'fulltime',
    20,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    target_employment_type = EXCLUDED.target_employment_type,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active
  RETURNING id INTO v_fulltime_route_id;

  INSERT INTO consultation_routes (
    slug,
    title,
    subtitle,
    description,
    target_employment_type,
    display_order,
    is_active
  )
  VALUES (
    'undecided',
    'まだ悩んでいる',
    '来社してじっくり相談',
    '派遣・正社員の両方を見ながら、働き方から相談します。',
    'mixed',
    30,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    target_employment_type = EXCLUDED.target_employment_type,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active
  RETURNING id INTO v_undecided_route_id;

  INSERT INTO consultation_booking_options (
    route_id,
    mode,
    label,
    booking_url,
    chips,
    is_default,
    is_active,
    display_order
  )
  VALUES (
    v_dispatch_route_id,
    'visit',
    '来社',
    v_dispatch_visit_url,
    ARRAY['派遣', '来社', '交通費支給'],
    true,
    true,
    10
  )
  ON CONFLICT (route_id, mode) DO UPDATE SET
    label = EXCLUDED.label,
    booking_url = EXCLUDED.booking_url,
    chips = EXCLUDED.chips,
    is_default = EXCLUDED.is_default,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order;

  INSERT INTO consultation_booking_options (
    route_id,
    mode,
    label,
    booking_url,
    chips,
    is_default,
    is_active,
    display_order
  )
  VALUES
    (
      v_fulltime_route_id,
      'visit',
      '来社',
      v_fulltime_visit_url,
      ARRAY['正社員', '来社', 'オンライン'],
      true,
      true,
      10
    ),
    (
      v_fulltime_route_id,
      'online',
      'オンライン',
      v_fulltime_online_url,
      ARRAY['正社員', '来社', 'オンライン'],
      false,
      true,
      20
    )
  ON CONFLICT (route_id, mode) DO UPDATE SET
    label = EXCLUDED.label,
    booking_url = EXCLUDED.booking_url,
    chips = EXCLUDED.chips,
    is_default = EXCLUDED.is_default,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order;

  INSERT INTO consultation_booking_options (
    route_id,
    mode,
    label,
    booking_url,
    chips,
    is_default,
    is_active,
    display_order
  )
  VALUES (
    v_undecided_route_id,
    'visit',
    '来社',
    v_undecided_visit_url,
    ARRAY['派遣・正社員', '来社', '働き方相談'],
    true,
    true,
    10
  )
  ON CONFLICT (route_id, mode) DO UPDATE SET
    label = EXCLUDED.label,
    booking_url = EXCLUDED.booking_url,
    chips = EXCLUDED.chips,
    is_default = EXCLUDED.is_default,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order;
END $$;

-- 日付投入例:
-- WITH target_option AS (
--   SELECT bo.id
--   FROM consultation_booking_options bo
--   JOIN consultation_routes r ON r.id = bo.route_id
--   WHERE r.slug = 'dispatch'
--     AND bo.mode = 'visit'
-- )
-- INSERT INTO consultation_available_dates (
--   booking_option_id,
--   available_date,
--   status,
--   display_order
-- )
-- SELECT id, DATE '2026-06-24', 'available', 10 FROM target_option
-- UNION ALL
-- SELECT id, DATE '2026-06-25', 'available', 20 FROM target_option
-- UNION ALL
-- SELECT id, DATE '2026-06-26', 'unavailable', 30 FROM target_option
-- ON CONFLICT (booking_option_id, available_date) DO UPDATE SET
--   status = EXCLUDED.status,
--   display_order = EXCLUDED.display_order;

-- 求人紐づけ例:
-- WITH target_date AS (
--   SELECT cad.id
--   FROM consultation_available_dates cad
--   JOIN consultation_booking_options bo ON bo.id = cad.booking_option_id
--   JOIN consultation_routes r ON r.id = bo.route_id
--   WHERE r.slug = 'dispatch'
--     AND bo.mode = 'visit'
--     AND cad.available_date = DATE '2026-06-24'
-- )
-- INSERT INTO consultation_date_jobs (
--   available_date_id,
--   job_id,
--   display_order,
--   highlight_label,
--   is_featured
-- )
-- SELECT target_date.id, job_ids.job_id, job_ids.display_order, job_ids.highlight_label, job_ids.is_featured
-- FROM target_date
-- CROSS JOIN (
--   VALUES
--     ('00000000-0000-0000-0000-000000000000'::uuid, 10, '来社相談で詳しく聞けます', true),
--     ('11111111-1111-1111-1111-111111111111'::uuid, 20, NULL, false)
-- ) AS job_ids(job_id, display_order, highlight_label, is_featured)
-- ON CONFLICT (available_date_id, job_id) DO UPDATE SET
--   display_order = EXCLUDED.display_order,
--   highlight_label = EXCLUDED.highlight_label,
--   is_featured = EXCLUDED.is_featured;
