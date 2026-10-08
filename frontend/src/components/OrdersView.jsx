import { useState } from 'react'
import { Package, Search, Truck, CheckCircle2, Clock, MessageSquare, AlertCircle } from 'lucide-react'
import { fetchOrderStatus } from '../services/api'

const SAMPLE_ORDERS = [
  {
    id: 'PED-1048',
    cliente: 'Fernanda Lima',
    data: '16/09/2026',
    itens: ['Vestido Midi Floral Aurora (Tamanho M, Lilás)'],
    total: 'R$ 289,90',
    status: 'Saiu para entrega',
    rastreio: 'BR892173009BR',
    transportadora: 'Sedex Express',
    previsao_entrega: 'Hoje até às 18h'
  },
  {
    id: 'PED-2099',
    cliente: 'Camila Souza',
    data: '15/09/2026',
    itens: [
      'Blazer Alfaiataria Paris (Tamanho P, Lavanda)',
      'Calça Wide Leg Alfaiataria (Tamanho 38, Lilás Pastel)'
    ],
    total: 'R$ 649,80',
    status: 'Pedido faturado e em separação',
    rastreio: 'AM998231002BR',
    transportadora: 'Loggi Express',
    previsao_entrega: 'Em até 2 dias úteis'
  },
  {
    id: 'PED-3050',
    cliente: 'Mariana Ribeiro',
    data: '10/09/2026',
    itens: ['Conjunto Linho Puro Riviera (Tamanho G, Cru Natural)'],
    total: 'R$ 349,90',
    status: 'Entregue com sucesso',
    rastreio: 'BR112233445BR',
    transportadora: 'Total Express',
    previsao_entrega: 'Entregue em 14/09/2026'
  }
]

export default function OrdersView({ onAskAI }) {
  const [searchCode, setSearchCode] = useState('')
  const [searchedOrder, setSearchedOrder] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchCode.trim()) return

    setIsLoading(true)
    setErrorMsg('')
    setSearchedOrder(null)

    try {
      const order = await fetchOrderStatus(searchCode.trim())
      setSearchedOrder(order)
    } catch (err) {
      setErrorMsg(err.message || 'Pedido não encontrado. Verifique o código.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    if (status.includes('Entregue')) {
      return <span className="order-status-badge delivered"><CheckCircle2 size={13} /> Entregue</span>
    }
    if (status.includes('Saiu para entrega')) {
      return <span className="order-status-badge in-transit"><Truck size={13} /> Em Trânsito</span>
    }
    return <span className="order-status-badge processing"><Clock size={13} /> Em Separação</span>
  }

  return (
    <div className="view-container orders-view">
      <div className="view-header">
        <div>
          <h2>Rastreamento de Pedidos 📦</h2>
          <p>Consulte o status em tempo real das suas compras na Amoda.</p>
        </div>
      </div>

      {/* Formulário de Busca de Pedido */}
      <form className="order-search-box" onSubmit={handleSearch}>
        <div className="search-input-field">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Digite o código do pedido (Ex: PED-1048, PED-2099)..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
        </div>
        <button type="submit" className="order-search-btn" disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Rastrear Pedido'}
        </button>
      </form>

      {errorMsg && (
        <div className="order-error-banner">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Resultado da busca específica */}
      {searchedOrder && (
        <div className="searched-order-highlight">
          <div className="order-card-header">
            <div className="order-id-group">
              <Package size={20} color="#c084fc" />
              <h3>{searchedOrder.id}</h3>
              <span className="order-client-name">• {searchedOrder.cliente}</span>
            </div>
            {getStatusBadge(searchedOrder.status)}
          </div>

          <div className="order-card-body">
            <div className="order-items-list">
              <strong>Itens Comprados:</strong>
              <ul>
                {searchedOrder.itens?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="order-meta-grid">
              <div>
                <span className="label">Total Pago:</span>
                <strong>{searchedOrder.total}</strong>
              </div>
              <div>
                <span className="label">Transportadora:</span>
                <span>{searchedOrder.transportadora}</span>
              </div>
              <div>
                <span className="label">Código de Rastreio:</span>
                <code className="tracking-code">{searchedOrder.rastreio}</code>
              </div>
              <div>
                <span className="label">Previsão:</span>
                <span className="forecast">{searchedOrder.previsao_entrega}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="ask-order-ai-btn"
            onClick={() => onAskAI(`Qual é o status e previsão de entrega do pedido ${searchedOrder.id}?`)}
          >
            <MessageSquare size={16} />
            <span>Tirar dúvidas sobre este pedido com a Sofia</span>
          </button>
        </div>
      )}

      {/* Lista de Pedidos Cadastrados */}
      <h3 className="section-subtitle">Exemplos de Pedidos em Andamento</h3>
      <div className="orders-list">
        {SAMPLE_ORDERS.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <div className="order-id-group">
                <Package size={18} color="#c084fc" />
                <h4>{order.id}</h4>
                <span className="order-date">• {order.data}</span>
              </div>
              {getStatusBadge(order.status)}
            </div>

            <div className="order-card-body">
              <div className="order-items-list">
                <ul>
                  {order.itens.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="order-meta-footer">
                <span className="order-total-price">Total: {order.total}</span>
                <span className="order-tracking-info">Rastreio: <code>{order.rastreio}</code></span>
              </div>
            </div>

            <div className="order-card-actions">
              <button
                type="button"
                className="btn-order-chat"
                onClick={() => onAskAI(`Gostaria de saber mais sobre o andamento do pedido ${order.id}.`)}
              >
                <MessageSquare size={14} />
                <span>Consultar no Chat com Sofia</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
