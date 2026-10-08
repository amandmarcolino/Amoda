import { useState, useEffect, useRef, useCallback } from 'react'
import { sendChatMessage, checkBackendHealth, sendFeedback, clearSessionHistory } from '../services/api'

// Botões de Acesso Rápido Oficiais da Amoda
export const AMODA_QUICK_ACTIONS = [
  'Ver produtos',
  'Novidades',
  'Encontrar meu tamanho',
  'Montar um look',
  'Dúvidas sobre pedidos'
]

export function useChat() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(() => 'amoda_' + Math.random().toString(36).substring(2, 9))
  const [apiOnline, setApiOnline] = useState(true)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState(null)
  const [copiedMessageId, setCopiedMessageId] = useState(null)
  const [suggestedChips, setSuggestedChips] = useState(AMODA_QUICK_ACTIONS)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Rolagem suave para a mensagem mais recente
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // Verificação de saúde da API
  useEffect(() => {
    const verifyHealth = async () => {
      const isHealthy = await checkBackendHealth()
      setApiOnline(isHealthy)
    }

    verifyHealth()
    const interval = setInterval(verifyHealth, 15000)
    return () => clearInterval(interval)
  }, [])

  // Síntese de Voz (Text-to-Speech)
  const speakText = useCallback((text, messageId = null) => {
    if (!('speechSynthesis' in window)) return

    if (window.speechSynthesis.speaking && speakingMessageId === messageId) {
      window.speechSynthesis.cancel()
      setSpeakingMessageId(null)
      return
    }

    window.speechSynthesis.cancel()

    const plainText = text
      .replace(/#+\s/g, '')
      .replace(/[*_`~>]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/```[\s\S]*?```/g, 'Bloco de código omitido na leitura.')
      .trim()

    const utterance = new SpeechSynthesisUtterance(plainText)
    utterance.lang = 'pt-BR'
    utterance.rate = 1.05
    utterance.pitch = 1.05

    const voices = window.speechSynthesis.getVoices()
    const ptVoice = voices.find(v => v.lang.includes('pt-BR') || v.lang.includes('pt_BR'))
    if (ptVoice) {
      utterance.voice = ptVoice
    }

    utterance.onstart = () => {
      if (messageId) setSpeakingMessageId(messageId)
    }

    utterance.onend = () => setSpeakingMessageId(null)
    utterance.onerror = () => setSpeakingMessageId(null)

    window.speechSynthesis.speak(utterance)
  }, [speakingMessageId])

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Enviar Mensagem
  const sendMessage = async (textToSend) => {
    const text = (textToSend !== undefined ? textToSend : inputMessage).trim()
    if (!text || isLoading) return

    const userMessage = {
      id: 'msg_' + Date.now(),
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const data = await sendChatMessage(text, sessionId)

      const botMessage = {
        id: 'msg_' + Date.now(),
        text: data.reply || 'Desculpe, não consegui obter uma resposta.',
        sender: 'bot',
        source: data.source || 'sistema',
        confidence: data.confidence || 1.0,
        messageId: data.message_id,
        feedback: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, botMessage])
      setApiOnline(true)

      if (data.suggested_actions && data.suggested_actions.length > 0) {
        setSuggestedChips(data.suggested_actions)
      }

      if (speechEnabled) {
        speakText(botMessage.text, botMessage.id)
      }
    } catch (error) {
      console.error('[useChat] Erro ao comunicar com a IA Sofia:', error)
      const errorMessage = {
        id: 'err_' + Date.now(),
        text: '❌ **Não foi possível conectar com a consultora Sofia no momento.** Por favor, verifique se o servidor da Amoda está online ou tente novamente em instantes.',
        sender: 'bot',
        source: 'erro',
        confidence: 0,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }

  // Nova Conversa
  const startNewConversation = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    clearSessionHistory(sessionId)
    setSessionId('amoda_' + Math.random().toString(36).substring(2, 9))
    setMessages([])
    setSuggestedChips(AMODA_QUICK_ACTIONS)
    setInputMessage('')
    setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
  }

  // Copiar Mensagem
  const copyMessage = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedMessageId(id)
    setTimeout(() => setCopiedMessageId(null), 2000)
  }

  // Feedback
  const handleFeedback = async (messageId, isPositive) => {
    if (!messageId) return

    setMessages(prev =>
      prev.map(msg => {
        if (msg.messageId === messageId) {
          return { ...msg, feedback: isPositive ? 'like' : 'dislike' }
        }
        return msg
      })
    )

    await sendFeedback(messageId, isPositive)
  }

  return {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    apiOnline,
    speechEnabled,
    setSpeechEnabled,
    speakingMessageId,
    copiedMessageId,
    suggestedChips,
    messagesEndRef,
    inputRef,
    sendMessage,
    startNewConversation,
    speakText,
    copyMessage,
    handleFeedback
  }
}
