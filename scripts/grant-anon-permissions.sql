-- Conceder permissões de INSERT para o papel 'anon' nas tabelas
GRANT INSERT ON public.leads_menopausa TO anon;
GRANT INSERT ON public.sintomas_identificados TO anon;
GRANT INSERT ON public.respostas_questionario TO anon;

-- Opcional: Conceder permissões de SELECT para o papel 'anon' se você precisar ler dados publicamente
-- GRANT SELECT ON public.leads_menopausa TO anon;
-- GRANT SELECT ON public.sintomas_identificados TO anon;
-- GRANT SELECT ON public.respostas_questionario TO anon;
