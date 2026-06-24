-- スキマ面談LP: 2026年7月末までのアプリ遷移予約枠
-- 既存 jobs は変更しない。/consult-jobs 用の相談ルート・日付別予約URLだけを更新する。

BEGIN;

ALTER TABLE consultation_available_dates
  ADD COLUMN IF NOT EXISTS booking_url text,
  ADD COLUMN IF NOT EXISTS slot_label text,
  ADD COLUMN IF NOT EXISTS slot_title text,
  ADD COLUMN IF NOT EXISTS slot_description text,
  ADD COLUMN IF NOT EXISTS slot_badge text,
  ADD COLUMN IF NOT EXISTS slots jsonb NOT NULL DEFAULT '[]'::jsonb;

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
    ('dispatch', '派遣で働きたい', '対面で働き方を相談', '派遣や長期の働き方を、対面相談で確認します。', 'dispatch', 10, true),
    ('fulltime', '正社員で相談', 'オンラインで相談', '正社員を目指す方向けに、オンラインで相談できます。', 'fulltime', 20, true),
    ('undecided', 'まだ悩んでいる', '対面でじっくり相談', '派遣か正社員か迷っている方向けに、働き方を整理します。', 'mixed', 30, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  target_employment_type = EXCLUDED.target_employment_type,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

UPDATE consultation_booking_options
SET is_active = false,
    is_default = false
WHERE route_id IN (
  SELECT id FROM consultation_routes WHERE slug IN ('dispatch', 'fulltime', 'undecided')
);

WITH option_seed(route_slug, mode, label, booking_url, chips, is_default, is_active, display_order) AS (
  VALUES
    ('dispatch', 'visit', '対面', 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277233', ARRAY['派遣', '交通費支給']::text[], true, true, 10),
    ('fulltime', 'online', 'オンライン', 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277195', ARRAY['正社員', 'オンライン']::text[], true, true, 10),
    ('undecided', 'visit', '対面', 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277021', ARRAY['派遣・正社員', '働き方相談']::text[], true, true, 10)
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
JOIN consultation_routes routes ON routes.slug = seed.route_slug
ON CONFLICT (route_id, mode) DO UPDATE SET
  label = EXCLUDED.label,
  booking_url = EXCLUDED.booking_url,
  chips = EXCLUDED.chips,
  is_default = EXCLUDED.is_default,
  is_active = EXCLUDED.is_active,
  display_order = EXCLUDED.display_order;

UPDATE consultation_available_dates
SET status = 'unavailable',
    note = '対象外の日付です',
    booking_url = NULL,
    slot_label = NULL,
    slot_title = NULL,
    slot_description = NULL,
    slot_badge = NULL,
    slots = '[]'::jsonb
WHERE booking_option_id IN (
  SELECT options.id
  FROM consultation_booking_options options
  JOIN consultation_routes routes ON routes.id = options.route_id
  WHERE routes.slug IN ('dispatch', 'fulltime', 'undecided')
);

WITH slot_seed(
  route_slug,
  mode,
  available_date,
  booking_url,
  slot_label,
  slot_title,
  slot_description,
  slot_badge,
  slots,
  display_order
) AS (
  VALUES
    ('dispatch', 'visit', '2026-06-24'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277233', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277233"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277240"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277248"}]'::jsonb, 10),
    ('dispatch', 'visit', '2026-06-25'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277234', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277234"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277241"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277249"}]'::jsonb, 20),
    ('dispatch', 'visit', '2026-06-26'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277235', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277235"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277242"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277250"}]'::jsonb, 30),
    ('dispatch', 'visit', '2026-06-29'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277236', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277236"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277243"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277252"}]'::jsonb, 40),
    ('dispatch', 'visit', '2026-06-30'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277237', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277237"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277244"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277253"}]'::jsonb, 50),
    ('dispatch', 'visit', '2026-07-01'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277600', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277600"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277643"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277753"}]'::jsonb, 60),
    ('dispatch', 'visit', '2026-07-02'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277601', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277601"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277644"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277754"}]'::jsonb, 70),
    ('dispatch', 'visit', '2026-07-03'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277602', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277602"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277645"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277755"}]'::jsonb, 80),
    ('dispatch', 'visit', '2026-07-06'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277603', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277603"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277646"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277756"}]'::jsonb, 90),
    ('dispatch', 'visit', '2026-07-07'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277604', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277604"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277647"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277757"}]'::jsonb, 100),
    ('dispatch', 'visit', '2026-07-08'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277605', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277605"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277648"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277758"}]'::jsonb, 110),
    ('dispatch', 'visit', '2026-07-09'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277606', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277606"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277649"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277759"}]'::jsonb, 120),
    ('dispatch', 'visit', '2026-07-10'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277607', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277607"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277650"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277760"}]'::jsonb, 130),
    ('dispatch', 'visit', '2026-07-13'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277608', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277608"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277651"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277761"}]'::jsonb, 140),
    ('dispatch', 'visit', '2026-07-14'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277609', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277609"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277652"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277762"}]'::jsonb, 150),
    ('dispatch', 'visit', '2026-07-15'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277610', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277610"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277653"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277763"}]'::jsonb, 160),
    ('dispatch', 'visit', '2026-07-16'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277611', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277611"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277654"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277764"}]'::jsonb, 170),
    ('dispatch', 'visit', '2026-07-17'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277612', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277612"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277655"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277765"}]'::jsonb, 180),
    ('dispatch', 'visit', '2026-07-21'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277613', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277613"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277656"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277766"}]'::jsonb, 190),
    ('dispatch', 'visit', '2026-07-22'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277614', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277614"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277657"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277767"}]'::jsonb, 200),
    ('dispatch', 'visit', '2026-07-23'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277615', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277615"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277658"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277768"}]'::jsonb, 210),
    ('dispatch', 'visit', '2026-07-24'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277616', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277616"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277659"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277769"}]'::jsonb, 220),
    ('dispatch', 'visit', '2026-07-27'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277617', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277617"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277660"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277770"}]'::jsonb, 230),
    ('dispatch', 'visit', '2026-07-28'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277618', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277618"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277661"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277771"}]'::jsonb, 240),
    ('dispatch', 'visit', '2026-07-29'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277619', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277619"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277662"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277772"}]'::jsonb, 250),
    ('dispatch', 'visit', '2026-07-30'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277620', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277620"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277663"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277773"}]'::jsonb, 260),
    ('dispatch', 'visit', '2026-07-31'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277621', '11:00', '派遣の働き方を相談', '対面で仕事条件を確認したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277621"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277665"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277774"}]'::jsonb, 270),
    ('fulltime', 'online', '2026-06-24'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277195', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277195"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277202"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277224"}]'::jsonb, 10),
    ('fulltime', 'online', '2026-06-25'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277196', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277196"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277203"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277225"}]'::jsonb, 20),
    ('fulltime', 'online', '2026-06-26'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277197', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277197"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277204"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277226"}]'::jsonb, 30),
    ('fulltime', 'online', '2026-06-29'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277198', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277198"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277205"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277227"}]'::jsonb, 40),
    ('fulltime', 'online', '2026-06-30'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277199', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277199"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277206"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277228"}]'::jsonb, 50),
    ('fulltime', 'online', '2026-07-01'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277485', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277485"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277530"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277577"}]'::jsonb, 60),
    ('fulltime', 'online', '2026-07-02'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277486', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277486"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277531"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277578"}]'::jsonb, 70),
    ('fulltime', 'online', '2026-07-03'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277487', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277487"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277532"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277579"}]'::jsonb, 80),
    ('fulltime', 'online', '2026-07-06'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277488', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277488"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277533"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277580"}]'::jsonb, 90),
    ('fulltime', 'online', '2026-07-07'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277489', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277489"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277534"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277581"}]'::jsonb, 100),
    ('fulltime', 'online', '2026-07-08'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277490', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277490"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277535"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277582"}]'::jsonb, 110),
    ('fulltime', 'online', '2026-07-09'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277491', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277491"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277536"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277583"}]'::jsonb, 120),
    ('fulltime', 'online', '2026-07-10'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277492', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277492"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277537"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277584"}]'::jsonb, 130),
    ('fulltime', 'online', '2026-07-13'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277493', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277493"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277538"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277585"}]'::jsonb, 140),
    ('fulltime', 'online', '2026-07-14'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277494', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277494"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277539"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277586"}]'::jsonb, 150),
    ('fulltime', 'online', '2026-07-15'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277495', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277495"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277540"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277587"}]'::jsonb, 160),
    ('fulltime', 'online', '2026-07-16'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277496', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277496"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277541"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277588"}]'::jsonb, 170),
    ('fulltime', 'online', '2026-07-17'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277497', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277497"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277542"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277589"}]'::jsonb, 180),
    ('fulltime', 'online', '2026-07-21'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277498', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277498"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277543"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277590"}]'::jsonb, 190),
    ('fulltime', 'online', '2026-07-22'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277499', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277499"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277544"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277591"}]'::jsonb, 200),
    ('fulltime', 'online', '2026-07-23'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277500', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277500"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277545"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277592"}]'::jsonb, 210),
    ('fulltime', 'online', '2026-07-24'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277501', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277501"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277546"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277593"}]'::jsonb, 220),
    ('fulltime', 'online', '2026-07-27'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277502', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277502"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277547"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277594"}]'::jsonb, 230),
    ('fulltime', 'online', '2026-07-28'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277503', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277503"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277548"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277595"}]'::jsonb, 240),
    ('fulltime', 'online', '2026-07-29'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277504', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277504"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277549"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277596"}]'::jsonb, 250),
    ('fulltime', 'online', '2026-07-30'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277505', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277505"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277550"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277597"}]'::jsonb, 260),
    ('fulltime', 'online', '2026-07-31'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277506', '11:00', '正社員の働き方を相談', 'オンラインで就職支援の面談を予約したい方', 'オンライン', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277506"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277551"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277598"}]'::jsonb, 270),
    ('undecided', 'visit', '2026-06-24'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277021', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277021"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277045"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277187"}]'::jsonb, 10),
    ('undecided', 'visit', '2026-06-25'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277022', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277022"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277046"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277188"}]'::jsonb, 20),
    ('undecided', 'visit', '2026-06-26'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277023', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277023"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277047"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277189"}]'::jsonb, 30),
    ('undecided', 'visit', '2026-06-29'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277024', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277024"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277048"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277190"}]'::jsonb, 40),
    ('undecided', 'visit', '2026-06-30'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277025', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277025"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277049"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277191"}]'::jsonb, 50),
    ('undecided', 'visit', '2026-07-01'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277368', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277368"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277394"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277442"}]'::jsonb, 60),
    ('undecided', 'visit', '2026-07-02'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277369', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277369"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277395"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277443"}]'::jsonb, 70),
    ('undecided', 'visit', '2026-07-03'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277370', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277370"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277396"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277444"}]'::jsonb, 80),
    ('undecided', 'visit', '2026-07-06'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277371', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277371"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277397"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277445"}]'::jsonb, 90),
    ('undecided', 'visit', '2026-07-07'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277372', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277372"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277398"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277446"}]'::jsonb, 100),
    ('undecided', 'visit', '2026-07-08'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277373', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277373"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277399"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277447"}]'::jsonb, 110),
    ('undecided', 'visit', '2026-07-09'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277374', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277374"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277400"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277448"}]'::jsonb, 120),
    ('undecided', 'visit', '2026-07-10'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277375', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277375"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277401"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277449"}]'::jsonb, 130),
    ('undecided', 'visit', '2026-07-13'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277376', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277376"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277402"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277450"}]'::jsonb, 140),
    ('undecided', 'visit', '2026-07-14'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277377', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277377"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277403"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277451"}]'::jsonb, 150),
    ('undecided', 'visit', '2026-07-15'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277378', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277378"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277404"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277452"}]'::jsonb, 160),
    ('undecided', 'visit', '2026-07-16'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277379', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277379"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277405"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277453"}]'::jsonb, 170),
    ('undecided', 'visit', '2026-07-17'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277380', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277380"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277406"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277454"}]'::jsonb, 180),
    ('undecided', 'visit', '2026-07-21'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277381', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277381"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277407"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277455"}]'::jsonb, 190),
    ('undecided', 'visit', '2026-07-22'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277382', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277382"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277408"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277456"}]'::jsonb, 200),
    ('undecided', 'visit', '2026-07-23'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277383', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277383"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277409"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277457"}]'::jsonb, 210),
    ('undecided', 'visit', '2026-07-24'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277384', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277384"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277410"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277458"}]'::jsonb, 220),
    ('undecided', 'visit', '2026-07-27'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277385', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277385"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277411"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277459"}]'::jsonb, 230),
    ('undecided', 'visit', '2026-07-28'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277386', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277386"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277412"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277460"}]'::jsonb, 240),
    ('undecided', 'visit', '2026-07-29'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277387', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277387"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277413"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277461"}]'::jsonb, 250),
    ('undecided', 'visit', '2026-07-30'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277388', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277388"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277414"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277462"}]'::jsonb, 260),
    ('undecided', 'visit', '2026-07-31'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6277389', '11:00', '働き方を相談', 'どちらが合うか直接相談したい方', '対面', '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277389"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277415"},{"label":"15:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6277463"}]'::jsonb, 270)
), date_seed AS (
  SELECT
    options.id AS booking_option_id,
    seed.available_date,
    seed.booking_url,
    seed.slot_label,
    seed.slot_title,
    seed.slot_description,
    seed.slot_badge,
    seed.slots,
    seed.display_order
  FROM slot_seed seed
  JOIN consultation_routes routes ON routes.slug = seed.route_slug
  JOIN consultation_booking_options options
    ON options.route_id = routes.id
   AND options.mode = seed.mode
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
