-- /consult-jobs: 正社員の対面相談枠を追加する。
-- 既存の正社員オンライン枠は維持し、正社員ルートでオンライン/対面を選べるようにする。

BEGIN;

ALTER TABLE consultation_available_dates
  ADD COLUMN IF NOT EXISTS booking_url text,
  ADD COLUMN IF NOT EXISTS slot_label text,
  ADD COLUMN IF NOT EXISTS slot_title text,
  ADD COLUMN IF NOT EXISTS slot_description text,
  ADD COLUMN IF NOT EXISTS slot_badge text,
  ADD COLUMN IF NOT EXISTS slots jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE consultation_routes
SET
  title = '正社員で働きたい',
  subtitle = 'オンライン・対面で相談',
  description = '正社員を目指す方向けに、オンラインと対面から選んで相談できます。'
WHERE slug = 'fulltime';

WITH option_seed(mode, label, booking_url, chips, is_default, is_active, display_order) AS (
  VALUES
    (
      'online',
      'オンライン',
      'https://www.e-nextlevel.jp/nativeapp/work/detail/6277195',
      ARRAY['正社員', 'オンライン']::text[],
      true,
      true,
      20
    ),
    (
      'visit',
      '対面',
      'https://www.e-nextlevel.jp/nativeapp/work/detail/6188425',
      ARRAY['正社員', '対面']::text[],
      false,
      true,
      10
    )
)
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
SELECT
  routes.id,
  seed.mode,
  seed.label,
  seed.booking_url,
  seed.chips,
  seed.is_default,
  seed.is_active,
  seed.display_order
FROM option_seed seed
JOIN consultation_routes routes ON routes.slug = 'fulltime'
ON CONFLICT (route_id, mode) DO UPDATE SET
  label = EXCLUDED.label,
  booking_url = EXCLUDED.booking_url,
  chips = EXCLUDED.chips,
  is_default = EXCLUDED.is_default,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

WITH requested_dates(available_date) AS (
  VALUES
    ('2026-06-29'::date),
    ('2026-06-30'::date),
    ('2026-07-01'::date),
    ('2026-07-02'::date),
    ('2026-07-03'::date),
    ('2026-07-06'::date),
    ('2026-07-07'::date),
    ('2026-07-08'::date),
    ('2026-07-09'::date),
    ('2026-07-10'::date),
    ('2026-07-13'::date),
    ('2026-07-14'::date),
    ('2026-07-15'::date),
    ('2026-07-16'::date),
    ('2026-07-17'::date),
    ('2026-07-20'::date),
    ('2026-07-21'::date),
    ('2026-07-22'::date),
    ('2026-07-23'::date),
    ('2026-07-24'::date),
    ('2026-07-27'::date),
    ('2026-07-28'::date),
    ('2026-07-29'::date),
    ('2026-07-30'::date),
    ('2026-07-31'::date)
)
UPDATE consultation_available_dates dates
SET
  status = 'unavailable',
  note = '対象外の日付です',
  booking_url = NULL,
  slot_label = NULL,
  slot_title = NULL,
  slot_description = NULL,
  slot_badge = NULL,
  slots = '[]'::jsonb
FROM consultation_booking_options options
JOIN consultation_routes routes ON routes.id = options.route_id
WHERE dates.booking_option_id = options.id
  AND routes.slug = 'fulltime'
  AND options.mode = 'visit'
  AND dates.available_date NOT IN (SELECT available_date FROM requested_dates);

WITH slot_seed(available_date, work_11_id, work_13_id, display_order) AS (
  VALUES
    ('2026-06-29'::date, '6188425', '6188841', 10),
    ('2026-06-30'::date, '6188426', '6188842', 20),
    ('2026-07-01'::date, '6288421', '6288468', 30),
    ('2026-07-02'::date, '6288422', '6288469', 40),
    ('2026-07-03'::date, '6288423', '6288470', 50),
    ('2026-07-06'::date, '6288424', '6288471', 60),
    ('2026-07-07'::date, '6288425', '6288472', 70),
    ('2026-07-08'::date, '6288426', '6288473', 80),
    ('2026-07-09'::date, '6288427', '6288474', 90),
    ('2026-07-10'::date, '6288428', '6288475', 100),
    ('2026-07-13'::date, '6288429', '6288476', 110),
    ('2026-07-14'::date, '6288430', '6288477', 120),
    ('2026-07-15'::date, '6288431', '6288478', 130),
    ('2026-07-16'::date, '6288432', '6288479', 140),
    ('2026-07-17'::date, '6288433', '6288480', 150),
    ('2026-07-20'::date, '6288434', '6288481', 160),
    ('2026-07-21'::date, '6288435', '6288482', 170),
    ('2026-07-22'::date, '6288436', '6288483', 180),
    ('2026-07-23'::date, '6288437', '6288484', 190),
    ('2026-07-24'::date, '6288438', '6288485', 200),
    ('2026-07-27'::date, '6288439', '6288486', 210),
    ('2026-07-28'::date, '6288440', '6288487', 220),
    ('2026-07-29'::date, '6288441', '6288488', 230),
    ('2026-07-30'::date, '6288442', '6288489', 240),
    ('2026-07-31'::date, '6288443', '6288490', 250)
), date_seed AS (
  SELECT
    options.id AS booking_option_id,
    seed.available_date,
    'https://www.e-nextlevel.jp/nativeapp/work/detail/' || seed.work_11_id AS booking_url,
    '11:00' AS slot_label,
    '正社員の対面相談' AS slot_title,
    '対面で就職支援の面談を予約したい方' AS slot_description,
    '対面' AS slot_badge,
    jsonb_build_array(
      jsonb_build_object(
        'label',
        '11:00',
        'url',
        'https://www.e-nextlevel.jp/nativeapp/work/detail/' || seed.work_11_id
      ),
      jsonb_build_object(
        'label',
        '13:00',
        'url',
        'https://www.e-nextlevel.jp/nativeapp/work/detail/' || seed.work_13_id
      )
    ) AS slots,
    seed.display_order
  FROM slot_seed seed
  JOIN consultation_routes routes ON routes.slug = 'fulltime'
  JOIN consultation_booking_options options
    ON options.route_id = routes.id
   AND options.mode = 'visit'
)
INSERT INTO consultation_available_dates (
  booking_option_id,
  available_date,
  status,
  note,
  booking_url,
  slot_label,
  slot_title,
  slot_description,
  slot_badge,
  slots,
  display_order
)
SELECT
  booking_option_id,
  available_date,
  'available',
  NULL,
  booking_url,
  slot_label,
  slot_title,
  slot_description,
  slot_badge,
  slots,
  display_order
FROM date_seed
ON CONFLICT (booking_option_id, available_date) DO UPDATE SET
  status = EXCLUDED.status,
  note = EXCLUDED.note,
  booking_url = EXCLUDED.booking_url,
  slot_label = EXCLUDED.slot_label,
  slot_title = EXCLUDED.slot_title,
  slot_description = EXCLUDED.slot_description,
  slot_badge = EXCLUDED.slot_badge,
  slots = EXCLUDED.slots,
  display_order = EXCLUDED.display_order;

COMMIT;
