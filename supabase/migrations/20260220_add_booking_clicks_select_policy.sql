-- 管理者のみbooking_clicksの参照を許可
CREATE POLICY "Admins can select booking clicks"
    ON booking_clicks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );
