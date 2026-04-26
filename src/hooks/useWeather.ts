import { useState, useCallback } from 'react'
import { getWeatherByCity, getWeatherByCoords } from '../services/weather.ts'
import type { WeatherData, WeatherState } from '../types/weather'

export const useWeather = () => {
  const [state, setState] = useState<WeatherState>({
    data: null,
    loading: false,
    error: null,
  })

  const fetchByCity = useCallback(async (city: string) => {
    if (!city.trim()) return

    setState({ data: null, loading: true, error: null })
    try {
      const data = await getWeatherByCity(city)
      setState({ data, loading: false, error: null })
    } catch (err: unknown) {
      const message =
        (err as { response?: { status?: number } })?.response?.status === 404
          ? 'Cidade não encontrada. Verifique o nome e tente novamente.'
          : 'Erro ao buscar dados. Verifique sua conexão.'
      setState({ data: null, loading: false, error: message })
    }
  }, [])

  const fetchByLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocalização não suportada.' }))
      return
    }

    setState({ data: null, loading: true, error: null })
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const data = await getWeatherByCoords(coords.latitude, coords.longitude)
          setState({ data, loading: false, error: null })
        } catch {
          setState({ data: null, loading: false, error: 'Erro ao buscar localização.' })
        }
      },
      () => {
        setState({ data: null, loading: false, error: 'Permissão de localização negada.' })
      }
    )
  }, [])

  return { ...state, fetchByCity, fetchByLocation }
}

export type UseWeatherReturn = ReturnType<typeof useWeather>
