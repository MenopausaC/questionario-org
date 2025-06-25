"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { Heart, CheckCircle, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  type: "text" | "email" | "radio" | "textarea" | "number" | "checkbox"
  label?: string
  textInitial?: string // Para perguntas com texto dividido
  textHighlight?: string // Para perguntas com texto dividido
  textInitial2?: string // Para texto adicional após o highlight
  placeholder?: string
  options?: string[] | { text: string; image?: string }[] // Atualizado para permitir objetos com imagem
  icon?: React.ElementType
  optional?: boolean
  min?: number
  max?: number
  emoji?: string
}

interface Resposta {
  value: string | string[]
  timeTaken: number
}

interface HealthReportContent {
  mainMessage: string
  symptoms: string[]
  urgentMessage: string
}

// Helper to ensure "Nunca" ou "Nenhum desses" is the last option
const reorderOptions = (options: string[] | { text: string; image?: string }[]) => {
  if (!options || options.length === 0) return []

  const neverOption = options.find(
    (opt) =>
      (typeof opt === "string" ? opt : opt.text).includes("Nunca") ||
      (typeof opt === "string" ? opt : opt.text).includes("Nenhum desses"),
  )
  const otherOption = options.find((opt) => (typeof opt === "string" ? opt : opt.text).includes("Outros (especificar)"))

  const filteredOptions = options.filter(
    (opt) =>
      !(typeof opt === "string" ? opt : opt.text).includes("Nunca") &&
      !(typeof opt === "string" ? opt : opt.text).includes("Nenhum desses") &&
      !(typeof opt === "string" ? opt : opt.text).includes("Outros (especificar)"),
  )

  if (neverOption && otherOption) {
    return [...filteredOptions, otherOption, neverOption]
  } else if (neverOption) {
    return [...filteredOptions, neverOption]
  } else if (otherOption) {
    return [...filteredOptions, otherOption]
  }
  return options
}

const questions: Question[] = [
  // Q1: Em qual fase você está? (Climatério - Tipo da respostas "De tempos em tempos")
  {
    id: "fase_menopausa",
    type: "radio",
    textInitial: "Em qual",
    textHighlight: "fase",
    textInitial2: "você acredita estar?",
    options: ["Menopausa - Sem menstruação", "Climatério - Menstruando as vezes", "Não sei / Tenho dúvidas"],
    emoji: "⚖️",
  },
  {
    id: "principal_sintoma",
    type: "radio",
    textInitial: "Qual seu",
    textHighlight: "principal sintoma",
    options: ["Calorões", "Falta de Libido/Ressecamento", "Dores articulares", "Insônia", "Dificuldade para Emagrecer"],
    emoji: "💔",
  },
  // Q3: Qual a intensidade?
  {
    id: "intensidade_sintoma_principal",
    type: "radio",
    textInitial: "Qual a",
    textHighlight: "intensidade",
    textInitial2: "desse sintoma?",
    options: ["Grave", "Moderada", "Leve"], // Grave primeiro
    emoji: "📈",
  },
  // Q5: Fora esse, qual desses sintomas te incomoda mais?
  {
    id: "outros_sintomas_incomodam",
    type: "radio", // Mudado de "checkbox" para "radio"
    textInitial: "Fora esse, qual desses",
    textHighlight: "sintomas te incomoda mais",
    textInitial2: "?",
    options: [
      "Ansiedade ou Depressão",
      "Cansaço constante",
      "Queda de cabelo",
      "Pele seca ou Unhas fracas",
      "Falta de memória",
      "Nenhum desses",
      "Outros (especificar)",
    ],
    optional: true,
    emoji: "😩",
  },
  // Q4: Há quanto tempo você sente os sintomas?
  {
    id: "tempo_sintomas",
    type: "radio",
    textInitial: "Há",
    textHighlight: "quanto tempo",
    textInitial2: "você sente os sintomas?",
    options: ["Á mais de 1 ano", "Entre 6 meses a 1 ano", "Entre 3 a 6 meses", "Menos de 3 meses"],
    emoji: "🗓️",
  },
  // NOVA PERGUNTA: O quanto esses sintomas impactam na sua vida?
  {
    id: "impacto_sintomas_vida",
    type: "radio",
    textInitial: "O quanto esses sintomas",
    textHighlight: "impactam na sua vida",
    textInitial2: "?",
    options: [
      "Extremamente - compromete muito minha qualidade de vida",
      "Significativamente - interfere bastante no meu dia a dia",
      "Moderadamente - às vezes atrapalha algumas atividades",
      "Muito pouco - quase não interfere no meu dia",
      "Outros",
    ],
    emoji: "💥",
  },
  // Q8: O quão urgente é pra você resolver esses sintomas?
  {
    id: "urgencia_resolver",
    type: "radio",
    textInitial: "O quão",
    textHighlight: "urgente",
    textInitial2: "é pra você resolver esses sintomas?",
    options: ["É prioridade máxima", "Quero resolver em breve", "Posso esperar mais um pouco"],
    emoji: "⚡",
  },
  // Q9: Que tipo de ajuda você já tentou? (This was Q10 in previous version, now Q8)
  {
    id: "fez_reposicao_hormonal",
    type: "radio",
    textInitial: "Que tipo de",
    textHighlight: "ajuda você tentou",
    options: [
      "Ginecologista",
      "Nutricionista",
      "Chás / manipulados / remédios caseiros",
      "Reposição hormonal",
      "Pesquisas na internet",
      "Nenhuma",
    ],
    emoji: "💡",
  },
  // NOVA PERGUNTA: Você é casada?
  {
    id: "estado_civil",
    type: "radio",
    textInitial: "Você é",
    textHighlight: "casada",
    textInitial2: "?",
    options: ["Sim", "Não"],
    emoji: "💍",
  },
  // NOVA PERGUNTA: O quanto os sintomas impactam no seu relacionamento?
  {
    id: "impacto_sintomas_relacionamento",
    type: "radio",
    textInitial: "O quanto os sintomas",
    textHighlight: "impactam no seu relacionamento",
    textInitial2: "?",
    options: [
      "Extremamente - está prejudicando muito o relacionamento",
      "Significativamente - afeta bastante nossa intimidade",
      "Moderadamente - às vezes causa alguns problemas",
      "Muito pouco - quase não afeta",
      "Não se aplica - não tenho relacionamento",
      "Outros",
    ],
    emoji: "💕",
  },
  // Q10: O que fez você se inscrever para o evento? (This was Q11 in previous version, now Q10)
  {
    id: "motivo_inscricao_evento",
    type: "radio", // Mudado de "checkbox" para "radio"
    label: "O que fez você se inscrever para o evento?",
    options: [
      "Quero resolver meus sintomas",
      "Acredito muito nesse método eficaz da Dra",
      "Fiquei curiosa e quero saber mais",
      "Influência ou indicação de amiga/parentes.",
    ],
    emoji: "📝",
  },
  // Q11: Você estaria disposta a investir para resolver esse problema? Personalizado, parcela de 99, vou seguir sozinha) (This was Q12 in previous version, now Q11)
  {
    id: "valor_disposto_pagar",
    type: "radio",
    textInitial: "Você estaria disposta a",
    textHighlight: "investir para resolver",
    textInitial2: "esse problema?",
    options: [
      "Sim, estou disposta a investir em um tratamento personalizado",
      "Sim, mas no máximo até R$99 por mês", // Changed from R$100
      "Não, prefiro seguir com opções gratuitas e sozinha",
    ],
    emoji: "💸",
  },
  // Q12: Você já investiu online (This was Q13 in previous version, now Q12)
  {
    id: "compra_online_experiencia",
    type: "radio",
    textInitial: "Você já",
    textHighlight: "investiu em algum tratamento online",
    textInitial2: "?",
    options: ["Sim, muitas vezes", "Sim, poucas vezes", "Não"],
    emoji: "🛒",
  },
  // Q13: Você já conhecia a Dra. Giovana/Menopausa Cancelada? (This was Q14 in previous version, now Q13)
  {
    id: "ja_conhecia",
    type: "radio",
    textInitial: "Você já conhecia a Dra. Giovana/",
    textHighlight: "Menopausa Cancelada",
    emoji: "👋",
    options: [
      "Sim, entre 2 a 3 anos",
      "Sim, de 6 meses a 1 ano",
      "Sim, mais de 3 meses",
      "Sim, a menos de 1 mês",
      "Não conhecia",
    ],
  },
  // Q14: Renda (Desempregada, 1 a 2, 3 a 4, prefiro não informar (This was Q16 in previous version, now Q14)
  {
    id: "renda_mensal",
    type: "radio",
    textInitial: "Qual sua",
    textHighlight: "renda mensal",
    textInitial2: "aproximada?",
    options: [
      "Ganho mais de 3 salários mínimos",
      "Ganho de 2 a 3 salários mínimos",
      "Ganho de 1 a 2 salários mínimos",
      "Prefiro não informar",
    ],
    emoji: "💰",
  },
  // Q15: Estado? (This was Q17 in previous version, now Q15)
  {
    id: "estado_residencia",
    type: "radio",
    textInitial: "Qual",
    textHighlight: "seu estado",
    options: ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"],
    emoji: "📍",
  },
  // Q16: Idade? (This was Q18 in previous version, now Q16)
  {
    id: "idade_faixa",
    type: "radio",
    textInitial: "Qual",
    textHighlight: "sua idade",
    options: ["70+", "65 a 69", "60 a 64", "55 a 59", "50 a 54", "45 a 49", "35 a 44", "Menos de 35"],
    emoji: "🎂",
  },
  // Contact questions remain at the end
  {
    id: "nome_completo",
    type: "text",
    textInitial: "Qual seu",
    textHighlight: "nome completo",
    placeholder: "Digite seu nome completo",
    emoji: "🙋‍♀️",
  },
  {
    id: "whatsapp",
    type: "text",
    textInitial: "Qual seu",
    textHighlight: "WhatsApp",
    textInitial2: "(com DDD)?",
    placeholder: "(11) 99999-9999",
    emoji: "📱",
  },
  {
    id: "email_cadastro",
    type: "email",
    textInitial: "Qual seu",
    textHighlight: "e-mail de cadastro",
    placeholder: "seu@email.com",
    emoji: "📧",
  },
]

