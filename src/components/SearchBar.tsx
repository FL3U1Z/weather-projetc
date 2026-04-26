import { useState, type KeyboardEvent, type FormEvent } from 'react'

interface SearchBarProps {
  onSearch: (city: string) => void
  onLocationRequest: () => void
  loading: boolean
}

export const SearchBar = ({ onSearch, onLocationRequest, loading }: SearchBarProps) => {
  const [value, setValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value.trim()) onSearch(value.trim())
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) onSearch(value.trim())
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">
            🔍
          </span>
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma cidade..."
            disabled={loading}
            className="
              w-full pl-11 pr-4 py-3.5 rounded-2xl
              bg-white/10 border border-white/20
              text-white placeholder-white/40
              font-body text-sm
              focus:outline-none focus:border-white/50 focus:bg-white/15
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
        </div>

        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="
            px-5 py-3.5 rounded-2xl
            bg-white/20 hover:bg-white/30
            border border-white/20
            text-white font-display font-medium text-sm
            transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
            active:scale-95
          "
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            'Buscar'
          )}
        </button>

        <button
          type="button"
          onClick={onLocationRequest}
          disabled={loading}
          title="Usar minha localização"
          className="
            px-4 py-3.5 rounded-2xl
            bg-white/10 hover:bg-white/20
            border border-white/20
            text-white text-lg
            transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
            active:scale-95
          "
        >
          📍
        </button>
      </form>
    </div>
  )
}
