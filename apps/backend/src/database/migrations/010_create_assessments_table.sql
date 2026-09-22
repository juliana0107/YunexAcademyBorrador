-- 010_create_assessments_table.sql
-- Evaluaciones asociadas a un curso (y opcionalmente a un submódulo)

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_course_id UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
  submodule_id UUID REFERENCES submodules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
  passing_score INTEGER NOT NULL DEFAULT 70
    CHECK (passing_score BETWEEN 0 AND 100),
  max_attempts INTEGER NOT NULL DEFAULT 3
    CHECK (max_attempts >= 1),
  time_limit_minutes INTEGER
    CHECK (time_limit_minutes IS NULL OR time_limit_minutes > 0),
  shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessments_training_course_id ON assessments(training_course_id);
CREATE INDEX idx_assessments_submodule_id ON assessments(submodule_id);
CREATE INDEX idx_assessments_status ON assessments(status);

CREATE TRIGGER assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();