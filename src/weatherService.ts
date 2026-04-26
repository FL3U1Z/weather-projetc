import axios from 'axios'
import type { WeatherData } from '../types/weather'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'
const weatherApi = axios.create({
  baseURL: BASE_URL,
  params: {
    appid: API_KEY,
    units: 'metric',
    lang: 'pt_br',
  },
})

export const getWeatherByCity = async (city: string): Promise<WeatherData> => {
  const response = await weatherApi.get<WeatherData>('/weather', {
    params: { q: city },
  })
  return response.data
}

export const getWeatherByCoords = async (
  lat: number,
  lon: number
): Promise<WeatherData> => {
  const response = await weatherApi.get<WeatherData>('/weather', {
    params: { lat, lon },
  })
  return response.data
}
