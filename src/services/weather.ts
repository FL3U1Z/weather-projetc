import { api } from './api'
import type { WeatherData } from '../types/weather'

export const getWeatherByCity = async (city: string): Promise<WeatherData> => {
  try {
    const response = await api.get<WeatherData>('/weather', {
      params: { q: city },
    })
    return response.data
  } catch (error) {
    throw new Error('Erro ao buscar clima pela cidade')
  }
}

export const getWeatherByCoords = async (
  lat: number,
  lon: number
): Promise<WeatherData> => {
  try {
    const response = await api.get<WeatherData>('/weather', {
      params: { lat, lon },
    })
    return response.data
  } catch (error) {
    throw new Error('Erro ao buscar clima por coordenadas')
  }
}

