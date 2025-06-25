import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("🎯 Webhook recebeu uma requisição")

    // Obter os dados do corpo da requisição
    const dados = await request.json()

    console.log("📦 Dados brutos recebidos:", JSON.stringify(dados, null, 2))

    // Verificar qual formato de dados foi recebido
    // Pode ser o formato antigo (dados.dadosContato) ou o novo (dados.lead_data)
    const leadData = dados.lead_data || dados
    const dadosContato = leadData.dadosContato || leadData

    console.log("🔍 Lead data extraído:", JSON.stringify(leadData, null, 2))
    console.log("🔍 Dados contato extraído:", JSON.stringify(dadosContato, null, 2))

    // Verificar se temos os dados necessários
    if (!dadosContato || (!dadosContato.nome && !leadData.nome)) {
      console.error("❌ Dados de contato inválidos:", dadosContato)
      return NextResponse.json(
        {
          success: false,
          message: "Dados de contato inválidos ou ausentes",
          error: "missing_contact_data",
          received_data: dados,
        },
        { status: 400 },
      )
    }

    // Extrair dados com fallbacks para diferentes estruturas
    const nome = dadosContato.nome || leadData.nome
    const email = dadosContato.email || leadData.email
    const telefone = dadosContato.telefone || leadData.telefone
    const idade = dadosContato.idade || leadData.idade

    console.log("✅ Dados extraídos com sucesso:", { nome, email, telefone, idade })

    // Extrair análise e respostas com fallbacks
    const analise = leadData.analise || dados.analise || {}
    const respostas = leadData.respostas || dados.respostas || leadData.respostas_detalhadas || {}
    const qualificacaoLead = leadData.qualificacaoLead || dados.qualificacaoLead || {}

    // Registrar os dados em um log
    console.log("✅ Dados processados no webhook:", {
      nome,
      email,
      telefone,
      idade,
      categoria: analise?.categoria || leadData.categoria_sintomas || "N/A",
      qualificacao: qualificacaoLead?.categoria || leadData.categoria_lead || "N/A",
      timestamp: new Date().toISOString(),
    })

    // Aqui você pode processar os dados antes de enviá-los para o CRM
    // Por exemplo, formatar os dados, adicionar informações adicionais, etc.

    // Exemplo de integração com um CRM (substitua pela sua integração real)
    const crmUrl = process.env.CRM_WEBHOOK_URL

    if (crmUrl) {
      try {
        // Preparar dados para o CRM
        const crmData = {
          nome,
          email,
          telefone,
          idade,
          respostas: respostas,
          pontuacao: analise?.pontuacaoTotal || leadData.pontuacao_total,
          categoria: analise?.categoria || leadData.categoria_sintomas,
          qualificacao: qualificacaoLead?.categoria || leadData.categoria_lead,
          prioridade: qualificacaoLead?.prioridade || leadData.prioridade,
          sintomas: analise?.sintomas
            ? analise.sintomas.map((s: any) => s.nome).join(", ")
            : leadData.sintomas_identificados
              ? leadData.sintomas_identificados.map((s: any) => s.nome).join(", ")
              : "",
          timestamp: dados.timestamp || new Date().toISOString(),
          origem: "questionario-menopausa",
        }

        console.log("📤 Enviando dados para CRM:", crmData)

        // Enviar dados para o CRM
        const crmResponse = await fetch(crmUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CRM_API_KEY || ""}`,
          },
          body: JSON.stringify(crmData),
        })

        if (!crmResponse.ok) {
          console.error("❌ Erro ao enviar para CRM:", await crmResponse.text())
          // Ainda retornamos sucesso para o cliente, mas logamos o erro
        } else {
          console.log("✅ Dados enviados com sucesso para o CRM")
        }
      } catch (error) {
        console.error("❌ Erro na integração com CRM:", error)
        // Ainda retornamos sucesso para o cliente, mas logamos o erro
      }
    } else {
      console.log("⚠️ URL do CRM não configurada, dados não foram encaminhados")
    }

    // Simular processamento bem-sucedido
    console.log("🎉 Webhook processado com sucesso!")

    // Retornar uma resposta de sucesso
    return NextResponse.json({
      success: true,
      message: "Dados recebidos e processados com sucesso",
      timestamp: new Date().toISOString(),
      processed_data: {
        nome,
        email,
        telefone,
        idade,
        categoria: analise?.categoria,
        qualificacao: qualificacaoLead?.categoria,
      },
    })
  } catch (error) {
    console.error("❌ Erro ao processar webhook:", error)

    // Retornar uma resposta de erro
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao processar os dados",
        error: (error as Error).message,
        stack: (error as Error).stack,
      },
      { status: 500 },
    )
  }
}
