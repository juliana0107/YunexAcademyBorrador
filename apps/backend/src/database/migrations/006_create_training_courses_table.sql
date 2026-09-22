-- 006_create_training_courses_table.sql
-- Cursos de formación

CREATE TABLE training_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  level VARCHAR(20) NOT NULL DEFAULT 'BEGINNER'
    CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
  thumbnail_url TEXT,
  estimated_duration_minutes INTEGER NOT NULL DEFAULT 0
    CHECK (estimated_duration_minutes >= 0),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_courses_status ON training_courses(status);
CREATE INDEX idx_training_courses_created_by ON training_courses(created_by);

CREATE TRIGGER training_courses_updated_at
  BEFORE UPDATE ON training_courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();