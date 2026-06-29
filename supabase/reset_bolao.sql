-- =============================================
-- RESET DO BOLÃO — Copa do Mundo 2026
-- Fase de grupos encerrada. Início da fase mata-mata.
--
-- ⚠️  ATENÇÃO: Este script apaga TODOS os palpites e
--     placares salvos, mas PRESERVA os usuários cadastrados.
--
-- Execute no Supabase SQL Editor.
-- =============================================

-- 1. Apaga todos os palpites feitos pelos usuários
TRUNCATE TABLE bolao_predictions RESTART IDENTITY;

-- 2. Apaga os placares salvos (fase de grupos)
TRUNCATE TABLE bolao_scores RESTART IDENTITY;

-- 3. Zera o ranking de todos (mantém os usuários, só reseta pontos)
UPDATE bolao_ranking
SET points = 0,
    exact_scores = 0,
    updated_at = now();

-- =============================================
-- Verificação após o reset
-- =============================================

-- Confirma que os palpites foram removidos
SELECT COUNT(*) AS palpites_restantes FROM bolao_predictions;

-- Confirma que os placares foram removidos
SELECT COUNT(*) AS placares_restantes FROM bolao_scores;

-- Confirma que os usuários foram preservados
SELECT COUNT(*) AS usuarios_cadastrados FROM bolao_users;

-- Mostra o ranking zerado (usuários preservados, pontos = 0)
SELECT name, points, exact_scores FROM bolao_ranking ORDER BY name;