// Apply reorderOptions to all questions that have options
const finalQuestions = questions.map((q) => ({
  ...q,
  options: q.options ? reorderOptions(q.options) : q.options,
}))

// Update calculateLeadQualification function
function calculateLeadQualification(respostas: Record<string, Resposta>, tempoTotalQuestionario: number): string {
  const principalSintoma = respostas.principal_sintoma?.value as string
  const outrosSintomasIncomodam = (respostas.outros_sintomas_incomodam?.value as string) || "" // Mudado de array para string
  const outrosSintomasIncomodamOutro = respostas.outros_sintomas_incomodam_outro?.value as string // Re-added
  const intensidadeSintomaPrincipal = respostas.intensidade_sintoma_principal?.value as string
  const fezReposicao = respostas.fez_reposicao_hormonal?.value
  const valorDispostoPagar = respostas.valor_disposto_pagar?.value
  const tempoSintomas = respostas.tempo_sintomas?.value
  const rendaMensal = respostas.renda_mensal?.value
  const tempoConhece = respostas.ja_conhecia?.value
  const compraOnlineExperiencia = respostas.compra_online_experiencia?.value
  const faseMenopausa = respostas.fase_menopausa?.value
  const motivoInscricaoEvento = respostas.motivo_inscricao_evento?.value as string
  const jaConhecia = respostas.ja_conhecia?.value
  const urgenciaResolver = respostas.urgencia_resolver?.value
  const impactoSintomasVida = respostas.impacto_sintomas_vida?.value
  const estadoCivil = respostas.estado_civil?.value
  const impactoSintomasRelacionamento = respostas.impacto_sintomas_relacionamento?.value

  // Contagem de sintomas relevantes
  const totalSintomasIncomodam =
    (principalSintoma && principalSintoma !== "Nenhum desses" && principalSintoma !== "Outros (especificar)" ? 1 : 0) +
    (outrosSintomasIncomodam &&
    outrosSintomasIncomodam !== "Nenhum desses" &&
    outrosSintomasIncomodam !== "Outros (especificar)"
      ? 1
      : 0) +
    (outrosSintomasIncomodamOutro && outrosSintomasIncomodamOutro.trim().length > 0 ? 1 : 0) // Count the "Outros" text input

  // Tempo em minutos
  const tempoMinutos = tempoTotalQuestionario / (1000 * 60)

  // AAA – Ultra Qualificada
  const isAAA =
    intensidadeSintomaPrincipal === "Grave" &&
    urgenciaResolver === "É prioridade máxima" &&
    fezReposicao &&
    fezReposicao !== "Nenhuma" &&
    valorDispostoPagar === "Sim, estou disposta a investir em um tratamento personalizado" &&
    tempoSintomas === "Á mais de 1 ano" &&
    rendaMensal === "Ganho mais de 3 salários mínimos" &&
    tempoMinutos < 2

  if (isAAA) return "AAA"

  // AA – Muito Qualificada
  const isAA =
    intensidadeSintomaPrincipal === "Moderada" &&
    urgenciaResolver === "Quero resolver em breve" &&
    (fezReposicao === "Pesquisas na internet" ||
      fezReposicao === "Chás / manipulados / remédios caseiros" ||
      fezReposicao === "Nutricionista") &&
    valorDispostoPagar === "Sim, mas no máximo até R$99 por mês" &&
    (tempoSintomas === "Entre 6 meses a 1 ano" || tempoSintomas === "Á mais de 1 ano") &&
    (rendaMensal === "Ganho de 2 a 3 salários mínimos" || rendaMensal === "Ganho mais de 3 salários mínimos") &&
    tempoMinutos >= 2 &&
    tempoMinutos <= 4

  if (isAA) return "AA"

  // A – Morna com Potencial
  const isA =
    intensidadeSintomaPrincipal === "Leve" &&
    urgenciaResolver === "Posso esperar mais um pouco" &&
    fezReposicao === "Nenhuma" &&
    (motivoInscricaoEvento === "Fiquei curiosa e quero saber mais" ||
      motivoInscricaoEvento === "Influência ou indicação de amiga/parentes.") &&
    valorDispostoPagar === "Não, prefiro seguir com opções gratuitas e sozinha" &&
    (tempoSintomas === "Menos de 3 meses" || tempoSintomas === "Entre 3 a 6 meses") &&
    rendaMensal === "Ganho de 1 a 2 salários mínimos" &&
    tempoMinutos >= 4 &&
    tempoMinutos <= 6

  if (isA) return "A"

  // B – Fria Desinformada
  const isB =
    faseMenopausa === "Não sei / Tenho dúvidas" ||
    totalSintomasIncomodam <= 1 ||
    (fezReposicao === "Nenhuma" && jaConhecia === "Não conhecia") ||
    rendaMensal === "Ganho de 1 a 2 salários mínimos" ||
    valorDispostoPagar === "Não, prefiro seguir com opções gratuitas e sozinha" ||
    tempoMinutos > 6

  if (isB) return "B"

  // C – Fora do Perfil
  const isC =
    (principalSintoma === "Nenhum desses" && outrosSintomasIncomodam.includes("Nenhum desses")) ||
    compraOnlineExperiencia === "Não" ||
    !rendaMensal ||
    tempoMinutos < 0.5 ||
    tempoMinutos > 15

  if (isC) return "C"

  // Fallback: Sistema de pontuação para casos não cobertos pelos critérios específicos
  let score = 0

  // Pontuação baseada na intensidade do sintoma principal
  if (intensidadeSintomaPrincipal === "Grave") score += 5
  else if (intensidadeSintomaPrincipal === "Moderada") score += 3
  else if (intensidadeSintomaPrincipal === "Leve") score += 1

  // Pontuação baseada na urgência de resolver
  if (urgenciaResolver === "É prioridade máxima") score += 3
  else if (urgenciaResolver === "Quero resolver em breve") score += 2
  else if (urgenciaResolver === "Posso esperar mais um pouco") score += 1

  // Já fez reposição ou buscou ajuda: +2
  if (fezReposicao && fezReposicao !== "Nenhuma") {
    score += 2
  }

  // Tempo de sintomas > 1 ano: +2
  if (tempoSintomas === "Á mais de 1 ano") {
    score += 2
  }

  // Disposta a investir: +3, até R$99: +2, gratuito: +0
  if (valorDispostoPagar === "Sim, estou disposta a investir em um tratamento personalizado") score += 3
  else if (valorDispostoPagar === "Sim, mas no máximo até R$99 por mês") score += 2

  // Renda: "Ganho mais de 3 salários mínimos": +2, "Ganho de 2 a 3 salários mínimos": +1
  if (rendaMensal === "Ganho mais de 3 salários mínimos") {
    score += 2
  } else if (rendaMensal === "Ganho de 2 a 3 salários mínimos") {
    score += 1
  }

  // Preencheu em até 2 minutos: +1
  if (tempoMinutos <= 2) {
    score += 1
  }

  // Conhece o projeto há mais de 6 meses: +1
  if (
    jaConhecia === "Sim, mais de 3 meses" ||
    jaConhecia === "Sim, de 6 meses a 1 ano" ||
    jaConhecia === "Sim, entre 2 a 3 anos"
  ) {
    score += 1
  }

  // "Não tenho interesse" ou renda baixa: -2
  if (rendaMensal === "Ganho de 1 a 2 salários mínimos" || rendaMensal === "Prefiro não informar") {
    score -= 2
  }

  // Pontuação baseada no impacto no relacionamento: +2 se afeta significativamente
  if (
    impactoSintomasRelacionamento === "Significativamente - afeta bastante nossa intimidade" ||
    impactoSintomasRelacionamento === "Extremamente - está prejudicando muito o relacionamento"
  ) {
    score += 2
  }

  // Classificação por pontuação (fallback)
  if (score >= 12) return "AAA"
  if (score >= 9) return "AA"
  if (score >= 6) return "A"
  if (score >= 3) return "B"
  return "C"
}

