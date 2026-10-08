/**
 * Serviço de Conexão com a API REST da Amoda
 * Projeto: Amoda — Consultoria de Moda Feminina com IA & Voz
 */

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000'

/**
 * Envia uma mensagem para a consultora virtual Sofia no backend
 * @param {string} message - Texto digitado pela cliente
 * @param {string} sessionId - Identificador da sessão
 * @returns {Promise<{ reply: string, source: string, confidence: number, message_id: string, suggested_actions: string[] }>}
 */
export async function sendChatMessage(message, sessionId) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: message.trim(),
      session_id: sessionId
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || `Erro no servidor (${response.status})`)
  }

  return await response.json()
}

/**
 * Busca o catálogo de produtos cadastrados na Amoda
 * @param {string} [category] - Categoria opcional para filtro
 * @param {boolean} [onlyNew] - Se true, retorna apenas novidades
 * @returns {Promise<{ total: number, produtos: Array }>}
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
    console.warn('[API] Falha ao buscar produtos da API, usando dados locais:', err)
  }

  return { total: 0, produtos: [] }
}

/**
 * Consulta status de um pedido específico
 * @param {string} orderId - Código do pedido (ex: PED-1048)
 */
export async function fetchOrderStatus(orderId) {
  const response = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(orderId.trim())}`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Pedido não encontrado.')
  }
  return await response.json()
}

/**
 * Verifica status de saúde do backend
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
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
  } catch (err) {
    console.warn('[API Service] Falha ao consultar métricas:', err)
  }
  return null
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
  } catch (err) {
    console.warn('[API Service] Falha ao registrar feedback:', err)
    return false
  }
}

/**
 * Limpa sessão do backend
 */
export async function clearSessionHistory(sessionId) {
  try {
    await fetch(`${API_BASE_URL}/api/history/${sessionId}`, {
      method: 'DELETE'
    })
  } catch (err) {
    console.warn('[API Service] Falha ao limpar sessão:', err)
  }
}

export { API_BASE_URL }
