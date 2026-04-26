// Retorna emoji baseado no código de condição da OpenWeatherMap
export const getWeatherEmoji = (weatherId: number): string => {
  if (weatherId >= 200 && weatherId < 300) return '⛈️'
  if (weatherId >= 300 && weatherId < 400) return '🌦️'
  if (weatherId >= 500 && weatherId < 600) {
    if (weatherId === 511) return '🌨️'
    if (weatherId < 504) return '🌧️'
    return '🌦️'
  }
  if (weatherId >= 600 && weatherId < 700) return '❄️'
  if (weatherId >= 700 && weatherId < 800) return '🌫️'
  if (weatherId === 800) return '☀️'
  if (weatherId === 801) return '🌤️'
  if (weatherId === 802) return '⛅'
  if (weatherId >= 803) return '☁️'
  return '🌡️'
}

export const getWindDirection = (deg: number): string => {
  const dirs = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO']
  return dirs[Math.round(deg / 45) % 8]
}

export const formatTime = (unix: number, timezoneOffset: number): string => {
  const date = new Date((unix + timezoneOffset) * 1000)
  const hours = date.getUTCHours().toString().padStart(2, '0')
  const minutes = date.getUTCMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// Retorna o gradiente de fundo baseado na hora local da cidade e condição
export const getBackgroundTheme = (
  weatherId: number,
  dt: number,
  timezone: number
): { from: string; via: string; to: string } => {
  const localHour = new Date((dt + timezone) * 1000).getUTCHours()
  const isNight = localHour < 6 || localHour >= 19
  const isDawn = localHour >= 5 && localHour < 8
  const isDusk = localHour >= 17 && localHour < 20

  if (weatherId >= 200 && weatherId < 700) {
    return { from: '#1a1f3c', via: '#2d3561', to: '#1e3a5f' }
  }
  if (isNight) {
    return { from: '#0d1b2a', via: '#1a2f4a', to: '#0f2033' }
  }
  if (isDawn || isDusk) {
    return { from: '#1a1035', via: '#7c3d6b', to: '#e85d1b' }
  }
  if (weatherId === 800) {
    return { from: '#0f3b6e', via: '#1a6fbb', to: '#38a0e8' }
  }
  return { from: '#1e3a5f', via: '#2563a8', to: '#4a86c8' }
}
