import type { WeatherData } from '../types/weather'
import {
  getWeatherEmoji,
  getWindDirection,
  formatTime,
} from '../utils/weatherUtils'

interface WeatherCardProps {
  data: WeatherData
}

interface StatItemProps {
  label: string
  value: string
  icon: string
}

const StatItem = ({ label, value, icon }: StatItemProps) => (
  <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white/10 border border-white/10">
    <span className="text-xl">{icon}</span>
    <span className="text-white/50 text-xs font-body uppercase tracking-widest">{label}</span>
    <span className="text-white font-display font-medium text-sm">{value}</span>
  </div>
)

export const WeatherCard = ({ data }: WeatherCardProps) => {
  const emoji = getWeatherEmoji(data.weather[0].id)
  const description = data.weather[0].description
  const sunrise = formatTime(data.sys.sunrise, data.timezone)
  const sunset = formatTime(data.sys.sunset, data.timezone)

  return (
    <div className="w-full max-w-lg mx-auto animate-slide-up">
      {/* Cidade e País */}
      <div className="text-center mb-6">
        <h2 className="font-display text-4xl font-bold text-white tracking-tight">
          {data.name}
          <span className="text-white/40 text-2xl ml-2">{data.sys.country}</span>
        </h2>
        <p className="text-white/60 font-body text-sm mt-1 capitalize">{description}</p>
      </div>

      {/* Temperatura principal */}
      <div className="text-center mb-8">
        <div className="text-8xl mb-2">{emoji}</div>
        <div className="text-white leading-none">
          <span className="text-8xl">{Math.round(data.main.temp)}</span>
          <span className="text-4xl text-white/60">°C</span>
        </div>
        <p className="text-white/50 font-body text-sm mt-2">
          Sensação {Math.round(data.main.feels_like)}°C
          &nbsp;·&nbsp;
          Mín {Math.round(data.main.temp_min)}° / Máx {Math.round(data.main.temp_max)}°
        </p>
      </div>

      {/* Grade de estatísticas */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <StatItem label="Umidade" value={`${data.main.humidity}%`} icon="💧" />
        <StatItem
          label="Vento"
          value={`${Math.round(data.wind.speed)} m/s ${getWindDirection(data.wind.deg)}`}
          icon="💨"
        />
        <StatItem label="Nuvens" value={`${data.clouds.all}%`} icon="☁️" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatItem label="Pressão" value={`${data.main.pressure} hPa`} icon="🌡️" />
        <StatItem
          label="Visibilidade"
          value={`${(data.visibility / 1000).toFixed(1)} km`}
          icon="👁️"
        />
        <StatItem label="Ponto de orvalho" value={`${data.timezone >= 0 ? '+' : ''}${data.timezone / 3600}h`} icon="🌐" />
      </div>

      {/* Nascer e pôr do sol */}
      <div className="mt-3 flex gap-2">
        <div className="flex-1 flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/10">
          <span className="text-xl">🌅</span>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest font-body">Nascer do sol</p>
            <p className="text-white font-display font-medium text-sm">{sunrise}</p>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/10">
          <span className="text-xl">🌇</span>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest font-body">Pôr do sol</p>
            <p className="text-white font-display font-medium text-sm">{sunset}</p>
          </div>
        </div>
      </div>

      {/* Coordenadas */}
      <p className="text-center text-white/25 font-body text-xs mt-4">
        {data.coord.lat.toFixed(2)}°, {data.coord.lon.toFixed(2)}°
      </p>
    </div>
  )
}
