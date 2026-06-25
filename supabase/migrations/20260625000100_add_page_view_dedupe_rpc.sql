-- page_views duplicate checks for anonymous traffic without exposing rows via SELECT.
CREATE INDEX IF NOT EXISTS idx_page_views_path_user_viewed_at
  ON page_views(page_path, user_id, viewed_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_page_views_path_ip_viewed_at
  ON page_views(page_path, ip_hash, viewed_at DESC)
  WHERE ip_hash IS NOT NULL;

CREATE OR REPLACE FUNCTION public.has_recent_page_view(
  p_page_path text,
  p_ip_hash text,
  p_since timestamptz
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.page_views
    WHERE page_path = p_page_path
      AND viewed_at >= p_since
      AND (
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
        OR (auth.uid() IS NULL AND p_ip_hash IS NOT NULL AND ip_hash = p_ip_hash)
      )
    LIMIT 1
  );
$$;

REVOKE ALL ON FUNCTION public.has_recent_page_view(text, text, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_recent_page_view(text, text, timestamptz) TO anon;
GRANT EXECUTE ON FUNCTION public.has_recent_page_view(text, text, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_recent_page_view(text, text, timestamptz) TO service_role;

NOTIFY pgrst, 'reload schema';
