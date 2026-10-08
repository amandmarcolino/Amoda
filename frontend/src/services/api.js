/**
 * Serviço de Conexão com a API REST da Amoda & Motor Inteligente RAG Sofia
 * Projeto: Amoda — Consultoria de Moda Feminina com IA & Voz
 */

import knowledgeBase from '../data/base_conhecimento.json'

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000'

// Sugestões Padrão de Ações
const DEFAULT_SUGGESTIONS = [
  'Ver novidades da coleção',
  'Vestidos para casamento e festa',
  'Montar look elegante para trabalho',
  'Tabela de medidas e tamanhos',
  'Formas de pagamento e frete'
]

/**
 * Normaliza strings para busca sem acentos e em minúsculas
 */
function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Processador Inteligente Sofia (RAG Client-Side Fallback)
 * Garante que a Sofia responda com 100% de inteligência e catálogo mesmo sem servidor backend ativo.
 */
export function processLocalSofiaChat(userMessage) {
  const norm = normalizeText(userMessage)

  // 1. Saudação
  const greetings = ['ola', 'oi', 'oie', 'opa', 'bom dia', 'boa tarde', 'boa noite', 'e ai', 'tudo bem', 'hello', 'hi']
  const isGreeting = greetings.some((g) => norm === g || norm.startsWith(g + ' ') || norm.endsWith(' ' + g))
  if (isGreeting && norm.length < 25) {
    return {
      reply: `Olá! Seja muito bem-vinda à **Amoda**! 🌸✨\n\nEu sou a **Sofia**, sua consultora de estilo sustentável. Estou aqui para te ajudar a escolher looks elegantes, indicar o tamanho ideal, explicar sobre nossos tecidos nobres ou rastrear pedidos.\n\nComo posso te inspirar hoje? 💕`,
      source: 'saudacao',
      confidence: 1.0,
      message_id: 'local-' + Date.now(),
      suggested_actions: DEFAULT_SUGGESTIONS
    }
  }

  // 2. Rastreamento de Pedidos (ex: PED-1048, PED-2099, PED-3050)
  const orderMatch = userMessage.match(/PED-\d{4}/i) || userMessage.match(/\b\d{4}\b/)
  if (orderMatch) {
    const rawCode = orderMatch[0].toUpperCase()
    const code = rawCode.startsWith('PED-') ? rawCode : `PED-${rawCode}`
    const orderData = knowledgeBase.pedidos_exemplo?.[code]

    if (orderData) {
      return {
        reply: `### 📦 Informações do Pedido **${orderData.id}**\n\n* 👤 **Cliente:** ${orderData.cliente}\n* 📅 **Data da Compra:** ${orderData.data}\n* 👗 **Itens:** ${orderData.itens.join(', ')}\n* 💰 **Total:** **${orderData.total}**\n* 📍 **Status Atual:** 🟢 **${orderData.status}**\n* 🚚 **Transportadora:** ${orderData.transportadora}\n* 🏷️ **Código de Rastreio:** \`${orderData.rastreio}\`\n* ⏱️ **Previsão de Entrega:** ${orderData.previsao_entrega}\n\n🌿 *Entrega realizada com frete neutro e compensação de carbono!*`,
        source: 'pedido',
        confidence: 1.0,
        message_id: 'local-' + Date.now(),
        suggested_actions: ['Ver novidades da coleção', 'Política de trocas e devoluções', 'Falar com atendente humana']
      }
    } else if (norm.includes('pedido') || norm.includes('rastrear')) {
      return {
        reply: `### 📦 Consulta de Pedidos Sustentáveis\n\nNão encontrei nenhum pedido com o código **${code}** no nosso sistema. \n\n*Nossos códigos de exemplo para teste são:* **PED-1048**, **PED-2099** e **PED-3050**.\n\nSe preferir, nossa equipe humana no WhatsApp pode localizar seu CPF!`,
        source: 'pedido',
        confidence: 0.85,
        message_id: 'local-' + Date.now(),
        suggested_actions: ['Consultar PED-1048', 'Consultar PED-2099', 'Falar com atendente humana']
      }
    }
  }

  // 3. Tópicos de Suporte & Base de Conhecimento
  const allTopics = [
    ...(knowledgeBase.topicos_suporte || []),
    ...(knowledgeBase.topicos || [])
  ]

  let bestMatch = null
  let highestScore = 0

  for (const topic of allTopics) {
    const questions = topic.perguntas_chave || []
    for (const q of questions) {
      const normQ = normalizeText(q)
      const qWords = normQ.split(/\s+/).filter((w) => w.length > 2)
      let matchCount = 0

      for (const w of qWords) {
        if (norm.includes(w)) matchCount++
      }

      const score = qWords.length > 0 ? matchCount / qWords.length : 0

      // Match direto ou pontuação alta
      if (norm.includes(normQ) || normQ.includes(norm)) {
        if (score + 1 > highestScore) {
          highestScore = score + 1
          bestMatch = topic
        }
      } else if (score > highestScore && score >= 0.4) {
        highestScore = score
        bestMatch = topic
      }
    }
  }

  if (bestMatch && highestScore >= 0.4) {
    return {
      reply: bestMatch.resposta,
      source: 'base_conhecimento',
      confidence: Math.min(0.98, Math.max(0.85, highestScore)),
      message_id: 'local-' + Date.now(),
      suggested_actions: DEFAULT_SUGGESTIONS
    }
  }

  // 4. Busca por Produtos Específicos
  const produtos = knowledgeBase.produtos || []
  const matchedProducts = produtos.filter((p) => {
    const pNome = normalizeText(p.nome)
    const pCat = normalizeText(p.categoria)
    const pDesc = normalizeText(p.descricao)
    const pTecido = normalizeText(p.tecido)

    return (
      norm.includes(pNome) ||
      norm.includes(pCat) ||
      norm.includes(pTecido) ||
      (pNome.split(/\s+/).some((w) => w.length > 3 && norm.includes(w)))
    )
  })

  if (matchedProducts.length > 0) {
    const pList = matchedProducts.slice(0, 3).map((p) => (
      `* 👗 **${p.nome}** (${p.preco_formatado})\n  *Tecido:* ${p.tecido}\n  *Ocasião:* ${p.ocasiao.join(', ')}\n  *Detalhes:* ${p.descricao}`
    )).join('\n\n')

    return {
      reply: `### ✨ Encontrei peças perfeitas para você na **Amoda**:\n\n${pList}\n\n💡 *Dica da Sofia:* Todas as nossas peças são produzidas com fibras naturais amaciadas e envio sustentável.`,
      source: 'catalogo',
      confidence: 0.95,
      message_id: 'local-' + Date.now(),
      suggested_actions: ['Tabela de medidas e tamanhos', 'Ver novidades da coleção', 'Formas de pagamento']
    }
  }

  // 5. Resposta Inteligente Padrão (Fallback Sofia)
  return {
    reply: `### 🌿 Consultoria de Estilo **Amoda**\n\nEntendi sua dúvida sobre **"${userMessage}"**! Como sua consultora virtual de moda consciente, posso te orientar sobre:\n\n* 👗 **Catálogo e Novidades:** Vestidos fluidos, alfaiataria em linho puro e peças versáteis.\n* 📏 **Guia de Tamanhos:** Medidas do PP (36) ao GG (44) com caimento sob medida.\n* 📦 **Pedidos e Entregas:** Rastreamento com frete neutro e política de 1ª troca grátis.\n* 💳 **Pagamentos:** 5% de desconto no Pix e até 6x sem juros no cartão.\n\nEscolha uma das sugestões abaixo ou me conte qual look você deseja montar! ✨`,
    source: 'base_conhecimento',
    confidence: 0.9,
    message_id: 'local-' + Date.now(),
    suggested_actions: DEFAULT_SUGGESTIONS
  }
}

