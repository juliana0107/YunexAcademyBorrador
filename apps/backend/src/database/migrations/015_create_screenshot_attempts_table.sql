-- 015_create_screenshot_attempts_table.sql
-- Registro de intentos de captura de pantalla durante la reproducción de videos

CREATE TABLE screenshot_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_screenshot_attempts_user_id ON screenshot_attempts(user_id);
CREATE INDEX idx_screenshot_attempts_video_id ON screenshot_attempts(video_id);
CREATE INDEX idx_screenshot_attempts_occurred_at ON screenshot_attempts(occurred_at);