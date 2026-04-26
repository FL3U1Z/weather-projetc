import { useWeather } from './hooks/useWeather'
import { SearchBar } from './components/SearchBar'
import { WeatherCard } from './components/WeatherCard'
import { EmptyState } from './components/EmptyState'
import { ErrorState } from './components/ErrorState'
import { LoadingState } from './components/LoadingState'
import { getBackgroundTheme } from './utils/weatherUtils'

function App() {
  const { data, loading, error, fetchByCity, fetchByLocation } = useWeather()

  const theme = data
    ? getBackgroundTheme(data.weather[0].id, data.dt, data.timezone)
    : { from: '#0d1b2a', via: '#1a2f4a', to: '#0f2033' }

  return (
    <div
      className="min-h-screen flex flex-col transition-all duration-1000"
      style={{
        background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.via} 50%, ${theme.to} 100%)`,
      }}
    >
      {/* Decorações de fundo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header - Posição dinâmica */}
        <header
          className={`px-4 transition-all duration-500 ${
            !data && !loading && !error
              ? 'flex-1 flex flex-col items-center justify-center'
              : 'pt-10 pb-6'
          }`}
        >
            <div className="text-center mb-8">
              <h1 className="font-display text-white/90 text-2xl font-bold tracking-widest uppercase">
                Climate App
              </h1>
              <p className="text-white/30 font-body text-xs mt-1">
                Clima em tempo real • OpenWeatherMap
              </p>
            </div>

          <SearchBar
            onSearch={fetchByCity}
            onLocationRequest={fetchByLocation}
            loading={loading}
          />
        </header>

        {/* Corpo */}
          <main className="flex-1 flex items-start justify-center px-4 pb-10">
            <div className="w-full max-w-lg">
              {loading && <LoadingState />}
              {!loading && error && <ErrorState message={error} />}
              {!loading && !error && !data && <EmptyState />}
              {!loading && !error && data && <WeatherCard data={data} />}
            </div>
          </main>

        {/* Footer */}
          <footer className="pb-6 text-center">
            <p className="text-white/20 font-body text-xs">
              Dados fornecidos pela API OpenWeatherMap
            </p>
          </footer>
      </div>
    </div>
  )
}

export default App
