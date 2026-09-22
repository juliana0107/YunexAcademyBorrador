-- 008_create_videos_table.sql
-- Videos que pertenecen a un submódulo

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submodule_id UUID NOT NULL REFERENCES submodules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'PROCESSING'
    CHECK (status IN ('PROCESSING', 'READY', 'FAILED')),
  "order" INTEGER NOT NULL DEFAULT 0
    CHECK ("order" >= 0),
  duration_seconds INTEGER NOT NULL DEFAULT 0
    CHECK (duration_seconds >= 0),
  file_size_bytes BIGINT NOT NULL DEFAULT 0
    CHECK (file_size_bytes >= 0),
  mime_type VARCHAR(100) NOT NULL DEFAULT 'video/mp4',
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (submodule_id, "order")
);

CREATE INDEX idx_videos_submodule_id ON videos(submodule_id);
CREATE INDEX idx_videos_status ON videos(status);

CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();