import { Volume2, VolumeX, Sparkles, Trash2, Shield, Info } from 'lucide-react'

export default function SettingsView({
  speechEnabled,
  onToggleSpeech,
  onResetChat
}) {
  return (
    <div className="view-container settings-view">
      <div className="view-header">
        <div>
          <h2>Configurações do Aplicativo ⚙️</h2>
          <p>Personalize sua experiência de consultoria e preferências de áudio.</p>
        </div>
      </div>

      <div className="settings-cards-list">
        {/* Card: Leitura de Voz Automática */}
        <div className="settings-card">
          <div className="settings-card-icon">
            {speechEnabled ? <Volume2 size={22} color="#c084fc" /> : <VolumeX size={22} color="#94a3b8" />}
          </div>
          <div className="settings-card-content">
            <h4>Leitura de Voz Automática (Text-to-Speech)</h4>
            <p>Quando ativado, a consultora Sofia lê as respostas em voz alta em português do Brasil.</p>
          </div>
          <div className="settings-card-action">
            <button
              type="button"
              className={`toggle-switch ${speechEnabled ? 'active' : ''}`}
              onClick={onToggleSpeech}
              aria-label="Ativar ou desativar áudio"
            >
              <span className="toggle-thumb"></span>
            </button>
          </div>
        </div>

        {/* Card: Motor de IA da Sofia */}
        <div className="settings-card">
          <div className="settings-card-icon">
            <Sparkles size={22} color="#c084fc" />
          </div>
          <div className="settings-card-content">
            <h4>Motor de IA Generativa & RAG da Amoda</h4>
            <p>Consultoria impulsionada por modelos de linguagem com ancoragem factual estrita nos produtos e políticas da Amoda.</p>
          </div>
          <div className="settings-card-action">
            <span className="status-badge-inline">Ativo • v2.0</span>
          </div>
        </div>

        {/* Card: Privacidade & LGPD */}
        <div className="settings-card">
          <div className="settings-card-icon">
            <Shield size={22} color="#c084fc" />
          </div>
          <div className="settings-card-content">
            <h4>Privacidade e Proteção de Dados</h4>
            <p>Suas mensagens e histórico são mantidos seguros na sua sessão e não são compartilhados com terceiros.</p>
          </div>
        </div>

        {/* Card: Limpar Dados de Conversa */}
        <div className="settings-card">
          <div className="settings-card-icon">
            <Trash2 size={22} color="#f43f5e" />
          </div>
          <div className="settings-card-content">
            <h4>Limpar Histórico & Nova Sessão</h4>
            <p>Exclui todas as mensagens salvas nesta sessão para iniciar um atendimento do zero.</p>
          </div>
          <div className="settings-card-action">
            <button
              type="button"
              className="btn-danger-outline"
              onClick={onResetChat}
            >
              Reiniciar Conversa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
