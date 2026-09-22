-- 016_add_question_order_and_results_visibility.sql
-- Agrega:
--   - Orden de preguntas al intento (para respetar el shuffle)
--   - Configuración de visibilidad de resultados en la evaluación
-- NOTA: los índices idx_attempts_status y idx_attempts_assessment_user
-- ya fueron creados en 013_create_attempts_table.sql, no repetir.

ALTER TABLE attempts
  ADD COLUMN question_order JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE assessments
  ADD COLUMN show_results_to_students BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN results_visible_after VARCHAR(20) NOT NULL DEFAULT 'SUBMIT'
    CHECK (results_visible_after IN ('SUBMIT', 'GRADE', 'NEVER'));

COMMENT ON COLUMN attempts.question_order IS
  'Array de IDs de preguntas en el orden presentado al estudiante (para shuffleQuestions)';

COMMENT ON COLUMN assessments.show_results_to_students IS
  'Si el estudiante puede ver las respuestas correctas al terminar';

COMMENT ON COLUMN assessments.results_visible_after IS
  'Momento en que se muestran resultados: SUBMIT (al enviar), GRADE (al calificar todo), NEVER (nunca)';