import { useState } from 'react'
import { Sparkles, ShoppingBag, Flame, Ruler, Shirt, PackageSearch, Heart, ArrowRight, Star, ShieldCheck, Truck, CreditCard } from 'lucide-react'
import MessageItem from './MessageItem'
import TypingIndicator from './TypingIndicator'

// Produtos em destaque para vitrine da tela inicial
const FEATURED_HERO_PRODUCTS = [
  {
    id: 'PROD-001',
    nome: 'Vestido Midi Floral Aurora',
    categoria: 'Vestidos',
    preco: 'R$ 289,90',
    tag: 'Mais Vendido',
    imagem: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
    prompt: 'Me fale mais sobre o Vestido Midi Floral Aurora e como combinar ele.'
  },
  {
    id: 'PROD-002',
    nome: 'Blazer Alfaiataria Paris',
    categoria: 'Alfaiataria',
    preco: 'R$ 399,90',
    tag: 'Elegance',
    imagem: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
    prompt: 'Quero ver combinações elegantes com o Blazer Alfaiataria Paris.'
  },
  {
    id: 'PROD-005',
    nome: 'Conjunto Linho Puro Riviera',
    categoria: 'Conjuntos',
    preco: 'R$ 349,90',
    tag: 'Tendência',
    imagem: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
    prompt: 'Gostei do Conjunto de Linho Riviera, quais cores e tamanhos vocês têm?'
  },
  {
    id: 'PROD-006',
    nome: 'Vestido Longo Fluidity Festa',
    categoria: 'Festa & Noite',
    preco: 'R$ 489,90',
    tag: 'Premium',
    imagem: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80',
    prompt: 'Preciso de um vestido para festa/casamento, me mostre o Vestido Longo Fluidity.'
  }
]

export default function MessageList({
  messages,
  isLoading,
  speakingMessageId,
  copiedMessageId,
  onSpeak,
  onCopy,
  onFeedback,
  onSelectPrompt,
  messagesEndRef
}) {
  const quickActions = [
    { label: '✨ Ver Novidades', icon: Flame, prompt: 'Quais são as novidades e lançamentos da Amoda?' },
    { label: '👗 Escolher Vestido', icon: ShoppingBag, prompt: 'Quero ver os vestidos disponíveis na loja.' },
    { label: '💎 Montar Look Sofisticado', icon: Shirt, prompt: 'Monte um look sofisticado para um evento especial.' },
    { label: '📏 Descobrir Meu Tamanho', icon: Ruler, prompt: 'Como funciona a tabela de medidas para acertar meu tamanho?' },
    { label: '📦 Rastrear Meu Pedido', icon: PackageSearch, prompt: 'Como faço para rastrear o status do meu pedido?' }
  ]

  return (
    <main className="messages-container">
      {messages.length === 0 ? (
        <div className="store-home-view">
          
          {/* 1. HERO BANNER DE BOUTIQUE FEMININA */}
          <div className="store-hero-banner">
            <div className="store-hero-badge">
              <Sparkles size={14} className="sparkle-spin" />
              <span>Nova Coleção Primavera/Verão • Amoda 2026</span>
            </div>
            
            <h1 className="store-hero-title">
              Elegância, Conforto & <span className="gradient-text">Estilo Autêntico</span>
            </h1>
            
            <p className="store-hero-subtitle">
              Converse com a <strong>Sofia</strong>, nossa consultora virtual de moda. Receba dicas personalizadas de looks, sugestões para eventos e consulte disponibilidade em tempo real.
            </p>

            {/* Benefícios da Loja */}
            <div className="store-perks-row">
              <div className="perk-badge">
                <Truck size={14} />
                <span>Frete Grátis &gt; R$ 299</span>
              </div>
              <div className="perk-badge">
                <CreditCard size={14} />
                <span>Até 6x Sem Juros / 5% OFF Pix</span>
              </div>
              <div className="perk-badge">
                <ShieldCheck size={14} />
                <span>Troca Fácil em 30 Dias</span>
              </div>
            </div>
          </div>

          {/* 2. VITRINE DE PRODUTOS EM DESTAQUE */}
          <div className="store-section-header">
            <div>
              <h3>✨ Destaques da Coleção</h3>
              <p>Clique em uma peça para pedir sugestões ou ver detalhes com a consultora Sofia:</p>
            </div>
          </div>

          <div className="store-featured-grid">
            {FEATURED_HERO_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="featured-store-card"
                onClick={() => onSelectPrompt(prod.prompt)}
              >
                <div className="card-image-wrapper">
                  <img src={prod.imagem} alt={prod.nome} loading="lazy" />
                  <span className="card-tag">{prod.tag}</span>
                </div>
                <div className="card-details">
                  <span className="card-cat">{prod.categoria}</span>
                  <h4 className="card-name">{prod.nome}</h4>
                  <div className="card-price-row">
                    <span className="card-price">{prod.preco}</span>
                    <button type="button" className="card-action-btn" title="Conversar sobre este produto">
                      <span>Consultar</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3. ATENDIMENTO RÁPIDO & CONSULTORIA */}
          <div className="store-consultancy-box">
            <div className="consultancy-header">
              <div className="consultancy-avatar">
                <Sparkles size={20} />
              </div>
              <div>
                <h4>💬 Como a Consultora Sofia pode te ajudar agora?</h4>
                <p>Selecione um tópico ou digite sua dúvida no campo abaixo:</p>
              </div>
            </div>

            <div className="welcome-buttons-grid">
              {quickActions.map((action, idx) => {
                const Icon = action.icon
                return (
                  <button
                    key={idx}
                    type="button"
                    className="welcome-action-btn store-action-pill"
                    onClick={() => onSelectPrompt(action.prompt)}
                    disabled={isLoading}
                  >
                    <Icon size={16} className="btn-icon" />
                    <span>{action.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      ) : (
        messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isSpeaking={speakingMessageId === msg.id}
            isCopied={copiedMessageId === msg.id}
            onSpeak={onSpeak}
            onCopy={onCopy}
            onFeedback={onFeedback}
          />
        ))
      )}

      {/* Indicador de Digitação */}
      {isLoading && <TypingIndicator />}

      {/* Rolagem Automática */}
      <div ref={messagesEndRef} />
    </main>
  )
}
