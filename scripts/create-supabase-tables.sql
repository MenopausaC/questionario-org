-- Script para criar as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase

-- Tabela principal de leads
CREATE TABLE IF NOT EXISTS leads_menopausa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Dados de contato
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(50) NOT NULL,
    idade INTEGER,
    
    -- Análise dos sintomas
    categoria_sintomas VARCHAR(100),
    pontuacao_total INTEGER,
    urgencia VARCHAR(20) CHECK (urgencia IN ('baixa', 'media', 'alta')),
    expectativa_melhora TEXT,
    
    -- Qualificação do lead
    score_qualificacao INTEGER,
    categoria_lead VARCHAR(20) CHECK (categoria_lead IN ('FRIO', 'MORNO', 'QUENTE', 'MUITO_QUENTE')),
    prioridade INTEGER CHECK (prioridade BETWEEN 1 AND 5),
    motivos_qualificacao TEXT,
    
    -- Métricas de comportamento
    tempo_total_questionario INTEGER, -- em milissegundos
    tempo_medio_resposta INTEGER, -- em milissegundos
    voltas_perguntas INTEGER DEFAULT 0,
    engajamento VARCHAR(10) CHECK (engajamento IN ('BAIXO', 'MEDIO', 'ALTO')),
    hesitacao_perguntas TEXT,
    
    -- Metadados
    user_agent TEXT,
    origem VARCHAR(100) DEFAULT 'questionario-menopausa-web',
    versao_questionario VARCHAR(10) DEFAULT '1.0',
    
    -- Status do lead
    status_contato VARCHAR(50) DEFAULT 'novo' CHECK (status_contato IN ('novo', 'contatado', 'agendado', 'convertido', 'perdido')),
    data_primeiro_contato TIMESTAMP WITH TIME ZONE,
    observacoes TEXT
);

-- Tabela de sintomas identificados
CREATE TABLE IF NOT EXISTS sintomas_identificados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads_menopausa(id) ON DELETE CASCADE,
    nome_sintoma VARCHAR(255) NOT NULL,
    urgencia VARCHAR(20) CHECK (urgencia IN ('baixa', 'media', 'alta')),
    explicacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de respostas detalhadas
CREATE TABLE IF NOT EXISTS respostas_questionario (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads_menopausa(id) ON DELETE CASCADE,
    pergunta_id VARCHAR(100) NOT NULL,
    resposta_texto TEXT NOT NULL,
    pontos INTEGER NOT NULL,
    tempo_resposta_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads_menopausa(email);
CREATE INDEX IF NOT EXISTS idx_leads_categoria ON leads_menopausa(categoria_lead);
CREATE INDEX IF NOT EXISTS idx_leads_prioridade ON leads_menopausa(prioridade);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads_menopausa(status_contato);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads_menopausa(created_at);
CREATE INDEX IF NOT EXISTS idx_sintomas_lead_id ON sintomas_identificados(lead_id);
CREATE INDEX IF NOT EXISTS idx_respostas_lead_id ON respostas_questionario(lead_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_menopausa_updated_at 
    BEFORE UPDATE ON leads_menopausa 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Opcional, para segurança
ALTER TABLE leads_menopausa ENABLE ROW LEVEL SECURITY;
ALTER TABLE sintomas_identificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_questionario ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção (ajuste conforme sua necessidade)
CREATE POLICY "Permitir inserção de leads" ON leads_menopausa
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserção de sintomas" ON sintomas_identificados
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserção de respostas" ON respostas_questionario
    FOR INSERT WITH CHECK (true);

-- Views úteis para análise
CREATE OR REPLACE VIEW leads_dashboard AS
SELECT 
    l.*,
    COUNT(s.id) as total_sintomas,
    COUNT(r.id) as total_respostas,
    CASE 
        WHEN l.prioridade >= 4 THEN 'Alta Prioridade'
        WHEN l.prioridade = 3 THEN 'Média Prioridade'
        ELSE 'Baixa Prioridade'
    END as nivel_prioridade
FROM leads_menopausa l
LEFT JOIN sintomas_identificados s ON l.id = s.lead_id
LEFT JOIN respostas_questionario r ON l.id = r.lead_id
GROUP BY l.id;

-- View para relatórios de conversão
CREATE OR REPLACE VIEW relatorio_conversao AS
SELECT 
    DATE(created_at) as data,
    categoria_lead,
    COUNT(*) as total_leads,
    AVG(score_qualificacao) as score_medio,
    COUNT(CASE WHEN status_contato = 'convertido' THEN 1 END) as convertidos,
    ROUND(
        COUNT(CASE WHEN status_contato = 'convertido' THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as taxa_conversao
FROM leads_menopausa
GROUP BY DATE(created_at), categoria_lead
ORDER BY data DESC, categoria_lead;
