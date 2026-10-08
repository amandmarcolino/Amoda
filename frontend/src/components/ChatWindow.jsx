import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Send,
  Download,
  Bot,
  User,
  Sparkles,
  Zap,
  HelpCircle,
  Clock,
  Volume2,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Award,
  Cpu,
  RefreshCw,
  ShoppingBag,
  Flame,
  Ruler,
  Shirt,
  PackageSearch
} from 'lucide-react'
import FormattedMessage from './FormattedMessage'
import VoiceInput from './VoiceInput'
import TypingIndicator from './TypingIndicator'
import { sendChatMessage, sendFeedback, API_BASE_URL } from '../services/api'

/**
 * Componente Principal da Janela de Chat (ChatWindow.jsx)
 * Responsável por:
 * 1. Histórico de mensagens e mensagem inicial de boas-vindas.
 * 2. Integração com FastAPI (POST /api/chat).
 * 3. Indicador animado de carregamento ("IA digitando...").
 * 4. Integração com VoiceInput para preenchimento e envio por voz.
 * 5. Chips interativos com perguntas frequentes (suggested_actions).
 * 6. Botões de Like / Dislike (POST /api/feedback).
 * 7. Barra de métricas no topo (Total de mensagens, Satisfação %, Modo LLM/RAG).
 * 8. Exportação do histórico da conversa em arquivo .txt.
 * 9. Auto-scroll suave com useRef.
 */
