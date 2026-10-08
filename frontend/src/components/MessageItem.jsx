import { Bot, User, Clock, Zap, Sparkles, HelpCircle, Volume2, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react'
import FormattedMessage from './FormattedMessage'

export default function MessageItem({
  message,
  onSpeak,
  isSpeaking,
  onCopy,
  isCopied,
  onFeedback
}) {
  const isBot = message.sender === 'bot'

  const renderSourceBadge = (source, confidence) => {
    let label = 'Base RAG'
    let icon = <Zap size={11} />

    if (source === 'llm') {
      label = 'Groq LLM'
      icon = <Sparkles size={11} />
    } else if (source === 'saudacao') {
      label = 'Saudação'
      icon = <Bot size={11} />
    } else if (source === 'fallback') {
      label = 'Fallback'
      icon = <HelpCircle size={11} />
    }

    const percent = Math.round((confidence || 1) * 100)

    return (
      <span className="source-badge" title={`Origem: ${source} (Confiança: ${percent}%)`}>
        {icon}
        {label} • {percent}%
      </span>
    )
  }

  return (
    <div className={`message-row ${message.sender}`}>
      <div className="message-avatar">
        {isBot ? <Bot size={18} /> : <User size={18} />}
      </div>

      <div className="message-content">
        <div className="message-bubble">
          {isBot ? (
            <FormattedMessage content={message.text} />
          ) : (
            <p>{message.text}</p>
          )}
        </div>

        <div className="message-meta">
          <span className="message-time">
            <Clock size={10} style={{ display: 'inline', marginRight: '3px' }} />
            {message.timestamp}
          </span>

          {isBot && message.source && renderSourceBadge(message.source, message.confidence)}

          {isBot && (
            <div className="message-actions">
              {/* Reproduzir Áudio */}
              <button
                type="button"
                className={`action-btn ${isSpeaking ? 'active-like' : ''}`}
                onClick={() => onSpeak(message.text, message.id)}
                title="Ouvir esta resposta"
                aria-label="Ouvir resposta"
              >
                <Volume2 size={13} />
              </button>

              {/* Copiar */}
              <button
                type="button"
                className="action-btn"
                onClick={() => onCopy(message.text, message.id)}
                title="Copiar texto"
                aria-label="Copiar texto"
              >
                {isCopied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
              </button>

              {/* Feedback Like / Dislike */}
              {message.messageId && (
                <>
                  <button
                    type="button"
                    className={`action-btn ${message.feedback === 'like' ? 'active-like' : ''}`}
                    onClick={() => onFeedback(message.messageId, true)}
                    title="Gostei da resposta"
                    aria-label="Like"
                  >
                    <ThumbsUp size={13} />
                  </button>

                  <button
                    type="button"
                    className={`action-btn ${message.feedback === 'dislike' ? 'active-dislike' : ''}`}
                    onClick={() => onFeedback(message.messageId, false)}
                    title="Não gostei da resposta"
                    aria-label="Dislike"
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
}