// Update generateHealthReport function
function generateHealthReport(respostas: Record<string, Resposta>): HealthReportContent {
  const principalSintomaSelecionado = respostas.principal_sintoma?.value as string

  // Determinar urgência baseada no sintoma principal (pergunta 2)
  const sintomasAltaUrgencia = ["Calorões", "Insônia", "Dificuldade para Emagrecer"]
  const sintomasMediaUrgencia = ["Falta de Libido/Ressecamento", "Dores articulares"]

  let urgenciaBasedOnPrincipalSintoma = "media"

  if (sintomasAltaUrgencia.includes(principalSintomaSelecionado)) {
    urgenciaBasedOnPrincipalSintoma = "alta"
  } else if (sintomasMediaUrgencia.includes(principalSintomaSelecionado)) {
    urgenciaBasedOnPrincipalSintoma = "media"
  }

  const mainMessage = "Sua avaliação indica que você apresenta sinais que precisam de atenção especializada."

  // Gerar mensagem de urgência baseada no sintoma principal
  let urgentMessage = ""

  if (urgenciaBasedOnPrincipalSintoma === "alta") {
    urgentMessage =
      "🚨 ATENÇÃO! Seus sintomas indicam que você precisa de um ACOMPANHAMENTO URGENTE. A boa notícia? Existe uma solução 100% natural com resultados comprovados. Não perca tempo!"
  } else {
    urgentMessage =
      "⚠️ IMPORTANTE! Seus sintomas merecem um acompanhamento especializado. Existe uma solução 100% natural que pode ajudar você a recuperar sua qualidade de vida."
  }

  return {
    mainMessage,
    symptoms: [], // Removido a lista de sintomas
    urgentMessage,
  }
}

// Update calculateQuestionPoints function
function calculateQuestionPoints(questionId: string, answer: string | string[]): number {
  const pointsMap: Record<string, Record<string, number>> = {
    frequencia_fogachos: {
      "Nunca ou raramente": 1,
      "Algumas vezes por semana": 3,
      "Diariamente, mas controlável": 6,
      "Diariamente, e muito incômodo": 10,
    },
    intensidade_sintoma_principal: {
      Leve: 2,
      Moderada: 6,
      Grave: 10,
    },
    urgencia_resolver: {
      "Posso esperar mais um pouco": 2,
      "Quero resolver em breve": 6,
      "É prioridade máxima": 10,
    },
  }

  if (Array.isArray(answer)) {
    // For checkboxes, give points for each selected item, excluding "Nenhum desses" and "Outros"
    return answer.filter((item) => item !== "Nenhum desses" && item !== "Outros (especificar)").length * 2
  }

  // For radio buttons, use the specific points from the map, or a default of 1
  return pointsMap[questionId]?.[answer as string] || 1
}

// Função para gerar o conteúdo do Bloco 1: Análise do Seu Caso
const symptomDetailsMap: Record<string, { emoji: string; urgency: "alta" | "media" | "baixa"; explanation: string }> = {
  "Ansiedade ou Depressão": {
    emoji: "🔥",
    urgency: "alta",
    explanation:
      "A ansiedade e depressão podem desequilibrar seu bem-estar emocional e social, exigindo atenção para restaurar a calma e a qualidade de vida. Isso pode levar a problemas de relacionamento e dificuldades no trabalho.",
  },
  "Insônia ou sono ruim": {
    emoji: "🚨",
    urgency: "alta",
    explanation:
      "A insônia crônica afeta sua energia, concentração e humor, comprometendo a saúde geral e a capacidade de lidar com o dia a dia. A falta de sono reparador pode agravar outros sintomas e impactar sua produtividade.",
  },
  "Dores articulares": {
    emoji: "⚠️",
    urgency: "media",
    explanation:
      "Dores nas articulações podem limitar sua mobilidade e atividades diárias, impactando sua qualidade de vida e bem-estar físico. Ignorar essas dores pode levar a um agravamento e perda de flexibilidade.",
  },
  "Cansaço constante": {
    emoji: "🔥",
    urgency: "alta",
    explanation:
      "O cansaço persistente drena sua vitalidade, dificultando a realização de tarefas e a manutenção de um estilo de vida ativo e produtivo. Pode ser um sinal de desequilíbrios hormonais que precisam de atenção.",
  },
  "Queda de cabelo / pele seca / unhas fracas": {
    emoji: "⚠️",
    urgency: "media",
    explanation:
      "Esses sintomas afetam sua autoestima e aparência, indicando desequilíbrios que podem ser tratados para restaurar a vitalidade. A saúde da pele, cabelo e unhas reflete seu bem-estar interno.",
  },
  "Dificuldade para emagrecer": {
    emoji: "⚠️",
    urgency: "media",
    explanation:
      "A dificuldade em perder peso pode impactar sua saúde metabólica e bem-estar, exigindo estratégias eficazes para alcançar seus objetivos. Pode estar ligada a alterações hormonais que dificultam o metabolismo.",
  },
  "Falta de memória": {
    emoji: "🚨",
    urgency: "alta",
    explanation:
      "Problemas de concentração e memória afetam sua produtividade e clareza mental, exigindo foco para restaurar a função cognitiva. Isso pode impactar sua vida profissional e pessoal, gerando frustração.",
  },
  "Fogachos (calorões)": {
    emoji: "🥵",
    urgency: "alta",
    explanation:
      "Os fogachos frequentes causam desconforto intenso e interrupções no sono, impactando significativamente sua qualidade de vida e bem-estar diário. Eles podem ser exaustivos e constrangedores, exigindo uma solução eficaz.",
  },
  "Diminuição da libido": {
    emoji: "💔",
    urgency: "media",
    explanation:
      "A baixa libido pode afetar a intimidade e a satisfação pessoal, sendo um sintoma que merece atenção para restaurar o equilíbrio. Isso pode gerar tensões em relacionamentos e impactar a autoestima.",
  },
  "Nenhum desses": {
    emoji: "✅",
    urgency: "baixa",
    explanation: "Ótimo! Você não relatou nenhum desses sintomas. Continue monitorando sua saúde e bem-estar.",
  },
  "Outros (especificar)": {
    emoji: "❓",
    urgency: "media",
    explanation:
      "Sintomas específicos podem indicar necessidades únicas. É importante investigar para um diagnóstico preciso e um plano de tratamento personalizado.",
  },
}

