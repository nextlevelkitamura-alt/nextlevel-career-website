-- ハイライトカード用テーブル
-- トップページのカード型横スクロールセクションを管理する
CREATE TABLE highlight_cards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  link_url text,
  category text NOT NULL DEFAULT 'news',
  badge_text text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE highlight_cards ENABLE ROW LEVEL SECURITY;

-- 一般ユーザーは有効かつ期限内のカードのみ閲覧可能
CREATE POLICY "Public can read active highlight cards" ON highlight_cards
  FOR SELECT USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  );

-- 管理者は全カードを閲覧可能
CREATE POLICY "Admins can read all highlight cards" ON highlight_cards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can insert highlight cards" ON highlight_cards
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update highlight cards" ON highlight_cards
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete highlight cards" ON highlight_cards
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- 表示順でのクエリを高速化
CREATE INDEX idx_highlight_cards_active_order ON highlight_cards (display_order)
  WHERE is_active = true;
