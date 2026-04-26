import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

if (!API_KEY) {
  throw new Error('❌ VITE_OPENWEATHER_API_KEY não está definida no .env')
}

export const api = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  params: {
    appid: API_KEY,
    units: 'metric',
    lang: 'pt_br',
  },
})