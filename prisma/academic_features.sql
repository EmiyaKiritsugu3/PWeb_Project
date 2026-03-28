-- ==========================================
-- Fase 4: Recursos SQL Acadêmicos (SMS)
-- ==========================================

-- 1. VIEWS (Consultas Complexas Salvas)

-- View para acompanhar faturamento por mês (D03: Joins e D05: Views)
CREATE OR REPLACE VIEW "V_FaturamentoMensal" AS
SELECT 
    TO_CHAR("dataPagamento", 'YYYY-MM') AS "Mes",
    SUM("valor") AS "TotalRecebido",
    COUNT("id") AS "QtdPagamentos"
FROM "Pagamento"
GROUP BY TO_CHAR("dataPagamento", 'YYYY-MM')
ORDER BY "Mes" DESC;

-- View para ver frequência de alunos nos últimos 30 dias (D05)
CREATE OR REPLACE VIEW "V_FrequenciaAlunos" AS
SELECT 
    a."nomeCompleto",
    COUNT(h."id") AS "TotalTreinos"
FROM "Aluno" a
LEFT JOIN "HistoricoTreino" h ON a."id" = h."alunoId"
WHERE h."dataExecucao" >= NOW() - INTERVAL '30 days'
GROUP BY a."id", a."nomeCompleto";

-- 2. PROCEDURES / FUNCTIONS (Lógica de Negócio no Banco - D18)

-- Função para calcular e subir o nível do aluno baseado em XP
CREATE OR REPLACE FUNCTION "FN_DistribuirXP"(aluno_uuid TEXT, xp_ganho INT)
RETURNS VOID AS $$
DECLARE
    xp_atual INT;
    nivel_atual INT;
    proximo_nivel_threshold INT;
BEGIN
    -- Busca dados atuais
    SELECT "exp", "nivel" INTO xp_atual, nivel_atual FROM "Aluno" WHERE "id" = aluno_uuid;
    
    xp_atual := xp_atual + xp_ganho;
    
    -- Lógica simples: Cada nível custa (Nível * 100) XP
    proximo_nivel_threshold := nivel_atual * 100;
    
    IF xp_atual >= proximo_nivel_threshold THEN
        UPDATE "Aluno" 
        SET "nivel" = "nivel" + 1, "exp" = xp_atual - proximo_nivel_threshold
        WHERE "id" = aluno_uuid;
    ELSE
        UPDATE "Aluno" SET "exp" = xp_atual WHERE "id" = aluno_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. TRIGGERS (Automação de Eventos - D06)

-- Função para o Trigger de Atualização de Status de Matrícula
CREATE OR REPLACE FUNCTION "TRF_AtualizarStatusAposPagamento"()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando um pagamento é registrado, garante que a matrícula está ATIVA
    UPDATE "Matricula" 
    SET "status" = 'ATIVA' 
    WHERE "id" = NEW."matriculaId";
    
    -- E o aluno vinculado também fica ATIVO
    UPDATE "Aluno"
    SET "statusMatricula" = 'ATIVA'
    WHERE "id" = NEW."alunoId";
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Dispara após inserir um pagamento
DROP TRIGGER IF EXISTS "TGR_PagamentoConfirmado" ON "Pagamento";
CREATE TRIGGER "TGR_PagamentoConfirmado"
AFTER INSERT ON "Pagamento"
FOR EACH ROW
EXECUTE FUNCTION "TRF_AtualizarStatusAposPagamento"();
