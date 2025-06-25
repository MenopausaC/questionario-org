-- Habilitar RLS nas tabelas (se ainda não estiverem habilitadas)
ALTER TABLE public.leads_menopausa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sintomas_identificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas_questionario ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos (opcional, mas recomendado para garantir a aplicação da nova)
DROP POLICY IF EXISTS "Permitir inserção de leads" ON public.leads_menopausa;
DROP POLICY IF EXISTS "Permitir inserção de sintomas" ON public.sintomas_identificados;
DROP POLICY IF EXISTS "Permitir inserção de respostas" ON public.respostas_questionario;

-- Criar políticas para permitir inserção pelo papel 'anon'
-- Esta política permite que qualquer usuário (incluindo o 'anon') insira dados.
-- O 'USING (true)' e 'WITH CHECK (true)' significam que não há restrições adicionais.

CREATE POLICY "Allow anon insert on leads_menopausa" ON public.leads_menopausa
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon insert on sintomas_identificados" ON public.sintomas_identificados
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon insert on respostas_questionario" ON public.respostas_questionario
  FOR INSERT TO anon WITH CHECK (true);

-- Opcional: Se você precisar que usuários autenticados também possam inserir, adicione:
-- CREATE POLICY "Allow authenticated insert on leads_menopausa" ON public.leads_menopausa
--   FOR INSERT TO authenticated WITH CHECK (true);
-- E assim por diante para as outras tabelas.
