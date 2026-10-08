import { Send } from 'lucide-react'
import VoiceInput from './VoiceInput'

export default function ChatInput({
  inputMessage,
  setInputMessage,
  onSendMessage,
  onVoiceTranscript,
  isLoading,
  inputRef
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSendMessage()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  return (
    <footer className="chat-input-area">
      <form className="input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="chat-input"
          placeholder={isLoading ? 'Aguardando resposta da IA...' : 'Digite sua dúvida ou use o microfone...'}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          autoFocus
          aria-label="Mensagem do chat"
        />

        <div className="input-btn-group">
          {/* Componente de Reconhecimento de Voz (STT) */}
          <VoiceInput
            onTranscript={onVoiceTranscript}
            disabled={isLoading}
          />

          {/* Botão de Enviar (Clique ou Enter) */}
          <button
            type="submit"
            className="send-btn"
            disabled={!inputMessage.trim() || isLoading}
            title="Enviar mensagem (Enter)"
            aria-label="Enviar mensagem"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </footer>
  )
}
