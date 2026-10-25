import { http, HttpResponse, delay, type HttpResponseResolver } from 'msw'
import { setupServer } from 'msw/node'

// Servidor que simula a OpenWeatherMap na camada de rede.
// Todo o resto (componentes, hook, service e axios) roda de verdade.

export const URL_CLIMA = 'https://api.openweathermap.org/data/2.5/weather'

export interface RequisicaoRegistrada {
  metodo: string
  params: Record<string, string>
}

export const requisicoes: RequisicaoRegistrada[] = []

let resolvedor: HttpResponseResolver = () => HttpResponse.json(fixtureSaoPaulo())

export const servidor = setupServer(
  http.get(URL_CLIMA, async info => {
    const params: Record<string, string> = {}
    new URL(info.request.url).searchParams.forEach((valor, chave) => (params[chave] = valor))
    requisicoes.push({ metodo: info.request.method, params })
    return resolvedor(info)
  })
)

/** Define como a API simulada responde nas próximas requisições. */
export const responderCom = (novoResolvedor: HttpResponseResolver) => {
  resolvedor = novoResolvedor
}

export const responderJson = (corpo: unknown, status = 200) =>
  responderCom(() => HttpResponse.json(corpo as never, { status }))

export const responderErro = (status: number, corpo: unknown) =>
  responderCom(() => HttpResponse.json(corpo as never, { status }))

export const responderErroDeRede = () => responderCom(() => HttpResponse.error())

export const responderTexto = (status: number, corpo: string, contentType: string) =>
  responderCom(() => new HttpResponse(corpo, { status, headers: { 'Content-Type': contentType } }))

/** A requisição chega, mas a resposta nunca é enviada. */
export const nuncaResponder = () =>
  responderCom(async () => {
    await delay('infinite')
    return HttpResponse.json({})
  })

/** Segura a resposta até o teste chamar a função devolvida. */
export const responderPendente = (corpo: unknown) => {
  let liberar!: () => void
  const liberada = new Promise<void>(resolve => (liberar = resolve))
  responderCom(async () => {
    await liberada
    return HttpResponse.json(corpo as never)
  })
  return liberar
}

/** Cada requisição recebe a próxima resposta da lista. */
export const responderEmSequencia = (...respostas: HttpResponseResolver[]) => {
  let indice = 0
  responderCom(info => respostas[Math.min(indice++, respostas.length - 1)](info))
}

export const json = (corpo: unknown, status = 200): HttpResponseResolver => () =>
  HttpResponse.json(corpo as never, { status })

export const reiniciarServidor = () => {
  requisicoes.length = 0
  resolvedor = () => HttpResponse.json(fixtureSaoPaulo())
}

// ---------- Fixtures no formato do contrato (prompts/00-contexto-comum.md) ----------

export const fixtureSaoPaulo = () => ({
  name: 'São Paulo',
  coord: { lat: -23.55, lon: -46.63 },
  weather: [{ id: 803, main: 'Clouds', description: 'nublado', icon: '04d' }],
  main: { temp: 22.4, feels_like: 22.1, temp_min: 20.9, temp_max: 23.8, humidity: 68, pressure: 1017 },
  visibility: 10000,
  wind: { speed: 3.6, deg: 140 },
  clouds: { all: 75 },
  dt: 1761400000,
  sys: { country: 'BR', sunrise: 1761380000, sunset: 1761426000 },
  timezone: -10800,
})

export const fixtureCidade = (name: string, country: string, temp: number) => ({
  ...fixtureSaoPaulo(),
  name,
  sys: { ...fixtureSaoPaulo().sys, country },
  main: { ...fixtureSaoPaulo().main, temp },
})

export const ERRO_401 = {
  cod: 401,
  message: 'Invalid API key. Please see https://openweathermap.org/faq#error401 for more info.',
}
export const ERRO_404 = { cod: '404', message: 'city not found' }
export const ERRO_429 = {
  cod: 429,
  message:
    'Your account is temporary blocked due to exceeding of requests limitation of your subscription type.',
}