export default function ChatWindow({
  speechEnabled = true,
  onOpenStore = null
}) {
  // 1. Mensagem de Boas-Vindas Inicial
  const WELCOME_MESSAGE = {
    id: 'welcome-msg',
    sender: 'bot',
    text: `Olá! Seja muito bem-vinda à **Amoda**! 🌸✨\n\nEu sou a **Sofia**, sua consultora virtual de moda feminina. Estou aqui para te ajudar a encontrar o look ideal para qualquer ocasião, dar sugestões de tamanhos e tecidos, ou tirar dúvidas sobre pagamentos e pedidos.\n\nComo posso te ajudar hoje? 💕`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    source: 'saudacao',
    confidence: 1.0,
    suggestedActions: [
      'Ver novidades da coleção',
      'Vestidos para casamento e festa',
      'Montar look elegante para trabalho',
      'Tabela de medidas e tamanhos',
      'Formas de pagamento e frete'
    ]
  }

  // Estados da Sessão e Mensagens
  const [sessionId] = useState(() => 'amoda_' + Math.random().toString(36).substring(2, 9))
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestedActions, setSuggestedActions] = useState(WELCOME_MESSAGE.suggestedActions)
  
  // Feedback e Áudio
  const [feedbackState, setFeedbackState] = useState({})
  const [copiedId, setCopiedId] = useState(null)
  const [speakingId, setSpeakingId] = useState(null)
  const [lastMode, setLastMode] = useState('LLM Ativa / RAG Conectado')

  // Refs para Scroll e Input
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // 8. Auto-scroll suave sempre para a última mensagem
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // 6. Cálculo das Métricas da Barra do Topo
  const totalMessagesCount = messages.length
  const positiveFeedbacks = Object.values(feedbackState).filter((v) => v === 'like').length
  const totalFeedbacks = Object.keys(feedbackState).length
  const satisfactionRate = totalFeedbacks > 0
    ? Math.round((positiveFeedbacks / totalFeedbacks) * 100)
    : 100

  // 2. Envio de Mensagem para o Backend FastAPI
  const handleSendMessage = async (textToSend = null) => {
    const query = (textToSend || inputMessage).trim()
    if (!query || isLoading) return

    const userMsgId = 'user-' + Date.now()
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: userTimestamp
    }

    // Adiciona mensagem do usuário ao histórico
    setMessages((prev) => [...prev, userMsg])
    setInputMessage('')
    setIsLoading(true)

    try {
      const data = await sendChatMessage(query, sessionId)
      
      const botMsg = {
        id: 'bot-' + Date.now(),
        messageId: data.message_id,
        sender: 'bot',
        text: data.reply || data.response || 'Desculpe, não consegui processar a resposta.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'llm',
        confidence: data.confidence || 0.95,
        suggestedActions: data.suggested_actions || []
      }

      setMessages((prev) => [...prev, botMsg])

      // Atualiza modo de operação na métrica
      if (data.source === 'llm') {
        setLastMode('Groq LLM (Llama-3)')
      } else if (data.source === 'base_conhecimento') {
        setLastMode('RAG Catálogo Amoda')
      } else if (data.source === 'pedido') {
        setLastMode('Rastreamento de Pedido')
      } else {
        setLastMode('Atendimento Direto')
      }

      // 4. Atualiza chips de ações sugeridas retornadas pela API
      if (data.suggested_actions && data.suggested_actions.length > 0) {
        setSuggestedActions(data.suggested_actions)
      }

      // Reproduz síntese de áudio caso ativado
      if (speechEnabled && window.speechSynthesis && botMsg.text) {
        speakResponse(botMsg.text, botMsg.id)
      }
    } catch (error) {
      console.error('[ChatWindow] Erro ao enviar mensagem:', error)
      const errorMsg = {
        id: 'error-' + Date.now(),
        sender: 'bot',
        text: '⚠️ Não foi possível conectar ao servidor da Amoda no momento. Verifique se o backend está ativo.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'fallback',
        confidence: 0.0
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
  }

  // 3. Integração com VoiceInput
  const handleVoiceTranscript = (transcript) => {
    if (transcript) {
      setInputMessage(transcript)
      handleSendMessage(transcript)
    }
  }

  // 5. Envio de Feedback (Like / Dislike)
  const handleFeedback = async (messageId, isLike) => {
    if (!messageId) return
    const current = feedbackState[messageId]
    const nextFeedback = isLike ? (current === 'like' ? null : 'like') : (current === 'dislike' ? null : 'dislike')

    setFeedbackState((prev) => ({
      ...prev,
      [messageId]: nextFeedback
    }))

    if (nextFeedback) {
      await sendFeedback(messageId, nextFeedback === 'like')
    }
  }

  // Copiar Texto
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Síntese de Fala (TTS)
  const speakResponse = (text, id) => {
    if (!window.speechSynthesis) return

    if (speakingId === id) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }

    window.speechSynthesis.cancel()
    const cleanText = text.replace(/[*#_`~\[\]\(\)]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'pt-BR'
    utterance.rate = 1.05

    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)

    setSpeakingId(id)
    window.speechSynthesis.speak(utterance)
  }

  // 7. Exportar Histórico da Conversa em .txt
  const exportChatHistory = () => {
    const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')
    let logContent = `====================================================\n`
    logContent += `  AMODA — HISTÓRICO DE ATENDIMENTO COM SOFIA IA\n`
    logContent += `  Data: ${new Date().toLocaleString('pt-BR')}\n`
    logContent += `  Sessão ID: ${sessionId}\n`
    logContent += `====================================================\n\n`

    messages.forEach((msg) => {
      const senderName = msg.sender === 'bot' ? 'Sofia (Consultora Amoda)' : 'Cliente'
      logContent += `[${msg.timestamp}] ${senderName}:\n${msg.text}\n\n`
    })

    const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `atendimento-amoda-${dateStr}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="chat-window-wrapper">
      {/* 6. BARRA DE MÉTRICAS NO TOPO */}
      <div className="chat-metrics-bar">
        <div className="metric-item" title="Total de mensagens enviadas e recebidas nesta sessão">
          <Activity size={14} className="metric-icon" />
          <span className="metric-label">Mensagens:</span>
          <span className="metric-value">{totalMessagesCount}</span>
        </div>

        <div className="metric-item" title="Índice de satisfação baseado nas avaliações">
          <Award size={14} className="metric-icon" />
          <span className="metric-label">Satisfação:</span>
          <span className="metric-value">{satisfactionRate}%</span>
        </div>

        <div className="metric-item" title="Motor ativo de processamento de respostas">
          <Cpu size={14} className="metric-icon" />
          <span className="metric-label">Modo:</span>
          <span className="metric-value mode-badge">{lastMode}</span>
        </div>

        {/* 7. BOTÃO PARA EXPORTAR HISTÓRICO EM .TXT */}
        <button
          type="button"
          className="btn-export-chat"
          onClick={exportChatHistory}
          title="Baixar histórico do atendimento em arquivo de texto (.txt)"
        >
          <Download size={13} />
          <span>Exportar Histórico</span>
        </button>
      </div>

      {/* 1. CONTAINER DE MENSAGENS / HISTÓRICO */}
      <div className="messages-container">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot'
          return (
            <div key={msg.id} className={`message-row ${msg.sender}`}>
              <div className="message-avatar">
                {isBot ? <Bot size={18} /> : <User size={18} />}
              </div>

              <div className="message-content">
                <div className="message-bubble">
                  {isBot ? (
                    <FormattedMessage content={msg.text} />
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>

                <div className="message-meta">
                  <span className="message-time">
                    <Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                    {msg.timestamp}
                  </span>

                  {isBot && msg.source && (
                    <span className="source-badge">
                      {msg.source === 'llm' ? <Sparkles size={11} /> : <Zap size={11} />}
                      {msg.source === 'llm' ? 'Groq IA' : 'Base RAG'} • {Math.round((msg.confidence || 1) * 100)}%
                    </span>
                  )}

                  {isBot && (
                    <div className="message-actions">
                      {/* Ouvir Áudio */}
                      <button
                        type="button"
                        className={`action-btn ${speakingId === msg.id ? 'active-like' : ''}`}
                        onClick={() => speakResponse(msg.text, msg.id)}
                        title="Ouvir resposta"
                      >
                        <Volume2 size={13} />
                      </button>

                      {/* Copiar */}
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => handleCopy(msg.text, msg.id)}
                        title="Copiar texto"
                      >
                        {copiedId === msg.id ? <Check size={13} color="#15803d" /> : <Copy size={13} />}
                      </button>

                      {/* 5. Feedback Like / Dislike */}
                      {msg.messageId && (
                        <>
                          <button
                            type="button"
                            className={`action-btn ${feedbackState[msg.messageId] === 'like' ? 'active-like' : ''}`}
                            onClick={() => handleFeedback(msg.messageId, true)}
                            title="Gostei da resposta"
                          >
                            <ThumbsUp size={13} />
                          </button>
                          <button
                            type="button"
                            className={`action-btn ${feedbackState[msg.messageId] === 'dislike' ? 'active-dislike' : ''}`}
                            onClick={() => handleFeedback(msg.messageId, false)}
                            title="Não gostei da resposta"
                          >
                            <ThumbsDown size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* 2. Indicador Animado ("IA digitando...") */}
        {isLoading && <TypingIndicator />}

        {/* 8. Ref para Rolagem Automática */}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. CHIPS DE SUGESTÕES RETORNADOS PELA API */}
      {suggestedActions && suggestedActions.length > 0 && (
        <div className="quick-chips-wrapper">
          <div className="chips-scroll-container">
            {suggestedActions.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className="chip-btn"
                onClick={() => handleSendMessage(chip)}
                disabled={isLoading}
              >
                <Sparkles size={12} />
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. BARRA DE INPUT, VOZ E ENVIO */}
      <footer className="chat-input-area">
        <form
          className="input-form"
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Digite sua dúvida ou look desejado..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
          />

          <div className="input-btn-group">
            {/* Componente de Entrada por Voz */}
            <VoiceInput
              onTranscript={handleVoiceTranscript}
              disabled={isLoading}
            />

            {/* Botão de Envio */}
            <button
              type="submit"
              className="send-btn"
              disabled={!inputMessage.trim() || isLoading}
              title="Enviar mensagem (Enter)"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </footer>
    </div>
  )
}
