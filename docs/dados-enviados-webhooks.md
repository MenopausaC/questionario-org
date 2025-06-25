# Dados Enviados via Webhooks - Questionário Menopausa Cancelada

## 📊 Resumo Executivo

O questionário coleta e envia **mais de 50 campos de dados** divididos em 6 categorias principais:
- Dados Pessoais (7 campos)
- Dados Médicos (10 campos) 
- Dados Comportamentais (6 campos)
- Qualificação e Análise (6 campos)
- Tracking de Tempo (8 campos)
- Metadados e Comportamento (15+ campos)

---

## 🎯 Destinos dos Dados

### 1. **Make Webhook**
- Recebe TODOS os dados completos
- URL: `NEXT_PUBLIC_MAKE_WEBHOOK_URL`
- Formato: JSON completo

### 2. **Active Campaign**
- Recebe dados formatados para CRM
- URL: `NEXT_PUBLIC_ACTIVE_CAMPAIGN_WEBHOOK_URL`
- Inclui tags automáticas e campos customizados

---

## 📋 Lista Completa de Dados Enviados

### 🔹 **DADOS PESSOAIS**
\`\`\`json
{
  "nome": "Maria Silva Santos",
  "email": "maria@email.com", 
  "telefone": "11999999999",
  "idade_faixa": "45 a 49",
  "estado_residencia": "Sudeste",
  "estado_civil": "Casada",
  "renda_mensal": "R$ 5.001 a R$ 10.000"
}
\`\`\`

### 🔹 **DADOS MÉDICOS**
\`\`\`json
{
  "frequencia_fogachos": "Diariamente, e muito incômodo",
  "nivel_libido": "Significativamente baixo", 
  "fase_menopausa": "Menopausa",
  "sintomas_atuais": "Ansiedade ou irritabilidade, Insônia ou sono ruim, Cansaço constante",
  "sintoma_mais_incomoda": "Insônia ou sono ruim",
  "tempo_sintomas": "Mais de 1 ano",
  "impacto_sintomas": "Grave - Interfere muito no meu dia",
  "urgencia_resolver": "É prioridade máxima", 
  "afeta_relacionamento": "Sim",
  "fez_reposicao_hormonal": "Ginecologista"
}
\`\`\`

### 🔹 **DADOS COMPORTAMENTAIS**
\`\`\`json
{
  "ja_conhecia_projeto": "Sim",
  "tempo_conhece_projeto": "Mais de 6 meses",
  "motivo_inscricao_evento": "Estou buscando solução para os sintomas, Quero conhecer o método natural",
  "compra_online_experiencia": "Sim, muitas vezes",
  "interesse_acompanhamento": "Sim, não aguento mais meus sintomas", 
  "valor_disposto_pagar": "Sim, estou disposta a investir em um tratamento personalizado"
}
\`\`\`

### 🔹 **QUALIFICAÇÃO E ANÁLISE**
\`\`\`json
{
  "qualificacao_lead": "AAA",
  "pontuacao_total": 87,
  "categoria_sintomas": "Sua avaliação indica que você apresenta sinais que precisam de atenção agora",
  "sintomas_identificados": "Ansiedade ou irritabilidade, Insônia ou sono ruim, Cansaço constante",
  "urgencia_caso": "alta",
  "expectativa_melhora": "96% das mulheres melhoram muito"
}
\`\`\`

### 🔹 **TRACKING DE TEMPO DETALHADO**
\`\`\`json
{
  "tempo_total_questionario_ms": 180000,
  "tempo_total_questionario_segundos": 180,
  "tempo_total_questionario_minutos": 3,
  "tempo_medio_resposta_ms": 7826,
  "tempo_medio_resposta_segundos": 8,
  "pergunta_mais_lenta_id": "sintomas_atuais",
  "pergunta_mais_lenta_texto": "Quais desses sintomas você sente hoje?",
  "pergunta_mais_lenta_tempo_ms": 25000,
  "pergunta_mais_lenta_tempo_segundos": 25
}
\`\`\`

### 🔹 **COMPORTAMENTO NO QUESTIONÁRIO**
\`\`\`json
{
  "total_perguntas": 23,
  "perguntas_respondidas": 23,
  "taxa_completude": 100,
  "voltas_perguntas": 0,
  "hesitacao_perguntas": [],
  "engajamento": "ALTO"
}
\`\`\`

### 🔹 **METADADOS TÉCNICOS**
\`\`\`json
{
  "timestamp": "2024-01-15T14:30:00.000Z",
  "data_envio": "2024-01-15T14:30:00.000Z", 
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "origem": "questionario-menopausa-web",
  "versao_questionario": "3.1",
  "dispositivo": "desktop"
}
\`\`\`

### 🔹 **RESPOSTAS DETALHADAS (Array)**
\`\`\`json
{
  "respostas_detalhadas": [
    {
      "pergunta_id": "estado_residencia",
      "pergunta_texto": "Qual seu estado?",
      "resposta_texto": "Sudeste", 
      "pontos": 1,
      "tempo_resposta_ms": 3500,
      "ordem": 1
    },
    {
      "pergunta_id": "frequencia_fogachos", 
      "pergunta_texto": "Com que frequência você sente fogachos (calorões)?",
      "resposta_texto": "Diariamente, e muito incômodo",
      "pontos": 10,
      "tempo_resposta_ms": 5200,
      "ordem": 2
    }
    // ... todas as 23 perguntas
  ]
}
\`\`\`

### 🔹 **DADOS ESPECÍFICOS PARA ACTIVE CAMPAIGN**
\`\`\`json
{
  "ac_tags": ["AAA", "Menopausa", "URGENTE", "INTERESSADA"],
  "ac_custom_fields": {
    "idade_faixa": "45 a 49",
    "renda_mensal": "R$ 5.001 a R$ 10.000", 
    "estado_civil": "Casada",
    "qualificacao": "AAA",
    "sintomas_principais": "Ansiedade ou irritabilidade, Insônia ou sono ruim, Cansaço constante",
    "tempo_questionario_min": 3,
    "urgencia_resolver": "É prioridade máxima"
  }
}
\`\`\`

---

## ⏱️ **MÉTRICAS DE TEMPO ESPECIAIS**

### **Tempo de Tela Final**
- Capturado quando o resultado é exibido
- Atualizado a cada segundo
- Indica engajamento com o resultado

### **Pergunta Mais Lenta**
- Identifica qual pergunta levou mais tempo
- Útil para otimização do questionário
- Pode indicar dificuldade ou hesitação

### **Classificação de Engajamento**
- **ALTO**: < 2 minutos total
- **MÉDIO**: 2-5 minutos total  
- **BAIXO**: > 5 minutos total

---

## 🎯 **SISTEMA DE QUALIFICAÇÃO DE LEADS**

### **AAA - Ultra Qualificada**
- 3+ sintomas intensos
- Impacto grave na vida
- Urgência máxima
- Já buscou ajuda médica
- Disposta a investir
- Renda > R$5.000
- Tempo < 2 minutos

### **AA - Muito Qualificada** 
- 2+ sintomas moderados
- Impacto moderado/grave
- Urgência moderada
- Buscou ajuda alternativa
- Interesse em conhecer
- Renda R$2.000-R$10.000
- Tempo 2-4 minutos

### **A - Morna com Potencial**
- 1-2 sintomas leves
- Impacto leve
- Sem urgência
- Nunca buscou ajuda
- Curiosidade/indicação
- Não quer investir
- Tempo 4-6 minutos

### **B - Fria Desinformada**
- Não sabe a fase
- Sintomas sutis
- Renda baixa
- Não quer investir
- Tempo > 6 minutos

### **C - Fora do Perfil**
- Sem sintomas
- Sem interesse
- Nunca comprou online
- Tempo muito curto/longo

---

## 🔧 **CONFIGURAÇÃO TÉCNICA**

### **Variáveis de Ambiente Necessárias**
\`\`\`bash
NEXT_PUBLIC_MAKE_WEBHOOK_URL=https://hook.us1.make.com/...
NEXT_PUBLIC_ACTIVE_CAMPAIGN_WEBHOOK_URL=https://trackcmp.net/...
\`\`\`

### **Formato de Envio**

**Para Make:**
\`\`\`json
{
  "lead_data": {
    // Todos os dados completos aqui
  }
}
\`\`\`

**Para Active Campaign:**
\`\`\`json
{
  "contact": {
    "email": "...",
    "firstName": "...",
    "lastName": "...", 
    "phone": "...",
    "fieldValues": [...]
  },
  "tags": [...]
}
\`\`\`

### **Retry Logic**
- 3 tentativas para cada webhook
- Delay progressivo: 1s, 2s, 3s
- Logs detalhados de erro
- Backup local em localStorage

---

## 📈 **CASOS DE USO DOS DADOS**

### **Para Vendas**
- Qualificação automática (AAA, AA, A, B, C)
- Priorização de contato
- Script personalizado baseado em sintomas
- Urgência do caso

### **Para Marketing**
- Segmentação por sintomas
- Campanhas por tempo de conhecimento
- Retargeting por engajamento
- A/B test de questionário

### **Para Produto**
- Otimização de perguntas lentas
- Análise de abandono
- Melhoria da experiência
- Personalização de conteúdo

### **Para Análise**
- Correlação sintomas x qualificação
- Padrões de comportamento
- ROI por fonte de tráfego
- Conversão por dispositivo

---

## 🚨 **DADOS CRÍTICOS PARA FOLLOW-UP**

### **Contato Imediato (AAA/AA)**
- Nome, telefone, email
- Sintomas principais
- Urgência declarada
- Tempo no questionário
- Dispositivo usado

### **Nurturing (A/B)**
- Fase da menopausa
- Conhecimento do projeto
- Motivo da inscrição
- Experiência com compras online

### **Descarte (C)**
- Sem sintomas relevantes
- Sem interesse declarado
- Perfil fora do target
