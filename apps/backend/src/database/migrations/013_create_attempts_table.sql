-- 013_create_attempts_table.sql
-- Intentos de resolver una evaluación

CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS'
    CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'GRADED', 'EXPIRED')),
  score NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (score BETWEEN 0 AND 100),
  passing_score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  attempt_number INTEGER NOT NULL DEFAULT 1
    CHECK (attempt_number >= 1),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0
    CHECK (time_spent_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attempts_assessment_id ON attempts(assessment_id);
CREATE INDEX idx_attempts_user_id ON attempts(user_id);
CREATE INDEX idx_attempts_status ON attempts(status);
CREATE INDEX idx_attempts_user_assessment ON attempts(user_id, assessment_id);

CREATE TRIGGER attempts_updated_at
  BEFORE UPDATE ON attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();