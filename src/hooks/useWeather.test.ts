import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useWeather } from '../hooks/useWeather'

// Mock dos serviços
vi.mock('../services/weather', () => ({
  getWeatherByCity: vi.fn(),
  getWeatherByCoords: vi.fn(),
}))

const mockWeatherData = {
  name: 'São Paulo',
  coord: { lat: -23.5505, lon: -46.6333 },
  dt: 1640000000,
  timezone: 3600,
  main: { temp: 25, feels_like: 24, temp_min: 20, temp_max: 30, humidity: 70 },
  weather: [{ id: 800, main: 'Clear', description: 'céu limpo' }],
  wind: { speed: 5, deg: 90 },
  clouds: { all: 10 },
  visibility: 10000,
  pressure: 1013,
  sys: { sunrise: 1639970000, sunset: 1640005000 },
}

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar estado inicial', () => {
    const { result } = renderHook(() => useWeather())

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('deve ter funções fetchByCity e fetchByLocation', () => {
    const { result } = renderHook(() => useWeather())

    expect(typeof result.current.fetchByCity).toBe('function')
    expect(typeof result.current.fetchByLocation).toBe('function')
  })

  describe('fetchByCity', () => {
    it('deve buscar clima por cidade com sucesso', async () => {
      const { getWeatherByCity } = await import('../services/weather')
      vi.mocked(getWeatherByCity).mockResolvedValueOnce(mockWeatherData)

      const { result } = renderHook(() => useWeather())

      await act(async () => {
        await result.current.fetchByCity('São Paulo')
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual(mockWeatherData)
      expect(result.current.error).toBeNull()
    })

    it('deve definir loading como true durante a busca', async () => {
      const { getWeatherByCity } = await import('../services/weather')
      vi.mocked(getWeatherByCity).mockImplementationOnce(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve(mockWeatherData), 100)
          )
      )

      const { result } = renderHook(() => useWeather())

      act(() => {
        result.current.fetchByCity('São Paulo')
      })

      expect(result.current.loading).toBe(true)
    })

    it('deve ignorar busca vazia', async () => {
      const { getWeatherByCity } = await import('../services/weather')

      const { result } = renderHook(() => useWeather())

      await act(async () => {
        await result.current.fetchByCity('')
      })

      expect(getWeatherByCity).not.toHaveBeenCalled()
      expect(result.current.data).toBeNull()
    })

    it('deve ignorar busca apenas com espaços', async () => {
      const { getWeatherByCity } = await import('../services/weather')

      const { result } = renderHook(() => useWeather())

      await act(async () => {
        await result.current.fetchByCity('   ')
      })

      expect(getWeatherByCity).not.toHaveBeenCalled()
    })

    it('deve definir erro quando cidade não é encontrada (404)', async () => {
      const { getWeatherByCity } = await import('../services/weather')
      const error = new Error('Cidade não encontrada')
      ;(error as any).response = { status: 404 }
      vi.mocked(getWeatherByCity).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useWeather())

      await act(async () => {
        await result.current.fetchByCity('CidadeInexistente')
      })

      await waitFor(() => {
        expect(result.current.error).toBeDefined()
      })

      expect(result.current.error).toContain('Cidade não encontrada')
      expect(result.current.data).toBeNull()
    })

    it('deve definir erro genérico em caso de falha de conexão', async () => {
      const { getWeatherByCity } = await import('../services/weather')
      vi.mocked(getWeatherByCity).mockRejectedValueOnce(
        new Error('Network error')
      )

      const { result } = renderHook(() => useWeather())

      await act(async () => {
        await result.current.fetchByCity('São Paulo')
      })

      await waitFor(() => {
        expect(result.current.error).toBeDefined()
      })

      expect(result.current.error).toContain('Verifique sua conexão')
      expect(result.current.data).toBeNull()
    })
  })

  describe('fetchByLocation', () => {
    it('deve retornar erro se geolocalização não suportada', async () => {
      // Simular navegador sem suporte a geolocalização
      const originalGeolocation = global.navigator.geolocation
      Object.defineProperty(global.navigator, 'geolocation', {
        value: null,
        configurable: true,
      })

      const { result } = renderHook(() => useWeather())

      await act(async () => {
        await result.current.fetchByLocation()
      })

      expect(result.current.error).toContain('Geolocalização não suportada')

      // Restaurar geolocalização
      Object.defineProperty(global.navigator, 'geolocation', {
        value: originalGeolocation,
        configurable: true,
      })
    })

    it('deve chamar getCurrentPosition quando geolocalização é suportada', async () => {
      const mockGetCurrentPosition = vi.fn()
      global.navigator.geolocation.getCurrentPosition = mockGetCurrentPosition

      const { result } = renderHook(() => useWeather())

      await act(async () => {
        result.current.fetchByLocation()
      })

      expect(mockGetCurrentPosition).toHaveBeenCalled()
    })

    it('deve buscar clima com sucesso usando coordenadas', async () => {
      const { getWeatherByCoords } = await import('../services/weather')
      vi.mocked(getWeatherByCoords).mockResolvedValueOnce(mockWeatherData)

      const mockGetCurrentPosition = vi.fn((successCallback) => {
        successCallback({
          coords: { latitude: -23.5505, longitude: -46.6333 },
        })
      })
      global.navigator.geolocation.getCurrentPosition = mockGetCurrentPosition

      const { result } = renderHook(() => useWeather())

      await act(async () => {
        result.current.fetchByLocation()
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(getWeatherByCoords).toHaveBeenCalledWith(-23.5505, -46.6333)
      expect(result.current.data).toEqual(mockWeatherData)
    })

    it('deve definir erro quando permissão é negada', async () => {
      const mockGetCurrentPosition = vi.fn((_, errorCallback) => {
        errorCallback(new Error('Permission denied'))
      })
      global.navigator.geolocation.getCurrentPosition = mockGetCurrentPosition

      const { result } = renderHook(() => useWeather())

      await act(async () => {
        result.current.fetchByLocation()
      })

      await waitFor(() => {
        expect(result.current.error).toBeDefined()
      })

      expect(result.current.error).toContain('Permissão de localização negada')
    })

    it('deve definir erro quando busca de localização falha', async () => {
      const mockGetCurrentPosition = vi.fn((successCallback) => {
        successCallback({
          coords: { latitude: 0, longitude: 0 },
        })
      })
      global.navigator.geolocation.getCurrentPosition = mockGetCurrentPosition

      const { getWeatherByCoords } = await import('../services/weather')
      vi.mocked(getWeatherByCoords).mockRejectedValueOnce(
        new Error('API error')
      )

      const { result } = renderHook(() => useWeather())

      await act(async () => {
        result.current.fetchByLocation()
      })

      await waitFor(() => {
        expect(result.current.error).toBeDefined()
      })

      expect(result.current.error).toContain('Erro ao buscar localização')
    })
  })

  describe('estado retornado', () => {
    it('deve retornar spread do estado corretamente', () => {
      const { result } = renderHook(() => useWeather())

      expect(result.current).toHaveProperty('data')
      expect(result.current).toHaveProperty('loading')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('fetchByCity')
      expect(result.current).toHaveProperty('fetchByLocation')
    })
  })
})
