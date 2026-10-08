import { MessageSquareHeart, Sparkles, Heart, PackageCheck, Headphones, Settings } from 'lucide-react'

export default function NavigationMenu({ activeTab, onTabChange, favoritesCount = 0 }) {
  const tabs = [
    { id: 'inicio', label: 'Início (Loja)', icon: Sparkles },
    { id: 'chat', label: 'Consultora Sofia (IA)', icon: MessageSquareHeart },
    { id: 'produtos', label: 'Catálogo', icon: PackageCheck },
    { id: 'favoritos', label: 'Favoritos', icon: Heart, count: favoritesCount },
    { id: 'pedidos', label: 'Meus pedidos', icon: PackageCheck },
    { id: 'atendimento', label: 'Suporte', icon: Headphones },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ]

  return (
    <nav className="amoda-nav-menu" aria-label="Menu Principal Amoda">
      <div className="nav-tabs-wrapper">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={17} className="tab-icon" />
              <span className="tab-label">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="tab-counter-badge">{tab.count}</span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
