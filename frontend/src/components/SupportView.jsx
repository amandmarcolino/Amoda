import { MessageCircle, Mail, MapPin, Clock, RefreshCw, ShieldCheck, Sparkles, Truck, CreditCard } from 'lucide-react'

export default function SupportView({ onAskAI }) {
  return (
    <div className="view-container support-view">
      <div className="view-header">
        <div>
          <h2>Atendimento & Suporte Amoda 👩‍💼</h2>
          <p>Estamos prontas para te acolher em todos os canais com carinho e agilidade.</p>
        </div>
      </div>

      {/* Cards de Contato */}
      <div className="support-channels-grid">
        <div className="support-channel-card highlight-whatsapp">
          <div className="channel-icon-circle whatsapp">
            <MessageCircle size={24} />
          </div>
          <h3>Consultora Humana no WhatsApp</h3>
          <p>Tire fotos de looks, receba vídeos dos tecidos e receba consultoria exclusiva por mensagem.</p>
          <a
            href="https://wa.me/5511987654321?text=Ol%C3%A1%2C%20gostaria%20de%20uma%20consultoria%20com%20uma%20atendente%20da%20Amoda!"
            target="_blank"
            rel="noreferrer"
            className="channel-action-btn whatsapp-btn"
          >
            <span>Falar no WhatsApp (11) 98765-4321</span>
          </a>
        </div>

        <div className="support-channel-card">
          <div className="channel-icon-circle email">
            <Mail size={24} />
          </div>
          <h3>E-mail & SAC</h3>
          <p>Para dúvidas sobre faturamento, parcerias ou solicitações formais de trocas.</p>
          <a href="mailto:sac@amoda.com.br" className="channel-action-btn email-btn">
            <span>sac@amoda.com.br</span>
          </a>
        </div>

        <div className="support-channel-card">
          <div className="channel-icon-circle showroom">
            <MapPin size={24} />
          </div>
          <h3>Showroom & Prova Física</h3>
          <p>Av. Paulista, 1000 - Bela Vista, São Paulo/SP</p>
          <span className="channel-schedule">
            <Clock size={14} /> Segunda a Sábado: 09h às 20h
          </span>
        </div>
      </div>

      {/* Dúvidas Frequentes & Políticas */}
      <h3 className="section-subtitle">Garantias & Políticas da Amoda</h3>
      <div className="policies-grid">
        <div className="policy-item">
          <RefreshCw size={20} color="#c084fc" />
          <div>
            <h4>Primeira Troca 100% Grátis</h4>
            <p>Até 30 dias corridos após o recebimento para trocar por outro tamanho ou modelo sem nenhum custo de frete.</p>
          </div>
        </div>

        <div className="policy-item">
          <ShieldCheck size={20} color="#c084fc" />
          <div>
            <h4>Devolução com Estorno Total</h4>
            <p>Se não se apaixonar pela peça, solicite a devolução em até 7 dias corridos com reembolso imediato.</p>
          </div>
        </div>

        <div className="policy-item">
          <Truck size={20} color="#c084fc" />
          <div>
            <h4>Frete Grátis Acima de R$ 299</h4>
            <p>Entrega segura e rastreada para todo o Brasil, com opção expressa em 24h para capitais.</p>
          </div>
        </div>

        <div className="policy-item">
          <CreditCard size={20} color="#c084fc" />
          <div>
            <h4>5% de Desconto no Pix ou 6x sem Juros</h4>
            <p>Condições facilitadas no cartão e desconto automático para pagamentos via Pix.</p>
          </div>
        </div>
      </div>

      {/* Botão rápido para tirar dúvidas com Sofia */}
      <div className="support-footer-banner">
        <Sparkles size={24} color="#c084fc" />
        <div>
          <h4>Quer tirar alguma dúvida agora mesmo?</h4>
          <p>Nossa consultora virtual Sofia responde instantaneamente aqui no chat.</p>
        </div>
        <button
          type="button"
          className="btn-talk-sofia"
          onClick={() => onAskAI('Como funciona o processo de troca ou devolução de uma peça que comprei?')}
        >
          Perguntar no Chat
        </button>
      </div>
    </div>
  )
}
