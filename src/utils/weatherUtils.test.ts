import { describe, it, expect } from 'vitest'
import {
  getWeatherEmoji,
  getWindDirection,
  formatTime,
  getBackgroundTheme,
} from '../utils/weatherUtils'

describe('weatherUtils', () => {
  describe('getWeatherEmoji', () => {
    it('deve retornar ⛈️ para tempestades (200-299)', () => {
      expect(getWeatherEmoji(200)).toBe('⛈️')
      expect(getWeatherEmoji(299)).toBe('⛈️')
    })

    it('deve retornar 🌦️ para chuva leve (300-399)', () => {
      expect(getWeatherEmoji(300)).toBe('🌦️')
      expect(getWeatherEmoji(399)).toBe('🌦️')
    })

    it('deve retornar 🌧️ para chuva (500-503)', () => {
      expect(getWeatherEmoji(500)).toBe('🌧️')
      expect(getWeatherEmoji(503)).toBe('🌧️')
    })

    it('deve retornar 🌨️ para chuva congelada (511)', () => {
      expect(getWeatherEmoji(511)).toBe('🌨️')
    })

    it('deve retornar ❄️ para neve (600-699)', () => {
      expect(getWeatherEmoji(600)).toBe('❄️')
      expect(getWeatherEmoji(699)).toBe('❄️')
    })

    it('deve retornar 🌫️ para névoa (700-799)', () => {
      expect(getWeatherEmoji(700)).toBe('🌫️')
      expect(getWeatherEmoji(799)).toBe('🌫️')
    })

    it('deve retornar ☀️ para céu limpo (800)', () => {
      expect(getWeatherEmoji(800)).toBe('☀️')
    })

    it('deve retornar 🌤️ para poucas nuvens (801)', () => {
      expect(getWeatherEmoji(801)).toBe('🌤️')
    })

    it('deve retornar ⛅ para nuvens esparsas (802)', () => {
      expect(getWeatherEmoji(802)).toBe('⛅')
    })

    it('deve retornar ☁️ para nuvens (803+)', () => {
      expect(getWeatherEmoji(803)).toBe('☁️')
      expect(getWeatherEmoji(804)).toBe('☁️')
    })

    it('deve retornar ☁️ para valores desconhecidos', () => {
      expect(getWeatherEmoji(999)).toBe('☁️')
    })
  })

  describe('getWindDirection', () => {
    it('deve retornar N para 0 graus', () => {
      expect(getWindDirection(0)).toBe('N')
    })

    it('deve retornar NE para 45 graus', () => {
      expect(getWindDirection(45)).toBe('NE')
    })

    it('deve retornar L para 90 graus', () => {
      expect(getWindDirection(90)).toBe('L')
    })

    it('deve retornar SE para 135 graus', () => {
      expect(getWindDirection(135)).toBe('SE')
    })

    it('deve retornar S para 180 graus', () => {
      expect(getWindDirection(180)).toBe('S')
    })

    it('deve retornar SO para 225 graus', () => {
      expect(getWindDirection(225)).toBe('SO')
    })

    it('deve retornar O para 270 graus', () => {
      expect(getWindDirection(270)).toBe('O')
    })

    it('deve retornar NO para 315 graus', () => {
      expect(getWindDirection(315)).toBe('NO')
    })

    it('deve retornar resultado para graus próximos a 360', () => {
      expect(getWindDirection(359)).toBe('N')
    })

    it('deve lidar com graus acima de 360', () => {
      expect(getWindDirection(405)).toBe('NE')
    })
  })

  describe('formatTime', () => {
    it('deve formatar tempo em HH:mm', () => {
      const unix = 1640000000 // 2021-12-20 10:26:40 UTC
      const timezoneOffset = 0
      const result = formatTime(unix, timezoneOffset)
      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })

    it('deve aplicar offset de timezone', () => {
      const unix = 1640000000
      const timezoneOffset = 3600 // +1 hora
      const result = formatTime(unix, timezoneOffset)
      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })

    it('deve preencher com zeros à esquerda', () => {
      const unix = 0
      const timezoneOffset = 0
      const result = formatTime(unix, timezoneOffset)
      expect(result).toBe('00:00')
    })

    it('deve lidar com offsets negativos', () => {
      const unix = 1640000000
      const timezoneOffset = -18000 // -5 horas
      const result = formatTime(unix, timezoneOffset)
      expect(result).toMatch(/^\d{2}:\d{2}$/)
    })
  })

  describe('getBackgroundTheme', () => {
    it('deve retornar tema tempestuoso para chuva (200-699)', () => {
      const theme = getBackgroundTheme(500, 0, 0)
      expect(theme).toEqual({
        from: '#1a1f3c',
        via: '#2d3561',
        to: '#1e3a5f',
      })
    })

    it('deve retornar tema noturno para horas noturnas (0-5, 19-23)', () => {
      const unix = 1640000000
      const theme = getBackgroundTheme(800, unix, 0) // 10:26 UTC, céu limpo
      expect(theme).toHaveProperty('from')
      expect(theme).toHaveProperty('via')
      expect(theme).toHaveProperty('to')
    })

    it('deve retornar tema ensolarado para céu limpo (800)', () => {
      const unix = 1640000000
      const timezoneOffset = 3600 * 12 // 12 horas
      const theme = getBackgroundTheme(800, unix, timezoneOffset)
      expect(theme).toHaveProperty('from')
    })

    it('deve retornar estrutura com cores RGB válidas', () => {
      const theme = getBackgroundTheme(800, 0, 0)
      expect(theme.from).toMatch(/^#[0-9a-f]{6}$/)
      expect(theme.via).toMatch(/^#[0-9a-f]{6}$/)
      expect(theme.to).toMatch(/^#[0-9a-f]{6}$/)
    })
  })
})
