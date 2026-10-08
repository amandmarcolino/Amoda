import { Bot } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="message-row bot typing-row">
      <div className="message-avatar">
        <Bot size={18} />
      </div>
      <div className="message-content">
        <div className="message-bubble typing-bubble">
          <div className="typing-indicator" title="IA pensando...">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </div>
        </div>
      </div>
    </div>
  )
}