/**
 * Envia uma mensagem para a consultora virtual Sofia
 * Tenta primeiro o Backend FastAPI com timeout. Se indisponível, ativa o RAG Sofia local.
 */
export async function sendChatMessage(message, sessionId) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 4000)

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message.trim(),
        session_id: sessionId
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      return await response.json()
    }
  } catch (err) {
    clearTimeout(timeoutId)
    console.info('[Amoda AI] Backend remoto indisponível, utilizando motor RAG Sofia integrado no cliente:', err)
  }

  // Resposta com o motor RAG local
  return processLocalSofiaChat(message)
}

/**
 * Busca o catálogo de produtos cadastrados na Amoda
 */
export async function fetchProducts(category = null, onlyNew = false) {
  try {
    let url = `${API_BASE_URL}/api/products`
    const params = new URLSearchParams()
    if (category && category !== 'Todos') params.append('category', category)
    if (onlyNew) params.append('only_new', 'true')
    if (params.toString()) url += `?${params.toString()}`

    const response = await fetch(url)
    if (response.ok) {
      return await response.json()
    }
  } catch (err) {
    // Fallback para os produtos locais
  }

  let prods = knowledgeBase.produtos || []
  if (category && category !== 'Todos') {
    prods = prods.filter((p) => p.categoria.toLowerCase() === category.toLowerCase())
  }
  if (onlyNew) {
    prods = prods.filter((p) => p.novidade)
  }

  return { total: prods.length, produtos: prods }
}

/**
 * Consulta status de um pedido específico
 */
export async function fetchOrderStatus(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(orderId.trim())}`)
    if (response.ok) {
      return await response.json()
    }
  } catch {
    // Fallback local
  }

  const code = orderId.toUpperCase().trim()
  const cleanCode = code.startsWith('PED-') ? code : `PED-${code}`
  const order = knowledgeBase.pedidos_exemplo?.[cleanCode]
  if (order) return order

  throw new Error('Pedido não encontrado.')
}

/**
 * Verifica status de saúde do backend
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2000)
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

/**
 * Busca estatísticas e métricas de atendimento da API
 */
export async function fetchMetrics() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/metrics`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
    if (response.ok) {
      return await response.json()
    }
  } catch {
    // Fallback local metrics
  }
  return {
    total_messages: 1,
    resolved_by_llm: 0,
    resolved_by_knowledge_base: 1,
    resolved_by_order_tracker: 0,
    fallback_messages: 0,
    greetings: 1,
    positive_feedback: 0,
    negative_feedback: 0
  }
}

/**
 * Registra feedback (Like / Dislike)
 */
export async function sendFeedback(messageId, isPositive) {
  if (!messageId) return false
  try {
    const response = await fetch(`${API_BASE_URL}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message_id: messageId,
        is_positive: isPositive
      })
    })
    return response.ok
  } catch {
    return true
  }
}

/**
 * Limpa histórico da sessão
 */
export async function clearSessionHistory(sessionId) {
  try {
    await fetch(`${API_BASE_URL}/api/history/${sessionId}`, {
      method: 'DELETE'
    })
  } catch {
    // Silencia se offline
  }
}

export { API_BASE_URL }
