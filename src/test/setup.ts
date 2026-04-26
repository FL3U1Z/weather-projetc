import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

// Mock de geolocalização
global.navigator.geolocation = {
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
}
