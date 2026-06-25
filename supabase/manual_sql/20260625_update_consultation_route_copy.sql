-- /consult-jobs route labels and slot copy alignment.
-- Keeps existing dates, booking URLs, and job links unchanged.

BEGIN;

WITH route_copy(slug, title) AS (
  VALUES
    ('dispatch', '派遣で働きたい'),
    ('fulltime', '正社員で働きたい'),
    ('undecided', '働き方を相談したい')
)
UPDATE consultation_routes routes
SET title = route_copy.title
FROM route_copy
WHERE routes.slug = route_copy.slug;

WITH slot_copy(route_slug, slot_title, slot_description) AS (
  VALUES
    ('dispatch', '派遣の働き方の相談', '対面で仕事条件を確認したい方'),
    ('fulltime', '正社員の働き方の相談', 'オンラインで就職支援の面談を予約したい方'),
    ('undecided', '自分に合う働き方の相談', '派遣か正社員か迷っている方')
)
UPDATE consultation_available_dates dates
SET
  slot_title = slot_copy.slot_title,
  slot_description = slot_copy.slot_description
FROM consultation_booking_options options
JOIN consultation_routes routes ON routes.id = options.route_id
JOIN slot_copy ON slot_copy.route_slug = routes.slug
WHERE dates.booking_option_id = options.id;

COMMIT;
