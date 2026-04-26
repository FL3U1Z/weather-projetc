export interface WeatherData {
  name: string
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    humidity: number
    pressure: number
  }
  weather: {
    id: number
    main: string
    description: string
    icon: string
  }[]
  wind: {
    speed: number
    deg: number
  }
  visibility: number
  clouds: {
    all: number
  }
  dt: number
  timezone: number
  coord: {
    lat: number
    lon: number
  }
}

export interface WeatherState {
  data: WeatherData | null
  loading: boolean
  error: string | null
}
