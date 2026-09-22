-- 014_create_attempt_answers_table.sql
-- Respuestas individuales de cada intento.
-- El campo "answer" es JSONB porque cada tipo de pregunta guarda una forma distinta.

CREATE TABLE attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_correct BOOLEAN,
  points_earned NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (points_earned >= 0),
  points_possible NUMERIC(5, 2) NOT NULL DEFAULT 0
    CHECK (points_possible >= 0),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, question_id)
);

CREATE INDEX idx_attempt_answers_attempt_id ON attempt_answers(attempt_id);
CREATE INDEX idx_attempt_answers_question_id ON attempt_answers(question_id);

CREATE TRIGGER attempt_answers_updated_at
  BEFORE UPDATE ON attempt_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();