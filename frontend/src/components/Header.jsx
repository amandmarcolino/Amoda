import { useState, useEffect } from 'react'
import {
  Activity,
  Bot,
  Sparkles,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  GraduationCap,
  Cpu,
  RefreshCw,
  ShoppingBag,
  MessageSquareHeart,
  Heart
} from 'lucide-react'

/**
 * Componente Header da Marca AMODA (Header.jsx)
 * Exibe:
 * - Logotipo Principal da Marca: AMODA (Moda Feminina Sustentável & Consultoria de Estilo)
 * - Identificação do Projeto & Curso: AFESU Veleiros × SENAI-SP
 * - Status de conexão em tempo real com a API FastAPI (Online / Offline)
 * - Alternância entre Chatbot IA e Loja Boutique / Modo Dark & Light
 */
export default function Header({
  apiStatus = 'checking', // 'online' | 'offline' | 'checking'
  metrics = null,
  onRefreshHealth = null,
  activeView = 'chat',
  onViewChange = null,
  theme = 'light',
  onToggleTheme = null
}) {
  const isOnline = apiStatus === 'online'
  const isChecking = apiStatus === 'checking'

  return (
    <header className="institutional-header">
      <div className="institutional-header-container">
        {/* Lado Esquerdo: Identidade Visual da Marca AMODA */}
        <div className="header-brand-group">
          <div className="header-brand-badge">
            <div className="brand-logo-icon">
              <Sparkles size={20} className="logo-sparkle-icon" />
            </div>
            <div className="brand-titles">
              <div className="brand-institution-row">
                <span className="brand-main-amoda">AMODA</span>
                <span className="brand-amoda-badge">SUSTENTÁVEL</span>
              </div>
              <div className="brand-course-row">
                <span className="brand-tagline">Consultoria de Moda & Estilo com IA e Voz</span>
              </div>
            </div>
          </div>

          {/* Badge de Parceria Institucional AFESU × SENAI-SP */}
          <div className="header-project-pill" title="Projeto desenvolvido no Curso de IA e Full-Stack">
            <GraduationCap size={13} className="pill-star" />
            <span>AFESU Veleiros × SENAI-SP</span>
          </div>
        </div>

        {/* Lado Direito: Ações, Status da API e Controles */}
        <div className="header-actions-group">
          {/* Navegação Rápida entre Chatbot e Loja */}
          {onViewChange && (
            <div className="view-switcher-group">
              <button
                type="button"
                className={`view-switch-btn ${activeView === 'chat' ? 'active' : ''}`}
                onClick={() => onViewChange('chat')}
                title="Abrir Chatbot com a Consultora Sofia"
              >
                <MessageSquareHeart size={15} />
                <span>Consultora Sofia</span>
              </button>
              <button
                type="button"
                className={`view-switch-btn ${activeView === 'store' ? 'active' : ''}`}
                onClick={() => onViewChange('store')}
                title="Abrir Vitrine da Loja Amoda"
              >
                <ShoppingBag size={15} />
                <span>Loja Boutique</span>
              </button>
            </div>
          )}

          {/* Status da Conexão com a API */}
          <div
            className={`api-status-pill ${
              isOnline ? 'status-online' : isChecking ? 'status-checking' : 'status-offline'
            }`}
            title={`Status do Backend FastAPI: ${
              isOnline ? 'Online (Pronto para atender)' : isChecking ? 'Verificando status...' : 'Offline (Não foi possível conectar a http://127.0.0.1:8000)'
            }`}
          >
            <span className="status-indicator-dot">
              <span className="pulse-wave" />
            </span>
            <div className="status-text-block">
              <span className="status-label">API Backend</span>
              <span className="status-state">
                {isOnline ? 'Online' : isChecking ? 'Conectando...' : 'Offline'}
              </span>
            </div>
            {onRefreshHealth && (
              <button
                type="button"
                className="status-refresh-btn"
                onClick={onRefreshHealth}
                title="Verificar status da API novamente"
              >
                <RefreshCw size={13} className={isChecking ? 'spin-animation' : ''} />
              </button>
            )}
          </div>

          {/* Alternância de Tema */}
          {onToggleTheme && (
            <button
              type="button"
              className="header-theme-toggle-btn"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
