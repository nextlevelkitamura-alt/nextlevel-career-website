-- ユーザーが自分の相談予約を閲覧できるRLSポリシーを追加
CREATE POLICY "Users can view own consultation bookings"
    ON consultation_bookings FOR SELECT
    USING (auth.uid() = user_id);
