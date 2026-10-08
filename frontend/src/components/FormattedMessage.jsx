import { useMemo } from 'react'
import { marked } from 'marked'

// Configurações padrão do marked para segurança e quebra de linhas amigável
marked.setOptions({
  breaks: true,
  gfm: true
})

/**
 * Componente que renderiza texto em Markdown seguro.
 * @param {Object} props
 * @param {string} props.content - Texto em Markdown retornado pela IA ou usuário
 * @param {string} [props.className] - Classes CSS adicionais
 */
export default function FormattedMessage({ content = '', className = '' }) {
  const htmlContent = useMemo(() => {
    if (!content) return ''
    try {
      return marked.parse(content)
    } catch (error) {
      console.error('Erro ao converter Markdown:', error)
      return content
    }
  }, [content])

  return (
    <div
      className={`formatted-message ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
