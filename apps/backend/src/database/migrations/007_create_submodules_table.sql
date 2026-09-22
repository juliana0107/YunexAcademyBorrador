-- 007_create_submodules_table.sql
-- Submódulos que componen un curso

CREATE TABLE submodules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_course_id UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  "order" INTEGER NOT NULL DEFAULT 0
    CHECK ("order" >= 0),
  estimated_duration_minutes INTEGER NOT NULL DEFAULT 0
    CHECK (estimated_duration_minutes >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (training_course_id, "order")
);

CREATE INDEX idx_submodules_training_course_id ON submodules(training_course_id);

CREATE TRIGGER submodules_updated_at
  BEFORE UPDATE ON submodules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();