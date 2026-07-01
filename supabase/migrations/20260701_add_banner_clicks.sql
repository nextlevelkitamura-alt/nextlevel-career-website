-- バナー単位のクリック計測
-- トップのバナー(banners)ごとのクリックを記録する。
-- 集計は 1000 行上限(PostgREST Max Rows)を避けるため、必ず GROUP BY の RPC 経由で行う。

CREATE TABLE IF NOT EXISTS public.banner_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id uuid REFERENCES public.banners(id) ON DELETE SET NULL,
  banner_title text,                         -- クリック時点の名前スナップショット（バナー削除後も履歴を残す）
  clicked_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash text,
  user_agent text,
  is_bot boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS banner_clicks_banner_id_clicked_at_idx
  ON public.banner_clicks (banner_id, clicked_at DESC);

CREATE INDEX IF NOT EXISTS banner_clicks_clicked_at_idx
  ON public.banner_clicks (clicked_at DESC);

ALTER TABLE public.banner_clicks ENABLE ROW LEVEL SECURITY;

-- 誰でも（匿名含む）自分のクリックを記録できる。consultation_lp_clicks と同じ方針。
DROP POLICY IF EXISTS "Anyone can insert banner clicks" ON public.banner_clicks;
CREATE POLICY "Anyone can insert banner clicks"
  ON public.banner_clicks FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 生データの参照は管理者のみ（集計は SECURITY DEFINER の RPC 経由）。
DROP POLICY IF EXISTS "Admins can select banner clicks" ON public.banner_clicks;
CREATE POLICY "Admins can select banner clicks"
  ON public.banner_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- バナー別クリック総数（bot除外・管理者のみ）。
-- 管理者以外が直接呼んでも EXISTS が false になり 0 行が返る。
CREATE OR REPLACE FUNCTION public.get_banner_click_counts(
  p_from timestamptz DEFAULT NULL,
  p_to timestamptz DEFAULT NULL
)
RETURNS TABLE(banner_id uuid, clicks bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT bc.banner_id, count(*)::bigint AS clicks
  FROM public.banner_clicks bc
  WHERE bc.is_bot = false
    AND bc.banner_id IS NOT NULL
    AND (p_from IS NULL OR bc.clicked_at >= p_from)
    AND (p_to IS NULL OR bc.clicked_at <= p_to)
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  GROUP BY bc.banner_id;
$$;

-- バナー別の日別クリック（JST基準）。p_banner_id が NULL なら全バナー合算。
CREATE OR REPLACE FUNCTION public.get_banner_click_daily(
  p_banner_id uuid DEFAULT NULL,
  p_from timestamptz DEFAULT NULL,
  p_to timestamptz DEFAULT NULL
)
RETURNS TABLE(day date, clicks bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (bc.clicked_at AT TIME ZONE 'Asia/Tokyo')::date AS day, count(*)::bigint AS clicks
  FROM public.banner_clicks bc
  WHERE bc.is_bot = false
    AND (p_banner_id IS NULL OR bc.banner_id = p_banner_id)
    AND (p_from IS NULL OR bc.clicked_at >= p_from)
    AND (p_to IS NULL OR bc.clicked_at <= p_to)
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  GROUP BY 1
  ORDER BY 1;
$$;

REVOKE ALL ON FUNCTION public.get_banner_click_counts(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_banner_click_counts(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_banner_click_counts(timestamptz, timestamptz) TO service_role;

REVOKE ALL ON FUNCTION public.get_banner_click_daily(uuid, timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_banner_click_daily(uuid, timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_banner_click_daily(uuid, timestamptz, timestamptz) TO service_role;

NOTIFY pgrst, 'reload schema';
