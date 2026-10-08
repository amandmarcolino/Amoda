import { Heart, Trash2, Sparkles, MessageSquareHeart } from 'lucide-react'

export default function FavoritesView({ favorites = [], onToggleFavorite, onAskAI }) {
  if (favorites.length === 0) {
    return (
      <div className="view-container empty-view">
        <div className="empty-icon-box">
          <Heart size={36} color="#c084fc" />
        </div>
        <h2>Sua lista de favoritos está vazia 💜</h2>
        <p>
          Explore nosso catálogo na aba <strong>Produtos</strong> e clique no coração para salvar suas peças preferidas e montar looks sob medida com a Sofia!
        </p>
      </div>
    )
  }

  const handleCombineAll = () => {
    const names = favorites.map((f) => f.nome).join(', ')
    onAskAI(`Tenho estas peças salvas nos meus favoritos: ${names}. Como a Sofia me sugere combiná-las em looks harmônicos?`)
  }

  return (
    <div className="view-container favorites-view">
      <div className="view-header">
        <div>
          <h2>Meus Looks & Peças Favoritas ({favorites.length}) 💜</h2>
          <p>Peças salvas para você planejar suas próximas combinações.</p>
        </div>
        <button
          type="button"
          className="combine-all-btn"
          onClick={handleCombineAll}
        >
          <Sparkles size={16} />
          <span>Montar look com meus favoritos</span>
        </button>
      </div>

      <div className="favorites-grid">
        {favorites.map((prod) => (
          <div key={prod.id} className="fav-item-card">
            <img src={prod.imagem} alt={prod.nome} className="fav-item-img" />
            <div className="fav-item-info">
              <span className="fav-item-cat">{prod.categoria}</span>
              <h4>{prod.nome}</h4>
              <p className="fav-item-price">{prod.preco_formatado}</p>
              <div className="fav-item-sizes">
                {prod.tamanhos?.map((tam) => (
                  <span key={tam} className="size-pill-small">{tam}</span>
                ))}
              </div>
            </div>

            <div className="fav-item-actions">
              <button
                type="button"
                className="fav-ask-btn"
                onClick={() => onAskAI(`Gostei muito do(a) ${prod.nome}. Quais ocasiões e acessórios combinam melhor com essa peça?`)}
                title="Pedir dicas de look para a Sofia"
              >
                <MessageSquareHeart size={16} />
                <span>Dicas de Estilo</span>
              </button>

              <button
                type="button"
                className="fav-remove-btn"
                onClick={() => onToggleFavorite(prod)}
                title="Remover dos favoritos"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
