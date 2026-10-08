import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, AlertCircle, Volume2, X } from 'lucide-react'

/**
 * Componente de Entrada por Voz (Speech-to-Text) com Web Speech API
 * Suporta Desktop e Navegadores Mobile (Android / iOS)
 * 
 * @param {Object} props
 * @param {(text: string) => void} props.onTranscript - Callback disparado quando a transcrição for concluída
 * @param {boolean} [props.disabled=false] - Desabilita o botão se o chat estiver processando
 * @param {string} [props.className] - Classes CSS extras opcionais
 */
export default function VoiceInput({ onTranscript, disabled = false, className = '' }) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSupported, setIsSupported] = useState(true)

  const recognitionRef = useRef(null)

  // Verifica compatibilidade com Web Speech API no navegador
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
    }
  }, [])

  // Limpeza no unmount para não deixar o microfone preso aberto
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          // Silencia erro ao abortar no cleanup
        }
      }
    }
  }, [])

  // Inicia ou Interrompe a escuta por voz
  const toggleListening = useCallback(() => {
    if (disabled) return

    // Limpa erros anteriores
    setErrorMessage('')

    // Se já estiver ouvindo, para a gravação
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.warn('[VoiceInput] Erro ao parar reconhecimento:', e)
        }
      }
      setIsListening(false)
      return
    }

    // 1. Valida suporte do navegador
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setErrorMessage('Seu navegador não suporta reconhecimento de voz. Recomendamos o Google Chrome ou Safari atualizados.')
      return
    }

    // 2. Valida contexto seguro (HTTPS ou Localhost no mobile)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const isSecure = window.isSecureContext || window.location.protocol === 'https:' || isLocalhost
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (isMobile && !isSecure) {
      setErrorMessage(
        '⚠️ No celular, o microfone exige HTTPS seguro. Use o túnel do Localtunnel/ngrok (https://) para testar no smartphone.'
      )
      return
    }

    try {
      // 3. Instancia o reconhecedor de voz
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      // Configurações otimizadas para estabilidade em mobile e desktop
      recognition.lang = 'pt-BR'
      recognition.continuous = false // Modo de frase única para maior precisão mobile
      recognition.interimResults = true // Mostra feedback em tempo real enquanto fala
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setInterimText('')
        setErrorMessage('')
      }

      recognition.onresult = (event) => {
        let currentInterim = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i]
          const transcriptChunk = item[0]?.transcript || ''
          
          if (item.isFinal) {
            finalTranscript += transcriptChunk
          } else {
            currentInterim += transcriptChunk
          }
        }

        if (currentInterim) {
          setInterimText(currentInterim)
        }

        if (finalTranscript.trim()) {
          setIsListening(false)
          setInterimText('')
          if (typeof onTranscript === 'function') {
            onTranscript(finalTranscript.trim())
          }
        }
      }

      recognition.onerror = (event) => {
        console.warn('[VoiceInput] Erro de reconhecimento:', event.error)
        setIsListening(false)
        setInterimText('')

        switch (event.error) {
          case 'not-allowed':
          case 'service-not-allowed':
            setErrorMessage(
              'Permissão de microfone negada. Toque no cadeado da barra de endereço para permitir o microfone.'
            )
            break
          case 'no-speech':
            setErrorMessage('Nenhuma fala foi detectada. Tente falar mais perto do microfone.')
            break
          case 'network':
            setErrorMessage('Erro de conexão de rede durante o reconhecimento de fala.')
            break
          case 'audio-capture':
            setErrorMessage('Nenhum microfone encontrado ou conectado no seu dispositivo.')
            break
          case 'aborted':
            // Ignora cancelamentos intencionais do usuário
            break
          default:
            setErrorMessage(`Erro no microfone (${event.error}). Tente novamente.`)
            break
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        setInterimText('')
      }

      // Inicia a captura
      recognition.start()
    } catch (err) {
      console.error('[VoiceInput] Falha ao iniciar SpeechRecognition:', err)
      setIsListening(false)
      setErrorMessage('Não foi possível iniciar o microfone. Verifique as permissões do seu navegador.')
    }
  }, [disabled, isListening, onTranscript])

  const dismissError = () => {
    setErrorMessage('')
  }

  const isMobileDevice = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  return (
    <>
      {/* Botão de Microfone Principal */}
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled || !isSupported}
        className={`mic-btn ${isListening ? 'recording' : ''} ${className}`}
        title={
          !isSupported
            ? 'Navegador incompatível com Web Speech'
            : isListening
            ? 'Clique para parar a gravação'
            : 'Falar por voz (Speech-to-Text)'
        }
        aria-label="Entrada por voz"
      >
        {isListening ? (
          <Mic className="icon-pulse" size={20} />
        ) : (
          <Mic size={20} />
        )}
      </button>

      {/* Indicador Flutuante / Overlay durante a Escuta Ativa */}
      {isListening && (
        <div className="voice-overlay" onClick={toggleListening} role="dialog" aria-modal="true">
          <div className="voice-modal" onClick={(e) => e.stopPropagation()}>
            <div className="voice-waves">
              <span className="voice-bar bar-1"></span>
              <span className="voice-bar bar-2"></span>
              <span className="voice-bar bar-3"></span>
              <span className="voice-bar bar-4"></span>
              <span className="voice-bar bar-5"></span>
            </div>

            <div className="voice-text-info">
              <h3>
                <Volume2 size={18} className="voice-icon-live" />
                {isMobileDevice ? 'Ouvindo no celular... Fale agora!' : 'Ouvindo... Fale agora!'}
              </h3>
              <p className="voice-interim">
                {interimText ? `"${interimText}"` : 'Aguardando sua voz em português (pt-BR)...'}
              </p>
            </div>

            <button
              type="button"
              className="voice-stop-btn"
              onClick={toggleListening}
            >
              <MicOff size={16} /> Parar Gravação
            </button>
          </div>
        </div>
      )}

      {/* Toast / Alerta de Erro Amigável */}
      {errorMessage && (
        <div className="voice-toast-error" role="alert">
          <AlertCircle size={18} className="toast-icon" />
          <span className="toast-msg">{errorMessage}</span>
          <button
            type="button"
            className="toast-close"
            onClick={dismissError}
            aria-label="Fechar aviso"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  )
}
