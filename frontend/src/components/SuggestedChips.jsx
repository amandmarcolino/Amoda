import { Sparkles } from 'lucide-react'

export default function SuggestedChips({ chips, onSelectChip, disabled }) {
  if (!chips || chips.length === 0) return null

  return (
    <div className="quick-chips-wrapper" aria-label="Sugestões de perguntas">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          type="button"
          className="chip-btn"
          onClick={() => onSelectChip(chip)}
          disabled={disabled}
        >
          <Sparkles size={13} />
          <span>{chip}</span>
        </button>
      ))}
    </div>
  )
}
