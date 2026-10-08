import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Sparkles,
  ShoppingBag,
  Search,
  User,
  Heart,
  Sun,
  Moon,
  ArrowRight,
  Truck,
  CreditCard,
  ShieldCheck,
  Star,
  MessageSquareHeart,
  X,
  Send,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Check,
  Plus,
  Minus,
  Trash2
} from 'lucide-react'
import FormattedMessage from './FormattedMessage'
import VoiceInput from './VoiceInput'
import TypingIndicator from './TypingIndicator'
import { sendChatMessage, sendFeedback } from '../services/api'

// Catálogo Real da Boutique AMODA
const STORE_CATALOG = [
  {
    id: 'PROD-001',
    nome: 'Vestido Midi Floral Aurora',
    categoria: 'Elegante',
    tipo: 'Vestidos',
    preco: 289.90,
    precoFormatado: 'R$ 289,90',
    tamanhos: ['PP', 'P', 'M', 'G'],
    cores: ['Lilás Floral', 'Off-White', 'Rosa Suave'],
    tecido: 'Crepe de Seda com Forro Acetinado',
    estilo: 'Elegante',
    ocasiao: 'Casamento de Dia / Almoço Especial',
    descricao: 'Vestido midi fluido com decote em V suave, mangas delicadas e estampa floral exclusiva.',
    imagem: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
    novidade: true,
    tag: 'Mais Vendido'
  },
  {
    id: 'PROD-002',
    nome: 'Blazer Alfaiataria Paris',
    categoria: 'Elegante',
    tipo: 'Alfaiataria',
    preco: 399.90,
    precoFormatado: 'R$ 399,90',
    tamanhos: ['PP', 'P', 'M', 'G', 'GG'],
    cores: ['Vinho Marsala', 'Off-White', 'Preto Clássico'],
    tecido: 'Crepe Alfaiataria Estruturado com Forro de Cetim',
    estilo: 'Elegante',
    ocasiao: 'Trabalho / Jantar Elegante',
    descricao: 'Corte impecável com botões forrados e ombreiras discretas que valorizam a silhueta.',
    imagem: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
    novidade: true,
    tag: 'Destaque'
  },
  {
    id: 'PROD-003',
    nome: 'Calça Wide Leg Alfaiataria Elegance',
    categoria: 'Moderno',
    tipo: 'Calças',
    preco: 249.90,
    precoFormatado: 'R$ 249,90',
    tamanhos: ['36', '38', '40', '42', '44'],
    cores: ['Bege Creme', 'Off-White', 'Preto'],
    tecido: 'Viscose com Linho Nobre',
    estilo: 'Moderno',
    ocasiao: 'Trabalho / Eventos Sociais',
    descricao: 'Calça pantalona de cintura alta com pregas frontais e caimento sofisticado.',
    imagem: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&auto=format&fit=crop&q=80',
    novidade: false,
    tag: 'Essencial'
  },
  {
    id: 'PROD-004',
    nome: 'Blusa Cropped Seda Lumina',
    categoria: 'Moderno',
    tipo: 'Blusas',
    preco: 179.90,
    precoFormatado: 'R$ 179,90',
    tamanhos: ['PP', 'P', 'M', 'G'],
    cores: ['Off-White Pérola', 'Champanhe', 'Rosé'],
    tecido: 'Seda Acetinada Premium',
    estilo: 'Moderno',
    ocasiao: 'Encontro Romântico / Jantar',
    descricao: 'Drapeado refinado no busto e amarração sutil nas costas com toque sedoso.',
    imagem: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    novidade: false,
    tag: 'Festa'
  },
  {
    id: 'PROD-005',
    nome: 'Conjunto Linho Puro Riviera',
    categoria: 'Casual',
    tipo: 'Conjuntos',
    preco: 349.90,
    precoFormatado: 'R$ 349,90',
    tamanhos: ['P', 'M', 'G'],
    cores: ['Cru Natural', 'Vinho Suave', 'Terracota'],
    tecido: '100% Linho Puro Amaciado',
    estilo: 'Casual',
    ocasiao: 'Férias / Fim de Semana / Brunch',
    descricao: 'Camisa leve oversized com short de cós elástico e cordão de amarração.',
    imagem: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    novidade: true,
    tag: 'Verão'
  },
  {
    id: 'PROD-006',
    nome: 'Vestido Longo Fluidity Festa',
    categoria: 'Festa',
    tipo: 'Vestidos',
    preco: 489.90,
    precoFormatado: 'R$ 489,90',
    tamanhos: ['P', 'M', 'G', 'GG'],
    cores: ['Vinho Imperial', 'Magenta Nobre', 'Esmeralda'],
    tecido: 'Chiffon Toque de Seda com Fenda Lateral',
    estilo: 'Festa',
    ocasiao: 'Casamento / Madrinha / Gala',
    descricao: 'Vestido de festa luxuoso com decote ombro a ombro e caimento deslumbrante.',
    imagem: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
    novidade: true,
    tag: 'Gala & Festa'
  },
  {
    id: 'PROD-007',
    nome: 'Saia Midi Plissada Soleil',
    categoria: 'Básico',
    tipo: 'Saias',
    preco: 219.90,
    precoFormatado: 'R$ 219,90',
    tamanhos: ['P', 'M', 'G'],
    cores: ['Dourado Suave', 'Vinho Marsala', 'Preto'],
    tecido: 'Tule Plissado com Fios de Brilho',
    estilo: 'Básico',
    ocasiao: 'Jantares / Looks Românticos',
    descricao: 'Saia plissada clássica com cintura elástica acetinada e movimento gracioso.',
    imagem: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop&q=80',
    novidade: false,
    tag: 'Clássico'
  },
  {
    id: 'PROD-008',
    nome: 'Sandália Salto Bloco Couro Elegance',
    categoria: 'Elegante',
    tipo: 'Calçados',
    preco: 269.90,
    precoFormatado: 'R$ 269,90',
    tamanhos: ['35', '36', '37', '38', '39'],
    cores: ['Nude Creme', 'Vinho', 'Off-White'],
    tecido: 'Couro Nobre com Palmilha Comfort',
    estilo: 'Elegante',
    ocasiao: 'Festas / Trabalho / Casamento',
    descricao: 'Salto bloco de 6,5 cm com tiras finas e máxima estabilidade.',
    imagem: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
    novidade: false,
    tag: 'Calçados'
  }
]

