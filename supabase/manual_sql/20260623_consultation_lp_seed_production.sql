-- スキマ面談LP: 3ルート表示と日付別の複数予約枠
-- 既存 jobs は変更しない。/consult-jobs 用の相談ルート・日付別予約URLだけを更新する。

ALTER TABLE consultation_available_dates
  ADD COLUMN IF NOT EXISTS booking_url text,
  ADD COLUMN IF NOT EXISTS slot_label text,
  ADD COLUMN IF NOT EXISTS slot_title text,
  ADD COLUMN IF NOT EXISTS slot_description text,
  ADD COLUMN IF NOT EXISTS slot_badge text,
  ADD COLUMN IF NOT EXISTS slots jsonb NOT NULL DEFAULT '[]'::jsonb;

DO $$
DECLARE
  v_dispatch_route_id uuid;
  v_fulltime_route_id uuid;
  v_undecided_route_id uuid;
  v_dispatch_option_id uuid;
  v_fulltime_online_option_id uuid;
  v_undecided_option_id uuid;
  v_fulltime_online_url text := 'https://cal.com/career-nextlevel-j2gviw/sodan?theme=light&locale=ja&metadata[entryPoint]=consult-jobs';
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
      '派遣や長期の働き方を、来社相談で確認します。',
      'dispatch',
      10,
      true
    ),
    (
      'fulltime',
      '正社員で相談',
      'オンラインで相談',
      '正社員を目指す方向けに、オンラインで相談できます。',
      'fulltime',
      20,
      true
    ),
    (
      'undecided',
      'まだ悩んでいる',
      '来社してじっくり相談',
      '派遣か正社員か迷っている方向けに、働き方を整理します。',
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

  SELECT id INTO v_dispatch_route_id FROM consultation_routes WHERE slug = 'dispatch';
  SELECT id INTO v_fulltime_route_id FROM consultation_routes WHERE slug = 'fulltime';
  SELECT id INTO v_undecided_route_id FROM consultation_routes WHERE slug = 'undecided';

  UPDATE consultation_booking_options
  SET is_active = false,
      is_default = false
  WHERE route_id IN (v_dispatch_route_id, v_fulltime_route_id, v_undecided_route_id);

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
      v_dispatch_route_id,
      'visit',
      '来社',
      'https://www.e-nextlevel.jp/nativeapp/work/detail/6188422',
      ARRAY['派遣', '来社', '交通費支給']::text[],
      true,
      true,
      10
    ),
    (
      v_fulltime_route_id,
      'online',
      'オンライン',
      v_fulltime_online_url,
      ARRAY['正社員', 'オンライン']::text[],
      true,
      true,
      10
    ),
    (
      v_undecided_route_id,
      'visit',
      '来社',
      'https://www.e-nextlevel.jp/nativeapp/work/detail/6188884',
      ARRAY['派遣・正社員', '来社', '働き方相談']::text[],
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

  SELECT id INTO v_dispatch_option_id
  FROM consultation_booking_options
  WHERE route_id = v_dispatch_route_id
    AND mode = 'visit';

  SELECT id INTO v_fulltime_online_option_id
  FROM consultation_booking_options
  WHERE route_id = v_fulltime_route_id
    AND mode = 'online';

  SELECT id INTO v_undecided_option_id
  FROM consultation_booking_options
  WHERE route_id = v_undecided_route_id
    AND mode = 'visit';

  UPDATE consultation_available_dates
  SET status = 'unavailable',
      note = '対象外の日付です',
      booking_url = NULL,
      slot_label = NULL,
      slot_title = NULL,
      slot_description = NULL,
      slot_badge = NULL,
      slots = '[]'::jsonb
  WHERE booking_option_id IN (v_dispatch_option_id, v_fulltime_online_option_id, v_undecided_option_id);

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
    v_dispatch_option_id,
    seed.available_date,
    'available',
    NULL,
    seed.booking_url,
    '11:00',
    '派遣の働き方を相談',
    '新宿で直接相談したい方',
    '来社',
    jsonb_build_array(jsonb_build_object('label', '11:00', 'url', seed.booking_url)),
    seed.display_order
  FROM (
    VALUES
      ('2026-06-24'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6188422', 10),
      ('2026-06-25'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6188423', 20),
      ('2026-06-26'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6188424', 30),
      ('2026-06-29'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6188425', 40),
      ('2026-06-30'::date, 'https://www.e-nextlevel.jp/nativeapp/work/detail/6188426', 50)
  ) AS seed(available_date, booking_url, display_order)
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
    v_fulltime_online_option_id,
    seed.available_date,
    'available',
    NULL,
    v_fulltime_online_url,
    'オンライン予約',
    '正社員の働き方を相談',
    'オンラインで相談したい方',
    'オンライン',
    jsonb_build_array(jsonb_build_object('label', 'オンライン予約', 'url', v_fulltime_online_url)),
    seed.display_order
  FROM (
    VALUES
      ('2026-06-24'::date, 10),
      ('2026-06-25'::date, 20),
      ('2026-06-26'::date, 30),
      ('2026-06-29'::date, 40),
      ('2026-06-30'::date, 50)
  ) AS seed(available_date, display_order)
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
    v_undecided_option_id,
    seed.available_date,
    'available',
    NULL,
    seed.first_url,
    '11:00',
    '働き方を相談',
    '就職や派遣を迷っている方',
    '来社',
    seed.slots,
    seed.display_order
  FROM (
    VALUES
      (
        '2026-06-24'::date,
        'https://www.e-nextlevel.jp/nativeapp/work/detail/6188884',
        '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6188884"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6188906"}]'::jsonb,
        10
      ),
      (
        '2026-06-25'::date,
        'https://www.e-nextlevel.jp/nativeapp/work/detail/6188885',
        '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6188885"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6188907"}]'::jsonb,
        20
      ),
      (
        '2026-06-26'::date,
        'https://www.e-nextlevel.jp/nativeapp/work/detail/6188886',
        '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6188886"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6188908"}]'::jsonb,
        30
      ),
      (
        '2026-06-29'::date,
        'https://www.e-nextlevel.jp/nativeapp/work/detail/6188887',
        '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6188887"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6188909"}]'::jsonb,
        40
      ),
      (
        '2026-06-30'::date,
        'https://www.e-nextlevel.jp/nativeapp/work/detail/6188888',
        '[{"label":"11:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6188888"},{"label":"13:00","url":"https://www.e-nextlevel.jp/nativeapp/work/detail/6188910"}]'::jsonb,
        50
      )
  ) AS seed(available_date, first_url, slots, display_order)
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
    option_id,
    weekend_date,
    'unavailable',
    '土日は選択できません',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '[]'::jsonb,
    display_order
  FROM (
    VALUES
      (v_dispatch_option_id, '2026-06-27'::date, 60),
      (v_dispatch_option_id, '2026-06-28'::date, 70),
      (v_fulltime_online_option_id, '2026-06-27'::date, 60),
      (v_fulltime_online_option_id, '2026-06-28'::date, 70),
      (v_undecided_option_id, '2026-06-27'::date, 60),
      (v_undecided_option_id, '2026-06-28'::date, 70)
  ) AS seed(option_id, weekend_date, display_order)
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
END $$;
