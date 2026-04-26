import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getWeatherByCity, getWeatherByCoords } from '../services/weather'
import * as weatherApi from '../services/weather'

// Mock do axios via api
vi.mock('../services/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('weather service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getWeatherByCity', () => {
    it('deve buscar clima por nome de cidade', async () => {
      const mockData = {
        name: 'São Paulo',
        main: { temp: 25, feels_like: 24 },
        weather: [{ id: 800, description: 'céu limpo' }],
        wind: { speed: 5 },
      }

      const { api } = await import('../services/api')
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData })

      const result = await getWeatherByCity('São Paulo')

      expect(api.get).toHaveBeenCalledWith('/weather', {
        params: { q: 'São Paulo' },
      })
      expect(result).toEqual(mockData)
    })

    it('deve lançar erro quando cidade não é encontrada', async () => {
      const { api } = await import('../services/api')
      vi.mocked(api.get).mockRejectedValueOnce(new Error('404'))

      await expect(getWeatherByCity('CidadeInexistente')).rejects.toThrow(
        'Erro ao buscar clima pela cidade'
      )
    })

    it('deve lançar erro em caso de falha na API', async () => {
      const { api } = await import('../services/api')
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'))

      await expect(getWeatherByCity('São Paulo')).rejects.toThrow(
        'Erro ao buscar clima pela cidade'
      )
    })
  })

  describe('getWeatherByCoords', () => {
    it('deve buscar clima por coordenadas', async () => {
      const mockData = {
        name: 'São Paulo',
        coord: { lat: -23.5505, lon: -46.6333 },
        main: { temp: 25 },
        weather: [{ id: 800 }],
      }

      const { api } = await import('../services/api')
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData })

      const result = await getWeatherByCoords(-23.5505, -46.6333)

      expect(api.get).toHaveBeenCalledWith('/weather', {
        params: { lat: -23.5505, lon: -46.6333 },
      })
      expect(result).toEqual(mockData)
    })

    it('deve lançar erro quando coordenadas são inválidas', async () => {
      const { api } = await import('../services/api')
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Invalid coords'))

      await expect(getWeatherByCoords(999, 999)).rejects.toThrow(
        'Erro ao buscar clima por coordenadas'
      )
    })

    it('deve lançar erro em caso de falha na API', async () => {
      const { api } = await import('../services/api')
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'))

      await expect(getWeatherByCoords(0, 0)).rejects.toThrow(
        'Erro ao buscar clima por coordenadas'
      )
    })

    it('deve funcionar com coordenadas negativas', async () => {
      const mockData = {
        name: 'Buenos Aires',
        coord: { lat: -34.6037, lon: -58.3816 },
      }

      const { api } = await import('../services/api')
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockData })

      const result = await getWeatherByCoords(-34.6037, -58.3816)

      expect(result).toEqual(mockData)
      expect(api.get).toHaveBeenCalledWith('/weather', {
        params: { lat: -34.6037, lon: -58.3816 },
      })
    })
  })
})