// In getSymptomWithUrgencyEmoji function:
// Update the return type and logic to include the explanation.
function getSymptomWithUrgencyEmoji(symptom: string): {
  text: string
  emoji: string
  urgency: "alta" | "media" | "baixa"
  explanation: string // Added explanation
} {
  // Handle the custom "Outros: " prefix for the explanation
  if (symptom.startsWith("Outros: ")) {
    return {
      text: symptom,
      emoji: symptomDetailsMap["Outros (especificar)"].emoji,
      urgency: symptomDetailsMap["Outros (especificar)"].urgency,
      explanation: symptomDetailsMap["Outros (especificar)"].explanation,
    }
  }

  const mapped = symptomDetailsMap[symptom] || {
    emoji: "⚠️",
    urgency: "media" as const,
    explanation: "Este sintoma requer atenção para um diagnóstico mais preciso.",
  }
  return {
    text: symptom,
    emoji: mapped.emoji,
    urgency: mapped.urgency,
    explanation: mapped.explanation,
  }
}

// Mock functions for calculateTotalScore, enviarParaMakeWebhook, and enviarParaActiveCampaign
// Replace these with your actual implementations
function calculateTotalScore(respostas: Record<string, Resposta>): number {
  let totalScore = 0

  Object.entries(respostas).forEach(([questionId, resposta]) => {
    totalScore += calculateQuestionPoints(questionId, resposta.value)
  })

  return totalScore
}

async function enviarParaMakeWebhook(data: any): Promise<{ success: boolean; message: string }> {
  try {
    const webhookUrl = process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL

    if (!webhookUrl) {
      throw new Error("URL do webhook não configurada")
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lead_data: data }),
    })

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    return { success: true, message: "Dados enviados com sucesso para Make" }
  } catch (error) {
    console.error("Erro ao enviar para Make:", error)
    return { success: false, message: `Erro: ${error.message}` }
  }
}

