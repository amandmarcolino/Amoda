import { Sparkles, Volume2, VolumeX, Code, PlusCircle, Crown } from 'lucide-react'
import { API_BASE_URL } from '../services/api'

export default function ChatHeader({
  apiOnline,
  speechEnabled,
  onToggleSpeech,
  onNewConversation
}) {
  return (
    <header className="chat-header">
      <div className="header-brand">
        <div className="brand-avatar amoda-avatar">
          <Crown size={22} className="crown-icon" />
        </div>
        <div className="brand-info">
          <h1>
            Amoda
            <span className="badge amoda-badge">Consultora Sofia</span>
          </h1>
          <p>Moda Feminina, Estilo & Atendimento Inteligente</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Status da API */}
        <div className={`status-badge ${apiOnline ? 'online' : 'offline'}`} title={`API ${apiOnline ? 'Conectada' : 'Desconectada'}`}>
          <span className="status-dot"></span>
          <span>{apiOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Leitura de Voz Automática (TTS) */}
        <button
          type="button"
          className={`header-btn ${speechEnabled ? 'active' : ''}`}
          onClick={onToggleSpeech}
          title={speechEnabled ? 'Desativar áudio automático' : 'Ativar áudio automático'}
          aria-label="Controle de áudio"
        >
          {speechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Documentação Swagger */}
        <a
          href={`${API_BASE_URL}/docs`}
          target="_blank"
          rel="noreferrer"
          className="header-btn"
          title="Abrir Swagger da API da Amoda"
          aria-label="Docs Swagger"
        >
          <Code size={18} />
        </a>

        {/* Botão Nova Conversa */}
        <button
          type="button"
          className="btn-new-chat"
          onClick={onNewConversation}
          title="Iniciar um atendimento do zero com a Sofia"
          aria-label="Nova conversa"
        >
          <PlusCircle size={16} />
          <span>Nova conversa</span>
        </button>
      </div>
    </header>
  )
}