export default function BoutiqueStore() {
  // 1. TEMA CLARO / ESCURO COM PERSISTÊNCIA NO LOCALSTORAGE
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('amoda_theme') || 'light'
    } catch {
      return 'light'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('amoda_theme', theme)
    } catch (e) {
      console.warn('Erro ao salvar tema:', e)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // 2. NAVEGAÇÃO, FILTROS E BUSCA
  const [activeNav, setActiveNav] = useState('inicio')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProductModal, setSelectedProductModal] = useState(null)

  // 3. CARRINHO E FAVORITOS
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('amoda_cart')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('amoda_favs')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem('amoda_cart', JSON.stringify(cart))
      localStorage.setItem('amoda_favs', JSON.stringify(favorites))
    } catch (e) {
      console.warn(e)
    }
  }, [cart, favorites])

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id)
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateCartQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = (item.quantity || 1) + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const toggleFavorite = (product) => {
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id === product.id)
      if (exists) return prev.filter((p) => p.id !== product.id)
      return [...prev, product]
    })
  }

  // 4. CHAT DA CONSULTORA AMODA INTEGRADO
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Olá! Sou a consultora **AMODA** 🍷\n\nComo posso te ajudar a escolher o look perfeito hoje? Me conte sobre a ocasião ou estilo que você procura!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'saudacao',
      confidence: 1.0
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatMessagesEndRef = useRef(null)

  const scrollToChatBottom = useCallback(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    if (isChatOpen) {
      scrollToChatBottom()
    }
  }, [chatMessages, isChatOpen, scrollToChatBottom])

  const handleSendChatMessage = async (customPrompt = null) => {
    const text = (customPrompt || chatInput).trim()
    if (!text || isChatLoading) return

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setChatMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setIsChatLoading(true)
    setIsChatOpen(true)

    try {
      const data = await sendChatMessage(text, 'amoda_boutique_session')
      const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: data.reply || data.response || 'Estou consultando nosso catálogo para você.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        confidence: data.confidence
      }
      setChatMessages((prev) => [...prev, botMsg])
    } catch (err) {
      const errorMsg = {
        id: 'err-' + Date.now(),
        sender: 'bot',
        text: 'Desculpe, tive uma instabilidade momentânea na consulta. Pode repetir sua pergunta?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setChatMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsChatLoading(false)
    }
  }

  // Filtragem dos Produtos
  const filteredProducts = STORE_CATALOG.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'Todos' ||
      p.categoria.toLowerCase() === selectedCategory.toLowerCase() ||
      p.estilo.toLowerCase() === selectedCategory.toLowerCase()

    if (activeNav === 'novidades') return p.novidade && matchesSearch
    if (activeNav === 'roupas') return matchesCategory && matchesSearch

    return matchesCategory && matchesSearch
  })

  const cartTotal = cart.reduce((acc, item) => acc + item.preco * (item.quantity || 1), 0)

  return (
    <div className="amoda-boutique-root">
      {/* =========================================================================
          1. CABEÇALHO PRINCIPAL DO E-COMMERCE
          ========================================================================= */}
      <header className="boutique-header">
        <div className="header-top-bar">
          <div className="top-bar-inner">
            <span>🍷 Frete Grátis acima de R$ 299 para todo o Brasil • Até 6x Sem Juros</span>
          </div>
        </div>

        <div className="header-main-container">
          {/* Logo da Marca */}
          <div className="brand-logo" onClick={() => setActiveNav('inicio')}>
            <span className="logo-wine">A</span>MODA
            <span className="logo-sub">BOUTIQUE</span>
          </div>

          {/* Menu de Navegação */}
          <nav className="boutique-nav">
            <button
              type="button"
              className={`nav-link ${activeNav === 'inicio' ? 'active' : ''}`}
              onClick={() => {
                setActiveNav('inicio')
                setSelectedCategory('Todos')
              }}
            >
              Início
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'roupas' ? 'active' : ''}`}
              onClick={() => {
                setActiveNav('roupas')
                setSelectedCategory('Todos')
              }}
            >
              Roupas
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'novidades' ? 'active' : ''}`}
              onClick={() => {
                setActiveNav('novidades')
                setSelectedCategory('Todos')
              }}
            >
              Novidades
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'looks' ? 'active' : ''}`}
              onClick={() => {
                setActiveNav('looks')
              }}
            >
              Looks
            </button>
            <button
              type="button"
              className={`nav-link ${activeNav === 'sobre' ? 'active' : ''}`}
              onClick={() => setActiveNav('sobre')}
            >
              Sobre nós
            </button>
          </nav>

          {/* Ações: Tema Claro/Escuro, Busca, Carrinho e Perfil */}
          <div className="header-action-icons">
            {/* Alternador de Tema Claro / Escuro */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Alternar para modo ${theme === 'light' ? 'Escuro (Dark)' : 'Claro (Light)'}`}
              aria-label="Alternar tema"
            >
              {theme === 'light' ? (
                <>
                  <Moon size={18} className="theme-icon" />
                  <span className="theme-text">Escuro</span>
                </>
              ) : (
                <>
                  <Sun size={18} className="theme-icon sun" />
                  <span className="theme-text">Claro</span>
                </>
              )}
            </button>

            {/* Barra de Busca Rápida */}
            <div className="header-search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar vestidos, blazers, conjuntos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className="clear-search" onClick={() => setSearchQuery('')}>
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Carrinho de Compras */}
            <button
              type="button"
              className="action-icon-btn cart-btn"
              onClick={() => setIsCartOpen(true)}
              title="Meu Carrinho de Compras"
            >
              <ShoppingBag size={20} />
              {cart.length > 0 && <span className="cart-count-badge">{cart.length}</span>}
            </button>

            {/* Perfil / Login */}
            <button
              type="button"
              className="action-icon-btn profile-btn"
              title="Minha Conta"
              onClick={() => handleSendChatMessage('Como acesso meus pedidos e conta na Amoda?')}
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. CONTEÚDO PRINCIPAL (PÁGINAS)
          ========================================================================= */}
      <main className="boutique-main-content">
        {activeNav === 'inicio' && (
          <>
            {/* HERO BANNER REALISTA */}
            <section className="hero-banner-section">
              <div className="hero-banner-overlay">
                <div className="hero-content">
                  <span className="hero-badge">Coleção Outono & Inverno 2026</span>
                  <h1 className="hero-heading">Seu estilo, sua escolha.</h1>
                  <p className="hero-subtext">
                    Descubra peças de alfaiataria impecável, vestidos fluidos e combinações elegantes pensadas para mulheres autênticas.
                  </p>
                  <div className="hero-cta-group">
                    <button
                      type="button"
                      className="btn-primary-wine"
                      onClick={() => {
                        setActiveNav('roupas')
                        window.scrollTo({ top: 500, behavior: 'smooth' })
                      }}
                    >
                      <span>Comprar agora</span>
                      <ArrowRight size={17} />
                    </button>
                    <button
                      type="button"
                      className="btn-secondary-cream"
                      onClick={() => {
                        setIsChatOpen(true)
                        handleSendChatMessage('Oi Sofia! Gostaria de uma sugestão de look para um evento.')
                      }}
                    >
                      <Sparkles size={16} />
                      <span>Consultoria com IA</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* BENEFÍCIOS */}
            <section className="boutique-perks-bar">
              <div className="perk-item">
                <Truck size={22} className="perk-icon" />
                <div>
                  <h4>Frete Rápido & Seguro</h4>
                  <p>Grátis para compras acima de R$ 299</p>
                </div>
              </div>
              <div className="perk-item">
                <CreditCard size={22} className="perk-icon" />
                <div>
                  <h4>Pagamento Flexível</h4>
                  <p>Até 6x sem juros ou 5% OFF no Pix</p>
                </div>
              </div>
              <div className="perk-item">
                <ShieldCheck size={22} className="perk-icon" />
                <div>
                  <h4>Primeira Troca Grátis</h4>
                  <p>Até 30 dias após o recebimento</p>
                </div>
              </div>
            </section>

            {/* SEÇÃO: ENCONTRE SEU ESTILO (CATEGORIAS) */}
            <section className="categories-section">
              <div className="section-title-wrap">
                <span className="section-subtitle">Categorias em Alta</span>
                <h2 className="section-title">Encontre seu estilo</h2>
                <div className="title-divider"></div>
              </div>

              <div className="categories-pill-grid">
                {['Todos', 'Casual', 'Elegante', 'Moderno', 'Básico', 'Festa'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-card-pill ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {/* SEÇÃO CATÁLOGO DE PRODUTOS */}
        <section className="catalog-section" id="catalogo">
          <div className="section-title-wrap">
            <span className="section-subtitle">
              {activeNav === 'novidades' ? 'Lançamentos da Semana' : 'Coleção Exclusiva'}
            </span>
            <h2 className="section-title">
              {activeNav === 'novidades' ? 'Novidades da Coleção' : 'Catálogo AMODA'}
            </h2>
            <p className="section-desc">
              Peças confeccionadas em tecidos nobres como linho puro, crepe de seda e alfaiataria estruturada.
            </p>
          </div>

          {/* Grid de Produtos */}
          <div className="products-ecommerce-grid">
            {filteredProducts.map((prod) => {
              const isFav = favorites.some((f) => f.id === prod.id)
              return (
                <article key={prod.id} className="product-boutique-card">
                  <div className="product-image-container">
                    <img src={prod.imagem} alt={prod.nome} loading="lazy" />
                    {prod.tag && <span className="prod-ribbon">{prod.tag}</span>}
                    
                    <button
                      type="button"
                      className={`btn-fav-round ${isFav ? 'favorited' : ''}`}
                      onClick={() => toggleFavorite(prod)}
                      title={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                    >
                      <Heart size={16} fill={isFav ? '#7A1F3D' : 'none'} color={isFav ? '#7A1F3D' : '#333'} />
                    </button>
                  </div>

                  <div className="product-card-info">
                    <span className="prod-cat-label">{prod.categoria} • {prod.tipo}</span>
                    <h3 className="prod-card-name">{prod.nome}</h3>
                    <p className="prod-card-price">{prod.precoFormatado}</p>

                    {/* Cores e Tamanhos */}
                    <div className="prod-attributes">
                      <div className="colors-row">
                        <span className="attr-label">Cores:</span>
                        <span className="attr-val">{prod.cores.join(', ')}</span>
                      </div>
                      <div className="sizes-row">
                        <span className="attr-label">Tamanhos:</span>
                        <div className="sizes-chips">
                          {prod.tamanhos.map((tam) => (
                            <span key={tam} className="size-badge">{tam}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="prod-actions-row">
                      <button
                        type="button"
                        className="btn-view-product"
                        onClick={() => setSelectedProductModal(prod)}
                      >
                        <Eye size={14} />
                        <span>Ver produto</span>
                      </button>

                      <button
                        type="button"
                        className="btn-add-cart"
                        onClick={() => addToCart(prod)}
                      >
                        <ShoppingBag size={14} />
                        <span>Adicionar ao carrinho</span>
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-catalog-msg">
              <ShoppingBag size={48} className="empty-icon" />
              <h3>Nenhum produto encontrado</h3>
              <p>Tente buscar por outro termo ou selecione a categoria "Todos".</p>
              <button
                type="button"
                className="btn-primary-wine"
                onClick={() => {
                  setSelectedCategory('Todos')
                  setSearchQuery('')
                }}
              >
                Ver todos os produtos
              </button>
            </div>
          )}
        </section>

        {/* LOOKS SUGERIDOS & CONSULTORIA */}
        {activeNav === 'looks' && (
          <section className="looks-showcase-section">
            <div className="section-title-wrap">
              <span className="section-subtitle">Styling & Tendências</span>
              <h2 className="section-title">Inspirações de Looks AMODA</h2>
              <p className="section-desc">Combinações prontas criadas por nossos estilistas para você arrasar.</p>
            </div>

            <div className="looks-cards-grid">
              <div className="look-card">
                <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&auto=format&fit=crop&q=80" alt="Look Office" />
                <div className="look-card-overlay">
                  <h4>Look Office Poderoso</h4>
                  <p>Blazer Paris + Calça Wide Leg + Blusa Seda Lumina</p>
                  <button
                    type="button"
                    className="btn-look-chat"
                    onClick={() => {
                      setIsChatOpen(true)
                      handleSendChatMessage('Quero saber mais sobre o Look Office Poderoso com o Blazer Paris.')
                    }}
                  >
                    Montar este look com a Sofia
                  </button>
                </div>
              </div>

              <div className="look-card">
                <img src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=700&auto=format&fit=crop&q=80" alt="Look Gala" />
                <div className="look-card-overlay">
                  <h4>Look Casamento & Gala</h4>
                  <p>Vestido Longo Fluidity Festa + Sandália Salto Bloco</p>
                  <button
                    type="button"
                    className="btn-look-chat"
                    onClick={() => {
                      setIsChatOpen(true)
                      handleSendChatMessage('Gostaria de ver o Look Casamento & Gala com o Vestido Longo Fluidity.')
                    }}
                  >
                    Consultar com a Sofia
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SOBRE NÓS */}
        {activeNav === 'sobre' && (
          <section className="about-us-section">
            <div className="section-title-wrap">
              <span className="section-subtitle">Nossa Essência</span>
              <h2 className="section-title">Sobre a AMODA</h2>
              <div className="title-divider"></div>
            </div>
            <div className="about-content-card">
              <p>
                A <strong>AMODA</strong> nasceu para celebrar a sofisticação e a liberdade da mulher contemporânea. Nossas peças combinam matérias-primas nobres, alfaiataria precisa e um design atemporal na tonalidade marcante do vinho e off-white.
              </p>
              <p>
                Com nossa <strong>Consultoria de Estilo com IA</strong>, garantimos um atendimento humano, rápido e personalizado para você encontrar a roupa perfeita para qualquer momento da sua vida.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* =========================================================================
          3. MODAL DE DETALHES DO PRODUTO ("VER PRODUTO")
          ========================================================================= */}
      {selectedProductModal && (
        <div className="modal-overlay" onClick={() => setSelectedProductModal(null)}>
          <div className="product-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedProductModal(null)}
            >
              <X size={20} />
            </button>

            <div className="modal-grid">
              <div className="modal-img-col">
                <img src={selectedProductModal.imagem} alt={selectedProductModal.nome} />
              </div>

              <div className="modal-info-col">
                <span className="modal-cat">{selectedProductModal.categoria} • {selectedProductModal.tipo}</span>
                <h2>{selectedProductModal.nome}</h2>
                <div className="modal-price">{selectedProductModal.precoFormatado}</div>
                <p className="modal-desc">{selectedProductModal.descricao}</p>

                <div className="modal-specs">
                  <div><strong>Tecido:</strong> {selectedProductModal.tecido}</div>
                  <div><strong>Ocasião:</strong> {selectedProductModal.ocasiao}</div>
                  <div><strong>Cores Disponíveis:</strong> {selectedProductModal.cores.join(', ')}</div>
                </div>

                <div className="modal-sizes-select">
                  <span className="label">Selecione o tamanho:</span>
                  <div className="sizes-chips">
                    {selectedProductModal.tamanhos.map((tam) => (
                      <button key={tam} type="button" className="size-btn active">
                        {tam}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-buttons">
                  <button
                    type="button"
                    className="btn-primary-wine modal-add"
                    onClick={() => {
                      addToCart(selectedProductModal)
                      setSelectedProductModal(null)
                    }}
                  >
                    <ShoppingBag size={18} />
                    <span>Adicionar ao Carrinho</span>
                  </button>
                  <button
                    type="button"
                    className="btn-secondary-cream"
                    onClick={() => {
                      const p = selectedProductModal
                      setSelectedProductModal(null)
                      setIsChatOpen(true)
                      handleSendChatMessage(`Gostaria de saber mais detalhes sobre o ${p.nome} (${p.precoFormatado}) e sugestões de combinações.`)
                    }}
                  >
                    <Sparkles size={16} />
                    <span>Perguntar para a Sofia</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. GAVETA LATERAL DO CARRINHO DE COMPRAS
          ========================================================================= */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <div className="cart-title-row">
                <ShoppingBag size={20} className="wine-icon" />
                <h3>Minha Sacola ({cart.length})</h3>
              </div>
              <button type="button" className="btn-close-cart" onClick={() => setIsCartOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="cart-items-list">
              {cart.length === 0 ? (
                <div className="empty-cart-state">
                  <ShoppingBag size={42} className="empty-cart-icon" />
                  <p>Sua sacola de compras está vazia.</p>
                  <button
                    type="button"
                    className="btn-primary-wine"
                    onClick={() => setIsCartOpen(false)}
                  >
                    Continuar comprando
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item-row">
                    <img src={item.imagem} alt={item.nome} className="cart-item-thumb" />
                    <div className="cart-item-details">
                      <h4>{item.nome}</h4>
                      <span className="cart-item-price">{item.precoFormatado}</span>
                      <div className="cart-qty-controls">
                        <button type="button" onClick={() => updateCartQty(item.id, -1)}>
                          <Minus size={12} />
                        </button>
                        <span>{item.quantity || 1}</span>
                        <button type="button" onClick={() => updateCartQty(item.id, 1)}>
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-item"
                      onClick={() => removeFromCart(item.id)}
                      title="Remover produto"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-subtotal-row">
                  <span>Subtotal:</span>
                  <span className="subtotal-val">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                </div>
                <p className="cart-freight-tip">
                  {cartTotal >= 299 ? '🎉 Você ganhou Frete Grátis!' : `Faltam R$ ${(299 - cartTotal).toFixed(2).replace('.', ',')} para Frete Grátis`}
                </p>
                <button
                  type="button"
                  className="btn-checkout-wine"
                  onClick={() => {
                    alert('Pedido finalizado com sucesso na Boutique AMODA! 🎉')
                    setCart([])
                    setIsCartOpen(false)
                  }}
                >
                  Finalizar Compra
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* =========================================================================
          5. BOTÃO FLUTUANTE & JANELA DO CHAT INTEGRADO DA CONSULTORA SOFIA
          ========================================================================= */}
      <div className="boutique-chat-anchor">
        {!isChatOpen && (
          <button
            type="button"
            className="floating-chat-trigger"
            onClick={() => setIsChatOpen(true)}
            title="Abrir atendimento com a Consultora Sofia"
          >
            <div className="trigger-avatar">
              <Sparkles size={20} />
            </div>
            <div className="trigger-info">
              <span className="trigger-title">Consultora AMODA</span>
              <span className="trigger-status">Online 🍷</span>
            </div>
          </button>
        )}

        {isChatOpen && (
          <div className="integrated-chat-window">
            <div className="chat-window-topbar">
              <div className="chat-top-brand">
                <div className="chat-avatar-mini">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4>Sofia • Consultora AMODA</h4>
                  <span className="chat-status-text">Atendimento com IA & Moda</span>
                </div>
              </div>

              <div className="chat-window-actions">
                <button
                  type="button"
                  className="chat-close-btn"
                  onClick={() => setIsChatOpen(false)}
                  title="Minimizar chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Mensagens do Chat */}
            <div className="chat-dialog-area">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`chat-dialog-row ${msg.sender}`}>
                  <div className="chat-dialog-bubble">
                    <FormattedMessage content={msg.text} />
                    <span className="dialog-time">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              {isChatLoading && <TypingIndicator />}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Sugestões Rápidas */}
            <div className="chat-quick-pills">
              <button
                type="button"
                onClick={() => handleSendChatMessage('Quero sugestões de vestidos para casamento')}
              >
                👗 Vestidos para casamento
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage('Quais novidades acabaram de chegar?')}
              >
                ✨ Novidades da semana
              </button>
              <button
                type="button"
                onClick={() => handleSendChatMessage('Como consultar a tabela de medidas?')}
              >
                📏 Tabela de tamanhos
              </button>
            </div>

            {/* Input do Chat */}
            <div className="chat-input-bar">
              <input
                type="text"
                placeholder="Pergunte sobre roupas, tamanhos, looks..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendChatMessage()
                }}
                disabled={isChatLoading}
              />
              <VoiceInput
                onTranscript={(transcript) => handleSendChatMessage(transcript)}
                disabled={isChatLoading}
              />
              <button
                type="button"
                className="chat-send-btn"
                onClick={() => handleSendChatMessage()}
                disabled={!chatInput.trim() || isChatLoading}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER DA BOUTIQUE */}
      <footer className="boutique-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="logo-wine">A</span>MODA BOUTIQUE
            <p>Elegância atemporal, matéria-prima nobre e consultoria de moda inteligente.</p>
          </div>
          <div className="footer-copyright">
            © 2026 AMODA Moda Feminina Ltda. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