async function enviarParaActiveCampaign(data: any): Promise<{ success: boolean; message: string }> {
  try {
    const webhookUrl = process.env.NEXT_PUBLIC_ACTIVE_CAMPAIGN_WEBHOOK_URL

    if (!webhookUrl) {
      return { success: true, message: "Active Campaign não configurado" }
    }

    const acData = {
      contact: {
        email: data.email,
        firstName: data.nome?.split(" ")[0] || "",
        lastName: data.nome?.split(" ").slice(1).join(" ") || "",
        phone: data.telefone,
        fieldValues: [
          { field: "idade_faixa", value: data.idade_faixa },
          { field: "renda_mensal", value: data.renda_mensal },
          { field: "qualificacao", value: data.qualificacao_lead },
          { field: "sintomas_principais", value: data.sintomas_identificados },
          { field: "urgencia_resolver", value: data.urgencia_resolver },
        ],
      },
      tags: data.ac_tags || [],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(acData),
    })

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`)
    }

    return { success: true, message: "Dados enviados com sucesso para Active Campaign" }
  } catch (error) {
    console.error("Erro ao enviar para Active Campaign:", error)
    return { success: false, message: `Erro: ${error.message}` }
  }
}

export default function QuestionarioMenopausa() {
  const [currentStep, setCurrentStep] = useState(1)
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({})
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [showResult, setShowResult] = useState(false)
  const [webhookEnviado, setWebhookEnviado] = useState(false)
  const [webhookStatus, setWebhookStatus] = useState<{ success: boolean; message: string; fallbackUsed?: boolean }>({
    success: false,
    message: "",
  })
  const [timeLeft, setTimeLeft] = useState(60 * 10) // 10 minutos em segundos para o timer
  const [finalScreenStartTime, setFinalScreenStartTime] = useState<number>(0)
  const [finalScreenTime, setFinalScreenTime] = useState<number>(0)
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({})
  const [showGratificationMessage, setShowGratificationMessage] = useState(false)
  const [showOtherSymptomsInput, setShowOtherSymptomsInput] = useState(false) // Re-added state for Q5 "Outros"
  const [showOtherMainSymptomInput, setShowOtherMainSymptomInput] = useState(false) // Para Q2 "Outros"
  const [showOtherImpactInput, setShowOtherImpactInput] = useState(false) // Para nova pergunta "Outros"
  const [showOtherRelationshipImpactInput, setShowOtherRelationshipImpactInput] = useState(false) // Para pergunta de relacionamento "Outros"

  // --- FINALIZAR QUESTIONÁRIO --------------------------------------------
  const finalizarQuestionario = useCallback(async () => {
    console.log("🚀 Iniciando finalização do questionário...")

    const tempoTotalQuestionario = Date.now() - startTime
    setFinalScreenStartTime(Date.now())

    const formattedRespostas: Record<string, string | number | string[]> = {}
    let totalTempoResposta = 0
    const respostasDetalhadas: Array<{
      pergunta_id: string
      pergunta_texto: string
      resposta_texto: string
      pontos: number
      tempo_resposta_ms: number
      ordem: number
    }> = []

    // Encontrar a pergunta que levou mais tempo
    let perguntaMaisLenta = { id: "", tempo: 0, texto: "" }

    // Use finalQuestions here
    finalQuestions.forEach((q, index) => {
      const resposta = respostas[q.id]
      if (resposta) {
        formattedRespostas[q.id] = resposta.value
        totalTempoResposta += resposta.timeTaken

        // Verificar se é a pergunta mais lenta
        if (resposta.timeTaken > perguntaMaisLenta.tempo) {
          perguntaMaisLenta = {
            id: q.id,
            tempo: resposta.timeTaken,
            texto: q.label || `${q.textInitial} ${q.textHighlight} ${q.textInitial2 || ""}`.trim(),
          }
        }

        // Adicionar aos detalhes
        respostasDetalhadas.push({
          pergunta_id: q.id,
          pergunta_texto: q.label || `${q.textInitial} ${q.textHighlight} ${q.textInitial2 || ""}`.trim(),
          resposta_texto: Array.isArray(resposta.value) ? resposta.value.join(", ") : String(resposta.value),
          pontos: calculateQuestionPoints(q.id, resposta.value),
          tempo_resposta_ms: resposta.timeTaken,
          ordem: index + 1,
        })
      } else {
        formattedRespostas[q.id] = q.type === "checkbox" ? [] : ""
      }
    })

    const tempoMedioResposta = finalQuestions.length > 0 ? Math.round(totalTempoResposta / finalQuestions.length) : 0
    const qualificacaoLead = calculateLeadQualification(respostas, tempoTotalQuestionario)
    const saudeReport = generateHealthReport(respostas)

    // Extrair Principal Sintoma
    const principalSintoma = formattedRespostas.principal_sintoma as string
    const outrosSintomas = (formattedRespostas.outros_sintomas_incomodam as string) || "" // Mudado de array para string
    const outrosSintomasOutroText = (respostas.outros_sintomas_incomodam_outro?.value as string) || "" // Get the text input value
    const principalSintomaOutroText = (respostas.principal_sintoma_outro?.value as string) || ""
    const impactoSintomasVida = formattedRespostas.impacto_sintomas_vida as string
    const impactoSintomasVidaOutroText = (respostas.impacto_sintomas_vida_outro?.value as string) || ""
    const impactoSintomasRelacionamentoOutroText =
      (respostas.impacto_sintomas_relacionamento_outro?.value as string) || ""

    const allSymptomsRelatados = [...new Set([principalSintoma, outrosSintomas])].filter(
      (s) => s && s !== "Nenhum desses" && s !== "Outros (especificar)",
    )

    if (outrosSintomasOutroText.trim().length > 0) {
      allSymptomsRelatados.push(`Outros: ${outrosSintomasOutroText}`)
    }

    if (principalSintomaOutroText.trim().length > 0) {
      allSymptomsRelatados.push(`Principal: ${principalSintomaOutroText}`)
    }

    const todosSintomasRelatados = allSymptomsRelatados.join(", ")

    // Qualificação do Sintoma (lógica simples baseada na presença de sintomas urgentes)
    const qualificacaoSintoma =
      saudeReport.symptoms.length > 0 && saudeReport.urgentMessage.includes("URGENTE")
        ? "Alta Urgência"
        : saudeReport.symptoms.length > 0
          ? "Média Urgência"
          : "Baixa Urgência"

    // Tempo Final (tempo gasto na última pergunta)
    const tempoFinalPergunta = respostas[finalQuestions[finalQuestions.length - 1].id]?.timeTaken || 0

    // ➕ Obtém o motivo da inscrição (resposta única da pergunta 10)
    const motivoInscricaoEvento = (formattedRespostas.motivo_inscricao_evento as string) ?? ""

    const dadosCompletosParaMake = {
      // === DADOS PESSOAIS ===
      nome: formattedRespostas.nome_completo,
      telefone: formattedRespostas.whatsapp,
      idade_faixa: formattedRespostas.idade_faixa,
      email: formattedRespostas.email_cadastro,
      renda_mensal: formattedRespostas.renda_mensal,
      estado_residencia: formattedRespostas.estado_residencia,
      estado_civil: formattedRespostas.estado_civil,

      // === DADOS MÉDICOS ===
      fase_menopausa: formattedRespostas.fase_menopausa,
      principal_sintoma: principalSintoma,
      principal_sintoma_outro: (respostas.principal_sintoma_outro?.value as string) || "",
      intensidade_sintoma_principal: formattedRespostas.intensidade_sintoma_principal,
      outros_sintomas_incomodam: outrosSintomas, // Já é string agora
      outros_sintomas_incomodam_outro: outrosSintomasOutroText,
      tempo_sintomas: formattedRespostas.tempo_sintomas,
      impacto_sintomas_vida: formattedRespostas.impacto_sintomas_vida,
      impacto_sintomas_vida_outro: (respostas.impacto_sintomas_vida_outro?.value as string) || "",
      impacto_sintomas_relacionamento: formattedRespostas.impacto_sintomas_relacionamento,
      impacto_sintomas_relacionamento_outro: (respostas.impacto_sintomas_relacionamento_outro?.value as string) || "",
      urgencia_resolver: formattedRespostas.urgencia_resolver,
      fez_reposicao_hormonal: formattedRespostas.fez_reposicao_hormonal,

      // === DADOS COMPORTAMENTAIS ===
      ja_conhecia: formattedRespostas.ja_conhecia,
      motivo_inscricao_evento: motivoInscricaoEvento,
      compra_online_experiencia: formattedRespostas.compra_online_experiencia,
      valor_disposto_pagar: formattedRespostas.valor_disposto_pagar,

      // === QUALIFICAÇÃO E ANÁLISE ===
      qualificacao_lead: qualificacaoLead,
      pontuacao_total: calculateTotalScore(respostas),
      categoria_sintomas: saudeReport.mainMessage,
      sintomas_identificados: saudeReport.symptoms.join(", "),
      urgencia_caso: saudeReport.urgentMessage.includes("URGENTE") ? "alta" : "media",
      expectativa_melhora: "96% das mulheres melhoram muito",

      // === TRACKING DE TEMPO ===
      tempo_total_questionario_ms: tempoTotalQuestionario,
      tempo_total_questionario_segundos: Math.round(tempoTotalQuestionario / 1000),
      tempo_total_questionario_minutos: Math.round(tempoTotalQuestionario / (1000 * 60)),
      tempo_medio_resposta_ms: tempoMedioResposta,
      tempo_medio_resposta_segundos: Math.round(tempoMedioResposta / 1000),
      pergunta_mais_lenta_id: perguntaMaisLenta.id,
      pergunta_mais_lenta_texto: perguntaMaisLenta.texto,
      pergunta_mais_lenta_tempo_ms: perguntaMaisLenta.tempo,
      pergunta_mais_lenta_tempo_segundos: Math.round(perguntaMaisLenta.tempo / 1000),

      // === COMPORTAMENTO NO QUESTIONÁRIO ===
      total_perguntas: finalQuestions.length,
      perguntas_respondidas: Object.keys(respostas).length,
      taxa_completude: Math.round((Object.keys(respostas).length / finalQuestions.length) * 100),
      voltas_perguntas: 0,
      hesitacao_perguntas: [],
      engajamento: tempoTotalQuestionario < 120000 ? "ALTO" : tempoTotalQuestionario < 300000 ? "MEDIO" : "BAIXO",

      // === METADADOS ===
      timestamp: new Date().toISOString(),
      data_envio: new Date().toISOString(),
      user_agent: navigator.userAgent,
      origem: "questionario-menopausa-web",
      versao_questionario: "3.4",
      dispositivo: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? "mobile" : "desktop",

      // === DADOS DETALHADOS PARA ANÁLISE ===
      respostas_detalhadas: respostasDetalhadas,

      // === DADOS PARA ACTIVE CAMPAIGN ===
      ac_tags: [
        qualificacaoLead,
        formattedRespostas.fase_menopausa,
        formattedRespostas.urgencia_resolver === "É prioridade máxima" ? "URGENTE" : "NAO_URGENTE",
      ].filter(Boolean),
    }

    console.log("🎯 DADOS COMPLETOS PARA ENVIO:", dadosCompletosParaMake)

    try {
      const resultadoMake = await enviarParaMakeWebhook(dadosCompletosParaMake)
      const resultadoAC = await enviarParaActiveCampaign(dadosCompletosParaMake)

      console.log("📋 Resultado Make:", resultadoMake)
      console.log("📋 Resultado Active Campaign:", resultadoAC)

      if (resultadoMake.success || resultadoAC.success) {
        setWebhookEnviado(true)
        setWebhookStatus({
          success: true,
          message: "✅ Dados enviados com sucesso!",
          fallbackUsed: false,
        })
      } else {
        setWebhookEnviado(false)
        setWebhookStatus({
          success: false,
          message: `❌ Erro no envio`,
          fallbackUsed: true,
        })
      }
    } catch (erro) {
      console.error("💥 Erro inesperado:", erro)
      setWebhookEnviado(false)
      setWebhookStatus({
        success: false,
        message: `💥 Erro inesperado: ${erro.message}`,
        fallbackUsed: true,
      })
    }

    setShowResult(true)
  }, [respostas, startTime, finalQuestions])
  // ------------------------------------------------------------------------

  const totalSteps = finalQuestions.length

  useEffect(() => {
    setQuestionStartTime(Date.now())
    // Reset gratification message and other symptoms input visibility when step changes
    setShowGratificationMessage(false)

    const currentQuestion = finalQuestions[currentStep - 1]
    // If current question is Q5 and "Outros (especificar)" was selected previously, show the input
    if (
      currentQuestion?.id === "outros_sintomas_incomodam" &&
      respostas.outros_sintomas_incomodam?.value === "Outros (especificar)" // Mudado de .includes() para comparação direta
    ) {
      setShowOtherSymptomsInput(true)
    } else {
      setShowOtherSymptomsInput(false) // Hide if not Q5 or "Outros" is not selected
    }

    if (currentQuestion?.id === "principal_sintoma" && respostas.principal_sintoma?.value === "Outros (especificar)") {
      setShowOtherMainSymptomInput(true)
    } else {
      setShowOtherMainSymptomInput(false)
    }

    // Nova pergunta de impacto
    if (currentQuestion?.id === "impacto_sintomas_vida" && respostas.impacto_sintomas_vida?.value === "Outros") {
      setShowOtherImpactInput(true)
    } else {
      setShowOtherImpactInput(false)
    }

    // Nova pergunta de impacto no relacionamento
    if (
      currentQuestion?.id === "impacto_sintomas_relacionamento" &&
      respostas.impacto_sintomas_relacionamento?.value === "Outros"
    ) {
      setShowOtherRelationshipImpactInput(true)
    } else {
      setShowOtherRelationshipImpactInput(false)
    }
  }, [currentStep, respostas, finalQuestions])

  // Function to determine if the current step is valid
  const isStepValid = useCallback(
    (questionId: string): boolean => {
      const question = finalQuestions[currentStep - 1]

      if (!question) return false

      const answer = respostas[questionId]?.value

      if (question.optional) return true

      if (
        question.type === "text" ||
        question.type === "email" ||
        question.type === "number" ||
        question.type === "textarea"
      ) {
        return typeof answer === "string" && answer.trim().length > 0
      }

      if (question.type === "radio") {
        return typeof answer === "string" && answer.trim().length > 0
      }

      if (question.type === "checkbox") {
        if (!Array.isArray(answer)) return false
        return answer.length > 0
      }

      if (question.id === "principal_sintoma" && showOtherMainSymptomInput && !isStepValid("principal_sintoma_outro")) {
        return false
      }

      if (
        question.id === "outros_sintomas_incomodam" &&
        showOtherSymptomsInput &&
        !isStepValid("outros_sintomas_incomodam_outro")
      ) {
        return false
      }

      if (
        question.id === "impacto_sintomas_vida" &&
        showOtherImpactInput &&
        !isStepValid("impacto_sintomas_vida_outro")
      ) {
        return false
      }

      if (
        question.id === "impacto_sintomas_relacionamento" &&
        showOtherRelationshipImpactInput &&
        !isStepValid("impacto_sintomas_relacionamento_outro")
      ) {
        return false
      }

      return false
    },
    [
      currentStep,
      respostas,
      finalQuestions,
      showOtherMainSymptomInput,
      showOtherSymptomsInput,
      showOtherImpactInput,
      showOtherRelationshipImpactInput,
    ],
  )

  const handleNext = useCallback(() => {
    const question = finalQuestions[currentStep - 1]

    if (question?.id === "valor_disposto_pagar") {
      setShowGratificationMessage(true)
    }

    if (currentStep < totalSteps) {
      let nextStep = currentStep + 1

      // Se a pergunta atual é sobre estado civil e a resposta é "Não", pule a pergunta de impacto no relacionamento
      if (question?.id === "estado_civil" && respostas.estado_civil?.value === "Não") {
        const nextQuestion = finalQuestions[nextStep - 1]
        if (nextQuestion?.id === "impacto_sintomas_relacionamento") {
          nextStep = nextStep + 1 // Pula a pergunta de impacto no relacionamento
        }
      }

      setCurrentStep(nextStep)
      setQuestionStartTime(Date.now())
    } else {
      finalizarQuestionario()
    }
  }, [currentStep, totalSteps, finalizarQuestionario, finalQuestions, respostas])

  // NEW: Efeito para auto-avançar perguntas de rádio
  useEffect(() => {
    const currentQuestion = finalQuestions[currentStep - 1]
    if (!currentQuestion) return

    // Only auto-advance for radio questions
    if (currentQuestion.type === "radio") {
      const answer = respostas[currentQuestion.id]?.value

      // Check if an answer exists and is not empty
      if (typeof answer === "string" && answer.trim().length > 0) {
        // Special case: if Q2 (principal_sintoma) and "Outros (especificar)" is selected, do not auto-advance
        if (currentQuestion.id === "principal_sintoma" && answer === "Outros (especificar)") {
          return
        }

        // Special case: if Q4 (outros_sintomas_incomodam) and "Outros (especificar)" is selected, do not auto-advance
        if (currentQuestion.id === "outros_sintomas_incomodam" && answer === "Outros (especificar)") {
          return
        }

        // Special case: if nova pergunta (impacto_sintomas_vida) and "Outros" is selected, do not auto-advance
        if (currentQuestion.id === "impacto_sintomas_vida" && answer === "Outros") {
          return
        }

        // Special case: if nova pergunta (impacto_sintomas_relacionamento) and "Outros" is selected, do not auto-advance
        if (currentQuestion.id === "impacto_sintomas_relacionamento" && answer === "Outros") {
          return
        }

        // Auto-advance for all other valid radio selections
        const timer = setTimeout(() => {
          handleNext()
        }, 200) // A small delay to allow UI to update
        return () => clearTimeout(timer)
      }
    }
  }, [respostas, currentStep, handleNext, finalQuestions])

  // Efeito para o timer (mantido para a lógica, mas não renderizado diretamente)
  useEffect(() => {
    if (showResult) return // Stop timer if results are shown

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [showResult])

  // Efeito para capturar tempo da tela final:
  useEffect(() => {
    if (showResult && finalScreenStartTime > 0) {
      const interval = setInterval(() => {
        setFinalScreenTime(Date.now() - finalScreenStartTime)
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [showResult, finalScreenStartTime])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleAnswer = (questionId: string, value: string | string[], isCheckbox?: boolean) => {
    const timeTaken = Date.now() - questionStartTime

    // Salvar tempo da pergunta atual
    setQuestionTimes((prev) => ({
      ...prev,
      [questionId]: timeTaken,
    }))

    setRespostas((prev) => {
      const updatedRespostas = { ...prev }

      if (isCheckbox) {
        const currentValues = Array.isArray(prev[questionId]?.value) ? (prev[questionId]!.value as string[]) : []
        const newValue = value as string
        const updatedValues = currentValues.includes(newValue)
          ? currentValues.filter((item) => item !== newValue)
          : [...currentValues, newValue]

        if (questionId === "outros_sintomas_incomodam") {
          const isOtherSelected = updatedValues.includes("Outros (especificar)")
          setShowOtherSymptomsInput(isOtherSelected)
          if (!isOtherSelected) {
            // Clear the text area value if "Outros" is deselected
            delete updatedRespostas.outros_sintomas_incomodam_outro
          }
        }
        updatedRespostas[questionId] = { value: updatedValues, timeTaken }
      } else {
        // Ensure value is always a string for text/textarea inputs
        const processedValue = typeof value === "string" ? value : String(value)

        if (questionId === "outros_sintomas_incomodam") {
          const isOtherSelected = value === "Outros (especificar)" // Mudado para comparação direta
          setShowOtherSymptomsInput(isOtherSelected)
          if (!isOtherSelected) {
            // Clear the text area value if "Outros" is deselected
            delete updatedRespostas.outros_sintomas_incomodam_outro
          }
        }

        if (questionId === "impacto_sintomas_vida") {
          const isOtherSelected = value === "Outros"
          setShowOtherImpactInput(isOtherSelected)
          if (!isOtherSelected) {
            // Clear the text area value if "Outros" is deselected
            delete updatedRespostas.impacto_sintomas_vida_outro
          }
        }

        if (questionId === "impacto_sintomas_relacionamento") {
          const isOtherSelected = value === "Outros"
          setShowOtherRelationshipImpactInput(isOtherSelected)
          if (!isOtherSelected) {
            // Clear the text area value if "Outros" is deselected
            delete updatedRespostas.impacto_sintomas_relacionamento_outro
          }
        }

        updatedRespostas[questionId] = { value: processedValue, timeTaken }
      }
      return updatedRespostas
    })
  }

  const renderCurrentQuestion = () => {
    const question = finalQuestions[currentStep - 1]
    if (!question) return null

    // Se a pergunta é sobre impacto no relacionamento e a pessoa não é casada, pule
    if (question.id === "impacto_sintomas_relacionamento" && respostas.estado_civil?.value === "Não") {
      // Auto-advance to next question
      setTimeout(() => handleNext(), 100)
      return null
    }

    const showNextButton =
      question.type !== "radio" ||
      (question.id === "principal_sintoma" && respostas.principal_sintoma?.value === "Outros (especificar)")

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="w-full bg-lilac-soft h-2 rounded-full">
          <div
            className="bg-gradient-to-r from-purple-primary to-lilac-soft h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <div className="flex items-center">
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-primary to-purple-medium flex items-center justify-center text-white font-poppins font-bold text-lg mr-4">
            {currentStep}
          </div>
          <h2 className="text-2xl font-poppins font-medium leading-tight flex-1 text-dark-purple-text">
            {question.label ? (
              <span className="text-dark-purple-text">{question.label}</span>
            ) : (
              <>
                <span className="text-dark-purple-text">{question.textInitial} </span>
                <span className="text-purple-primary font-bold">{question.textHighlight}</span>
                {question.textInitial2 && <span className="text-dark-purple-text"> {question.textInitial2}</span>}
              </>
            )}
            {question.emoji && <span className="ml-2 text-purple-primary font-bold">{question.emoji}</span>}
          </h2>
        </div>

        {question.type === "text" || question.type === "email" || question.type === "number" ? (
          <Input
            type={question.type === "number" ? "number" : question.type}
            placeholder={question.placeholder}
            value={(respostas[question.id]?.value as string) || ""}
            onChange={question.id === "whatsapp" ? handlePhoneChange : (e) => handleAnswer(question.id, e.target.value)}
            className="border-default-option-border focus:border-purple-primary focus:ring-purple-primary text-base p-4 font-poppins text-dark-purple-text"
            autoFocus
            min={question.min}
            max={question.max}
          />
        ) : question.type === "textarea" ? (
          <Textarea
            placeholder={question.placeholder}
            value={(respostas[question.id]?.value as string) || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="border-default-option-border focus:border-purple-primary focus:ring-purple-primary text-base p-4 min-h-[100px] font-poppins text-dark-purple-text"
            autoFocus
          />
        ) : question.type === "radio" ? (
          <>
            <RadioGroup
              onValueChange={(value) => handleAnswer(question.id, value)}
              value={(respostas[question.id]?.value as string) || ""}
              /* two-column layout for Q2 */
              className="space-y-3"
            >
              {question.options?.map((option, index) => {
                const optionText = typeof option === "string" ? option : option.text
                const isIntensidadeSintomaPrincipal = question.id === "intensidade_sintoma_principal"
                const isLeve = optionText.includes("Leve")
                const isModerado = optionText.includes("Moderada") || optionText.includes("Moderado")
                const isGrave = optionText.includes("Grave")

                return (
                  <div key={index} className="flex items-center">
                    <RadioGroupItem value={optionText} id={`${question.id}-${index}`} />
                    <Label
                      htmlFor={`${question.id}-${index}`}
                      className="ml-3 text-dark-purple-text text-base font-poppins flex-1 p-4 bg-white border border-default-option-border rounded-xl hover:border-purple-medium hover:shadow-sm hover:z-10 relative transition-all duration-200 cursor-pointer flex flex-col items-start data-[state=checked]:border-purple-primary data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-primary data-[state=checked]:to-purple-medium data-[state=checked]:text-white hover:bg-lavender-soft"
                    >
                      <span>{optionText}</span>
                      {isIntensidadeSintomaPrincipal && (isLeve || isModerado || isGrave) && (
                        <div className="mt-2 w-full flex items-center">
                          <div
                            className={cn(
                              "h-2 rounded-full",
                              isLeve && "w-1/3 bg-green-500",
                              isModerado && "w-2/3 bg-yellow-500",
                              isGrave && "w-full bg-red-500",
                            )}
                          />
                        </div>
                      )}
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
            {question.id === "principal_sintoma" && showOtherMainSymptomInput && (
              <div className="mt-4 space-y-2 animate-fadeIn">
                <Label htmlFor="principal_sintoma_outro" className="block text-sm font-mulish text-dark-purple-text">
                  Por favor, especifique seu principal sintoma:
                </Label>
                <Textarea
                  id="principal_sintoma_outro"
                  placeholder="Ex: 'Dores de cabeça frequentes', 'Problemas digestivos'"
                  value={(respostas.principal_sintoma_outro?.value as string) || ""}
                  onChange={(e) => handleAnswer("principal_sintoma_outro", e.target.value)}
                  className="border-default-option-border focus:border-purple-primary focus:ring-purple-primary text-base p-4 min-h-[80px] font-poppins text-dark-purple-text"
                />
              </div>
            )}
            {question.id === "outros_sintomas_incomodam" && showOtherSymptomsInput && (
              <div className="mt-4 space-y-2 animate-fadeIn">
                <Label
                  htmlFor="outros_sintomas_incomodam_outro"
                  className="block text-sm font-mulish text-dark-purple-text"
                >
                  Por favor, especifique outros sintomas que te incomodam:
                </Label>
                <Textarea
                  id="outros_sintomas_incomodam_outro"
                  placeholder="Ex: 'Dores de cabeça frequentes', 'Problemas digestivos'"
                  value={(respostas.outros_sintomas_incomodam_outro?.value as string) || ""}
                  onChange={(e) => handleAnswer("outros_sintomas_incomodam_outro", e.target.value)}
                  className="border-default-option-border focus:border-purple-primary focus:ring-purple-primary text-base p-4 min-h-[80px] font-poppins text-dark-purple-text"
                />
              </div>
            )}
            {question.id === "impacto_sintomas_vida" && showOtherImpactInput && (
              <div className="mt-4 space-y-2 animate-fadeIn">
                <Label
                  htmlFor="impacto_sintomas_vida_outro"
                  className="block text-sm font-mulish text-dark-purple-text"
                >
                  Por favor, especifique como os sintomas impactam na sua vida:
                </Label>
                <Textarea
                  id="impacto_sintomas_vida_outro"
                  placeholder="Ex: 'Não consigo dormir direito', 'Afeta meu trabalho', 'Prejudica meus relacionamentos'"
                  value={(respostas.impacto_sintomas_vida_outro?.value as string) || ""}
                  onChange={(e) => handleAnswer("impacto_sintomas_vida_outro", e.target.value)}
                  className="border-default-option-border focus:border-purple-primary focus:ring-purple-primary text-base p-4 min-h-[80px] font-poppins text-dark-purple-text"
                />
              </div>
            )}
            {question.id === "impacto_sintomas_relacionamento" && showOtherRelationshipImpactInput && (
              <div className="mt-4 space-y-2 animate-fadeIn">
                <Label
                  htmlFor="impacto_sintomas_relacionamento_outro"
                  className="block text-sm font-mulish text-dark-purple-text"
                >
                  Por favor, especifique como os sintomas impactam no seu relacionamento:
                </Label>
                <Textarea
                  id="impacto_sintomas_relacionamento_outro"
                  placeholder="Ex: 'Não tenho mais vontade de intimidade', 'Fico irritada com meu parceiro', 'Evito sair juntos'"
                  value={(respostas.impacto_sintomas_relacionamento_outro?.value as string) || ""}
                  onChange={(e) => handleAnswer("impacto_sintomas_relacionamento_outro", e.target.value)}
                  className="border-default-option-border focus:border-purple-primary focus:ring-purple-primary text-base p-4 min-h-[80px] font-poppins text-dark-purple-text"
                />
              </div>
            )}
          </>
        ) : null}

        {/* Gratification Message for Q11 */}
        {question.id === "valor_disposto_pagar" && showGratificationMessage && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 font-poppins text-sm animate-fadeIn">
            <CheckCircle className="inline-block w-4 h-4 mr-2" />
            Excelente escolha, estamos juntos com você para resolver esses sintomas.
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleNext}
            className="bg-purple-primary hover:bg-purple-primary/90 text-white shadow-md px-8 ml-auto font-poppins font-medium"
            disabled={
              !isStepValid(question.id) ||
              (question.id === "outros_sintomas_incomodam" &&
                showOtherSymptomsInput &&
                !isStepValid("outros_sintomas_incomodam_outro")) ||
              (question.id === "impacto_sintomas_vida" &&
                showOtherImpactInput &&
                !isStepValid("impacto_sintomas_vida_outro")) ||
              (question.id === "impacto_sintomas_relacionamento" &&
                showOtherRelationshipImpactInput &&
                !isStepValid("impacto_sintomas_relacionamento_outro"))
            }
          >
            {currentStep === totalSteps ? "Finalizar Avaliação" : "Próximo"}
          </Button>
        </div>
      </div>
    )
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value)
    handleAnswer("whatsapp", formattedValue)
  }

  const formatPhoneNumber = (value: string) => {
    if (!value) return value
    const phoneNumber = value.replace(/\D/g, "")
    let formattedNumber = ""
    if (phoneNumber.length > 0) {
      formattedNumber = `(${phoneNumber.substring(0, 2)}`
      if (phoneNumber.length > 2) {
        formattedNumber += `) ${phoneNumber.substring(2, 7)}`
        if (phoneNumber.length > 7) {
          formattedNumber += `-${phoneNumber.substring(7, 11)}`
        }
      }
    }
    return formattedNumber
  }

  if (showResult) {
    const healthReportData = generateHealthReport(respostas)

    return (
      <>
        <ResultadoFinal webhookStatus={webhookStatus} healthReport={healthReportData} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-primary to-lavender-soft flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg border border-purple-medium bg-white rounded-2xl">
        <CardHeader className="text-center pb-4 px-6">
          <CardTitle className="text-2xl md:text-3xl font-poppins text-purple-primary mb-0 tracking-tight">
            MENOPAUSA CANCELADA
          </CardTitle>
          <p className="text-base font-poppins font-medium text-purple-medium mb-3">
            Avaliação gratuita por tempo limitado
          </p>
          <div className="bg-gradient-to-r from-darker-purple-start to-darker-purple-end p-2 rounded-lg border border-purple-medium mx-auto max-w-fit mb-4">
            <div className="text-white font-poppins font-medium text-sm text-center animate-blink-pulse whitespace-nowrap">
              ⏰ Avaliação GRATUITA Últimas 12h
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-8">{renderCurrentQuestion()}</CardContent>
      </Card>
    </div>
  )
}

function ResultadoFinal({
  webhookStatus,
  healthReport,
}: {
  webhookStatus?: { success: boolean; message: string; fallbackUsed?: boolean }
  healthReport: HealthReportContent
}) {
  return (
    <div className="min-h-screen bg-lilac-soft flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <Card className="shadow-lg border-0 bg-white rounded-2xl">
          <div className="w-full bg-lilac-soft h-2 rounded-t-2xl">
            <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-t-2xl w-full" />
          </div>

          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-poppins font-medium text-dark-purple-text mb-2">
                RESULTADO PRELIMINAR DA SUA AVALIAÇÃO
              </h2>

              {webhookStatus && (
                <div className={`mt-2 text-sm ${webhookStatus.success ? "text-green-600" : "text-amber-600"}`}>
                  {webhookStatus.message}
                </div>
              )}
            </div>

            {/* Bloco 1: Análise do Seu Caso */}
            <div className="mb-6 p-4 bg-lilac-soft rounded-xl border-l-4 border-purple-primary">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-primary rounded-lg flex items-center justify-center mr-3">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-poppins font-medium text-dark-purple-text">Análise do Seu Caso</h3>
              </div>
              <p className="text-dark-purple-text text-sm leading-relaxed mb-3 font-poppins">
                {healthReport.mainMessage}
              </p>

              <div className="bg-purple-primary/10 p-3 rounded-lg border border-purple-primary/20">
                <p className="text-purple-primary text-sm leading-relaxed font-poppins">{healthReport.urgentMessage}</p>
              </div>
            </div>

            {/* Bloco 3: Seus Próximos Passos */}
            <div className="mb-6 p-4 bg-lilac-soft rounded-xl border-l-4 border-purple-primary">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-primary rounded-lg flex items-center justify-center mr-3">
                  <CalendarDays className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-poppins font-medium text-dark-purple-text">Seus Próximos Passos</h3>
              </div>
              <p className="text-dark-purple-text text-sm leading-relaxed font-poppins">
                Devido à intensidade dos sintomas relatados, você pode receber{" "}
                <span className="font-poppins font-semibold">prioridade</span> no atendimento durante o evento.
                <br />
                <br />
                Uma das nossas especialistas pode entrar em contato com você para explicar, de forma acolhedora, segura
                e sigilosa, como funciona o Acompanhamento Menopausa Cancelada.
              </p>
            </div>

            {/* Botão CTA */}
            <div className="text-center">
              <Button className="w-full bg-purple-primary text-white hover:bg-purple-primary/90 py-4 text-lg font-poppins font-medium shadow-md rounded-xl flex items-center justify-center">
                <CalendarDays className="w-5 h-5 mr-2" /> Quero entrar na lista VIP do evento
              </Button>
            </div>

            {/* Rodapé */}
            <div className="mt-6 text-center text-xs text-dark-purple-text font-poppins">
              <span className="font-poppins font-medium">⭐ Importante:</span> Este é um resultado preliminar com base
              nas suas respostas. Você está no caminho certo para transformar sua saúde e sua vida.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Função para recuperar dados salvos (para debug ou reenvio)
function recuperarDadosLocais() {
  try {
    const dados = localStorage.getItem("menopausa_dados_backup")
    const historico = localStorage.getItem("menopausa_historico")

    console.log("📁 Dados salvos localmente:", dados ? JSON.parse(dados) : null)
    console.log("📚 Histórico de leads:", historico ? JSON.parse(historico) : [])

    return {
      dadosAtuais: dados ? JSON.parse(dados) : null,
      historico: historico ? JSON.parse(historico) : [],
    }
  } catch (error) {
    console.error("Erro ao recuperar dados locais:", error)
    return { dadosAtuais: null, historico: [] }
  }
}
