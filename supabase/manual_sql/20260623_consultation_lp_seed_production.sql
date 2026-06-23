-- 日付選択型 相談求人LP 本番初期データ
-- 既存 jobs から表示用求人を自動で拾い、直近の平日だけを選択可能日にする。

DO $$
DECLARE
  v_booking_url text := 'https://cal.com/career-nextlevel-j2gviw/sodan?theme=light&locale=ja&metadata[entryPoint]=consult-jobs';
BEGIN
  INSERT INTO consultation_routes (
    slug,
    title,
    subtitle,
    description,
    target_employment_type,
    display_order,
    is_active
  )
  VALUES
    (
      'dispatch',
      '派遣で働きたい',
      '来社して対面で相談',
      '派遣求人を中心に、来社相談で働き方を確認します。',
      'dispatch',
      10,
      true
    ),
    (
      'fulltime',
      '正社員で相談',
      '来社・オンラインで相談',
      '正社員求人を中心に、来社またはオンラインで相談します。',
      'fulltime',
      20,
      true
    ),
    (
      'undecided',
      'まだ悩んでいる',
      '働き方から相談',
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
    is_active = EXCLUDED.is_active;

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
  SELECT r.id, seed.mode, seed.label, v_booking_url, seed.chips, seed.is_default, true, seed.display_order
  FROM consultation_routes r
  JOIN (
    VALUES
      ('dispatch', 'visit', '来社', ARRAY['派遣', '来社', '交通費支給']::text[], true, 10),
      ('fulltime', 'visit', '来社', ARRAY['正社員', '来社', 'オンライン']::text[], true, 10),
      ('fulltime', 'online', 'オンライン', ARRAY['正社員', '来社', 'オンライン']::text[], false, 20),
      ('undecided', 'visit', '来社', ARRAY['派遣・正社員', '来社', '働き方相談']::text[], true, 10)
  ) AS seed(route_slug, mode, label, chips, is_default, display_order)
    ON seed.route_slug = r.slug
  ON CONFLICT (route_id, mode) DO UPDATE SET
    label = EXCLUDED.label,
    booking_url = EXCLUDED.booking_url,
    chips = EXCLUDED.chips,
    is_default = EXCLUDED.is_default,
    is_active = EXCLUDED.is_active,
    display_order = EXCLUDED.display_order;

  WITH weekdays AS (
    SELECT day::date AS available_date,
           row_number() OVER (ORDER BY day) * 10 AS display_order
    FROM generate_series(
      ((now() AT TIME ZONE 'Asia/Tokyo')::date + 1),
      ((now() AT TIME ZONE 'Asia/Tokyo')::date + 21),
      interval '1 day'
    ) AS day
    WHERE extract(isodow FROM day) BETWEEN 1 AND 5
    LIMIT 12
  )
  INSERT INTO consultation_available_dates (
    booking_option_id,
    available_date,
    status,
    display_order
  )
  SELECT bo.id, weekdays.available_date, 'available', weekdays.display_order
  FROM consultation_booking_options bo
  CROSS JOIN weekdays
  WHERE bo.is_active = true
  ON CONFLICT (booking_option_id, available_date) DO UPDATE SET
    status = EXCLUDED.status,
    display_order = EXCLUDED.display_order;

  WITH dispatch_jobs AS (
    SELECT id, row_number() OVER (ORDER BY created_at DESC NULLS LAST, id) AS display_order
    FROM jobs
    WHERE type ILIKE '%派遣%'
       OR employment_type = 'dispatch'
    ORDER BY created_at DESC NULLS LAST, id
    LIMIT 4
  ),
  fulltime_jobs AS (
    SELECT id, row_number() OVER (ORDER BY created_at DESC NULLS LAST, id) AS display_order
    FROM jobs
    WHERE type ILIKE '%正社員%'
       OR employment_type = 'fulltime'
    ORDER BY created_at DESC NULLS LAST, id
    LIMIT 4
  ),
  mixed_jobs AS (
    SELECT id, display_order FROM (
      SELECT id, row_number() OVER (ORDER BY created_at DESC NULLS LAST, id) AS display_order
      FROM jobs
      WHERE type ILIKE '%派遣%'
         OR employment_type = 'dispatch'
      ORDER BY created_at DESC NULLS LAST, id
      LIMIT 2
    ) d
    UNION ALL
    SELECT id, display_order + 2 FROM (
      SELECT id, row_number() OVER (ORDER BY created_at DESC NULLS LAST, id) AS display_order
      FROM jobs
      WHERE type ILIKE '%正社員%'
         OR employment_type = 'fulltime'
      ORDER BY created_at DESC NULLS LAST, id
      LIMIT 2
    ) f
  ),
  route_jobs AS (
    SELECT 'dispatch'::text AS route_slug, id, display_order FROM dispatch_jobs
    UNION ALL
    SELECT 'fulltime'::text AS route_slug, id, display_order FROM fulltime_jobs
    UNION ALL
    SELECT 'undecided'::text AS route_slug, id, display_order FROM mixed_jobs
  ),
  target_dates AS (
    SELECT cad.id AS available_date_id,
           r.slug AS route_slug
    FROM consultation_available_dates cad
    JOIN consultation_booking_options bo ON bo.id = cad.booking_option_id
    JOIN consultation_routes r ON r.id = bo.route_id
    WHERE cad.status = 'available'
      AND bo.is_active = true
      AND r.is_active = true
  )
  INSERT INTO consultation_date_jobs (
    available_date_id,
    job_id,
    display_order,
    highlight_label,
    is_featured
  )
  SELECT target_dates.available_date_id,
         route_jobs.id,
         route_jobs.display_order * 10,
         CASE
           WHEN route_jobs.display_order = 1 THEN '面談で詳しく聞けます'
           ELSE NULL
         END,
         route_jobs.display_order = 1
  FROM target_dates
  JOIN route_jobs ON route_jobs.route_slug = target_dates.route_slug
  ON CONFLICT (available_date_id, job_id) DO UPDATE SET
    display_order = EXCLUDED.display_order,
    highlight_label = EXCLUDED.highlight_label,
    is_featured = EXCLUDED.is_featured;
END $$;
