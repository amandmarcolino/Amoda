import { useState, useEffect } from 'react'
import { Heart, Sparkles, Tag, Layers, CheckCircle2, MessageSquarePlus } from 'lucide-react'
import { fetchProducts } from '../services/api'

// Catálogo padrão de fallback da Amoda
const DEFAULT_PRODUCTS = [
  {
    id: 'PROD-001',
    nome: 'Vestido Midi Floral Aurora',
    categoria: 'Vestidos',
    preco: 289.90,
    preco_formatado: 'R$ 289,90',
    tamanhos: ['PP', 'P', 'M', 'G'],
    cores: ['Lilás Floral', 'Off-White', 'Rosa Claro'],
    tecido: 'Crepe de Seda com Forro Acetinado',
    ocasiao: ['Casual Chic', 'Almoço de Domingo', 'Casamento de Dia'],
    descricao: 'Vestido midi com caimento fluido, decote em V sutil e estampa floral delicada em tons lilás.',
    disponivel: true,
    novidade: true,
    imagem: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'PROD-002',
    nome: 'Blazer Alfaiataria Paris',
    categoria: 'Alfaiataria',
    preco: 399.90,
    preco_formatado: 'R$ 399,90',
    tamanhos: ['PP', 'P', 'M', 'G', 'GG'],
    cores: ['Lavanda', 'Roxo Profundo', 'Branco Neve', 'Preto'],
    tecido: 'Crepe Alfaiataria Estruturado com Forro de Cetim',
    ocasiao: ['Trabalho / Office', 'Reuniões', 'Jantar Elegante'],
    descricao: 'Blazer alongado com corte impecável, botões forrados e ombreiras discretas que valorizam a silhueta.',
    disponivel: true,
    novidade: true,
    imagem: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'PROD-003',
    nome: 'Calça Wide Leg Alfaiataria Elegance',
    categoria: 'Calças',
    preco: 249.90,
    preco_formatado: 'R$ 249,90',
    tamanhos: ['36', '38', '40', '42', '44'],
    cores: ['Lilás Pastel', 'Bege Areia', 'Branco Pérola'],
    tecido: 'Viscose com Linho e Elastano',
    ocasiao: ['Trabalho', 'Passeios', 'Eventos Sociais'],
    descricao: 'Calça pantalona/wide leg de cintura alta com pregas frontais e caimento sofisticado.',
    disponivel: true,
    novidade: false,
    imagem: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'PROD-004',
    nome: 'Blusa Cropped Seda Lumina',
    categoria: 'Blusas',
    preco: 179.90,
    preco_formatado: 'R$ 179,90',
    tamanhos: ['PP', 'P', 'M', 'G'],
    cores: ['Branco Pérola', 'Lavanda Suave', 'Champanhe'],
    tecido: 'Seda Acetinada Premium',
    ocasiao: ['Encontro Romântico', 'Balada', 'Jantar'],
    descricao: 'Cropped com drapeado elegante no busto e amarração nas costas em seda brilhante.',
    disponivel: true,
    novidade: false,
    imagem: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'PROD-005',
    nome: 'Conjunto Linho Puro Riviera',
    categoria: 'Conjuntos',
    preco: 349.90,
    preco_formatado: 'R$ 349,90',
    tamanhos: ['P', 'M', 'G'],
    cores: ['Lilás Suave', 'Cru Natural', 'Terracota'],
    tecido: '100% Linho Puro Amaciado',
    ocasiao: ['Férias / Praia', 'Fim de Semana', 'Almoço ao Ar Livre'],
    descricao: 'Conjunto composto por camisa oversized de mangas longas e short de cós elástico com cordão.',
    disponivel: true,
    novidade: true,
    imagem: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'PROD-006',
    nome: 'Vestido Longo Fluidity Festa',
    categoria: 'Vestidos',
    preco: 489.90,
    preco_formatado: 'R$ 489,90',
    tamanhos: ['P', 'M', 'G', 'GG'],
    cores: ['Violeta Imperial', 'Magenta', 'Verde Esmeralda'],
    tecido: 'Chiffon Toque de Seda com Fenda Lateral',
    ocasiao: ['Casamento / Madrinha', 'Formatura', 'Gala'],
    descricao: 'Vestido de festa glamouroso com decote ombro a ombro e saia esvoaçante.',
    disponivel: true,
    novidade: true,
    imagem: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'PROD-007',
    nome: 'Saia Midi Plissada Soleil',
    categoria: 'Saias',
    preco: 219.90,
    preco_formatado: 'R$ 219,90',
    tamanhos: ['P', 'M', 'G'],
    cores: ['Lilás Metalizado', 'Dourado Suave', 'Preto'],
    tecido: 'Tule Plissado com Fios de Lurex',
    ocasiao: ['Festas', 'Jantares', 'Look Romântico'],
    descricao: 'Saia plissada com brilho sutil e elástico acetinado na cintura.',
    disponivel: true,
    novidade: false,
    imagem: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'PROD-008',
    nome: 'Sandália Salto Bloco Couro Elegance',
    categoria: 'Calçados',
    preco: 269.90,
    preco_formatado: 'R$ 269,90',
    tamanhos: ['34', '35', '36', '37', '38', '39'],
    cores: ['Lilás Metalizado', 'Nude Acetinado', 'Branco'],
    tecido: 'Couro Legítimo com Palmilha Confort',
    ocasiao: ['Festas', 'Trabalho', 'Casamento'],
    descricao: 'Sandália de tiras finas e salto bloco de 6,5 cm para conforto prolongado.',
    disponivel: true,
    novidade: false,
    imagem: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'PROD-009',
    nome: 'Bolsa Baguette Couro Amoda',
    categoria: 'Acessórios',
    preco: 199.90,
    preco_formatado: 'R$ 199,90',
    tamanhos: ['Único'],
    cores: ['Lavanda', 'Off-White', 'Caramelo'],
    tecido: 'PU Premium com Ferragens Douradas',
    ocasiao: ['Dia a dia', 'Eventos', 'Passeios'],
    descricao: 'Bolsa baguette com alça de ombro e detalhes em corrente dourada.',
    disponivel: true,
    novidade: false,
    imagem: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80'
  }
]

