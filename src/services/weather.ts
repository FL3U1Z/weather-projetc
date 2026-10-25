import axios from 'axios'
import { api } from './api'
import type { WeatherData } from '../types/weather'

// Mantém o status HTTP no erro: o hook usa response.status para distinguir o 404.
const erroDoServico = (mensagem: string, causa?: unknown) =>
  Object.assign(new Error(mensagem), {
    response: axios.isAxiosError(causa) ? { status: causa.response?.status } : undefined,
  })

// Um 200 fora do contrato (sem weather, HTML de proxy, corpo vazio) é tratado como falha,
// em vez de chegar à tela e derrubar a renderização.
const respostaValida = (data: unknown): data is WeatherData => {
  const d = data as Partial<WeatherData> | null
  return (
    typeof d === 'object' &&
    d !== null &&
    typeof d.name === 'string' &&
    typeof d.main === 'object' &&
    Array.isArray(d.weather) &&
    d.weather.length > 0
  )
}

const buscarClima = async (params: Record<string, string | number>, mensagem: string) => {
  let data: unknown
  try {
    data = (await api.get<WeatherData>('/weather', { params })).data
  } catch (error) {
    throw erroDoServico(mensagem, error)
  }
  if (!respostaValida(data)) throw erroDoServico(mensagem)
  return data
}

export const getWeatherByCity = (city: string): Promise<WeatherData> =>
  buscarClima({ q: city }, 'Erro ao buscar clima pela cidade')

export const getWeatherByCoords = (lat: number, lon: number): Promise<WeatherData> =>
  buscarClima({ lat, lon }, 'Erro ao buscar clima por coordenadas')
