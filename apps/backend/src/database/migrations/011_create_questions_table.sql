-- 011_create_questions_table.sql
-- Preguntas de las evaluaciones. El contenido específico por tipo
-- (opciones, blanks, pares, etc.) se guarda en el campo JSONB "payload".

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL
    CHECK (type IN (
      'SINGLE_CHOICE',
      'MULTIPLE_CHOICE',
      'TRUE_FALSE',
      'FILL_IN_THE_BLANKS',
      'OPEN_ANSWER',
      'TABLE_FILL',
      'DRAG_AND_DROP',
      'DROPDOWN',
      'CATEGORIZE',
      'REORDER',
      'MATCH_PAIRS',
      'MATCHING_GRID'
    )),
  statement TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 1
    CHECK (points >= 0),
  "order" INTEGER NOT NULL DEFAULT 0
    CHECK ("order" >= 0),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_assessment_id ON questions(assessment_id);
CREATE INDEX idx_questions_type ON questions(type);

CREATE TRIGGER questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();