const CATEGORIES = ['Todos', 'Vestidos', 'Alfaiataria', 'Calças', 'Blusas', 'Conjuntos', 'Saias', 'Calçados', 'Acessórios']

export default function ProductsView({ onAskAI, favorites = [], onToggleFavorite }) {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function load() {
      const data = await fetchProducts()
      if (data && data.produtos && data.produtos.length > 0) {
        setProducts(data.produtos)
      }
    }
    load()
  }, [])

  const filteredProducts = products.filter((item) => {
    const matchesCat = selectedCategory === 'Todos' || item.categoria === selectedCategory
    const matchesSearch = item.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.tecido?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.cores?.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCat && matchesSearch
  })

  return (
    <div className="view-container products-view">
      <div className="view-header">
        <div>
          <h2>Coleção & Catálogo Oficial 🌸</h2>
          <p>Peças exclusivas com tecidos nobres, acabamento premium e caimento impecável.</p>
        </div>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Buscar por nome, cor ou tecido..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="products-search-input"
          />
        </div>
      </div>

      {/* Categorias */}
      <div className="category-chips-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Produtos */}
      <div className="products-grid">
        {filteredProducts.map((prod) => {
          const isFav = favorites.some((f) => f.id === prod.id)
          return (
            <div key={prod.id} className="product-card">
              <div className="product-image-box">
                <img src={prod.imagem} alt={prod.nome} loading="lazy" />
                {prod.novidade && <span className="prod-badge-new">✨ Novidade</span>}
                <button
                  type="button"
                  className={`prod-fav-btn ${isFav ? 'is-fav' : ''}`}
                  onClick={() => onToggleFavorite(prod)}
                  title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                >
                  <Heart size={18} fill={isFav ? '#c084fc' : 'none'} color={isFav ? '#c084fc' : '#fff'} />
                </button>
              </div>

              <div className="product-card-body">
                <div className="prod-meta-top">
                  <span className="prod-cat">{prod.categoria}</span>
                  <span className="prod-price">{prod.preco_formatado}</span>
                </div>

                <h3 className="prod-title">{prod.nome}</h3>
                <p className="prod-desc">{prod.descricao}</p>

                <div className="prod-specs">
                  <div className="spec-row">
                    <span className="spec-label">Tamanhos:</span>
                    <div className="sizes-list">
                      {prod.tamanhos?.map((tam) => (
                        <span key={tam} className="size-pill">{tam}</span>
                      ))}
                    </div>
                  </div>

                  <div className="spec-row">
                    <span className="spec-label">Cores:</span>
                    <span className="colors-text">{prod.cores?.join(', ')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="ask-ai-product-btn"
                  onClick={() => onAskAI(`Como posso usar e combinar o(a) ${prod.nome}? Quais opções de look ficam melhores?`)}
                >
                  <MessageSquarePlus size={15} />
                  <span>Consultar Sofia sobre essa peça</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
