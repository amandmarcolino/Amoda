import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import ChatWindow from './components/ChatWindow'
import BoutiqueStore from './components/BoutiqueStore'
import { checkBackendHealth, fetchMetrics } from './services/api'

/**
 * Componente Principal da Aplicação (App.jsx)
 * Responsável por:
 * 1. Monitorar a saúde e conectividade da API FastAPI (/api/metrics e health check periódico).
 * 2. Renderizar o Header institucional (Afesu Veleiros & SENAI-SP) com status em tempo real.
 * 3. Renderizar o ChatWindow.jsx como experiência central de IA e Voz.
 * 4. Permitir alternar suavemente entre a Consultora Sofia (Chatbot) e a Vitrine da Loja Boutique AMODA.
 */
export default function App() {
  // 1. ESTADO DE CONECTIVIDADE E MÉTRICAS DA API
  const [apiStatus, setApiStatus] = useState('checking') // 'online' | 'offline' | 'checking'
  const [apiMetrics, setApiMetrics] = useState(null)

  // 2. ESTADO DE TEMA (CLARO / ESCURO)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('amoda_theme') || 'light'
    } catch {
      return 'light'
    }
  })

  // 3. VISUALIZAÇÃO ATIVA ('chat' = Chatbot Principal | 'store' = Loja Boutique)
  const [activeView, setActiveView] = useState('chat')

  // Aplica e sincroniza o tema no elemento HTML raiz
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('amoda_theme', theme)
    } catch (err) {
      console.warn('Erro ao salvar preferência de tema:', err)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // Função para verificar saúde da API
  const performHealthCheck = useCallback(async () => {
    setApiStatus((current) => (current === 'online' ? 'online' : 'checking'))
    try {
      const isHealthy = await checkBackendHealth()
      if (isHealthy) {
        setApiStatus('online')
        const metricsData = await fetchMetrics()
        if (metricsData) {
          setApiMetrics(metricsData)
        }
      } else {
        setApiStatus('offline')
      }
    } catch {
      setApiStatus('offline')
    }
  }, [])

  // Health check inicial e verificação periódica a cada 10 segundos
  useEffect(() => {
    performHealthCheck()
    const intervalId = setInterval(performHealthCheck, 10000)
    return () => clearInterval(intervalId)
  }, [performHealthCheck])

  return (
    <div className="app-root-wrapper" data-theme={theme}>
      {/* 1. CABEÇALHO INSTITUCIONAL COM STATUS DA API */}
      <Header
        apiStatus={apiStatus}
        metrics={apiMetrics}
        onRefreshHealth={performHealthCheck}
        activeView={activeView}
        onViewChange={setActiveView}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* 2. RENDERIZAÇÃO DA EXPERIÊNCIA PRINCIPAL */}
      {activeView === 'chat' ? (
        <main className="app-chat-main-layout">
          <div className="app-chat-body-container">
            <ChatWindow
              speechEnabled={true}
              onOpenStore={() => setActiveView('store')}
            />
          </div>
        </main>
      ) : (
        <BoutiqueStore />
      )}
    </div>
  )
}
