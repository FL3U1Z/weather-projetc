import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../../App'
import { reiniciarServidor, requisicoes, servidor } from './servidor'

export const MSG = {
  cidadeNaoEncontrada: 'Cidade não encontrada. Verifique o nome e tente novamente.',
  erroConexao: 'Erro ao buscar dados. Verifique sua conexão.',
  erroLocalizacao: 'Erro ao buscar localização.',
  permissaoNegada: 'Permissão de localização negada.',
  carregando: 'Buscando dados do clima...',
}

export const PARAMS_FIXOS = { appid: 'chave-de-teste', units: 'metric', lang: 'pt_br' }

/** Registra os hooks do servidor simulado. Chamar no topo de cada arquivo de teste. */
export const usarServidorSimulado = () => {
  // 'error' faz o teste falhar se a aplicação chamar qualquer URL fora do contrato.
  beforeAll(() => servidor.listen({ onUnhandledRequest: 'error' }))
  beforeEach(() => reiniciarServidor())
  afterEach(() => {
    servidor.resetHandlers()
    vi.mocked(navigator.geolocation.getCurrentPosition).mockReset()
  })
  afterAll(() => servidor.close())
}

// ---------- Ações do usuário ----------

export const iniciarApp = () => {
  const user = userEvent.setup()
  render(<App />)

  const buscarCidade = async (texto: string) => {
    await user.clear(campoCidade())
    if (texto) await user.type(campoCidade(), texto)
    await user.click(botaoBuscar())
  }
  const digitarEPressionarEnter = async (texto: string) => {
    await user.clear(campoCidade())
    await user.type(campoCidade(), `${texto}{Enter}`)
  }
  const clicarLocalizacao = () => user.click(botaoLocalizacao())

  return { user, buscarCidade, digitarEPressionarEnter, clicarLocalizacao }
}

export const permitirLocalizacao = (latitude: number, longitude: number) => {
  vi.mocked(navigator.geolocation.getCurrentPosition).mockImplementation(sucesso =>
    sucesso({ coords: { latitude, longitude } } as GeolocationPosition)
  )
}

export const negarLocalizacao = () => {
  vi.mocked(navigator.geolocation.getCurrentPosition).mockImplementation((_sucesso, erro) =>
    erro?.({ code: 1, message: 'User denied Geolocation' } as GeolocationPositionError)
  )
}

// ---------- Elementos da tela ----------

export const campoCidade = () => screen.getByPlaceholderText('Digite uma cidade...')
// Localizado pelo tipo: durante o carregamento o texto "Buscar" vira um spinner.
export const botaoBuscar = () =>
  campoCidade().closest('form')!.querySelector<HTMLButtonElement>('button[type="submit"]')!
export const botaoLocalizacao = () => screen.getByTitle('Usar minha localização')
/** Título do WeatherCard: "<cidade><país>". */
export const tituloDoCard = () => screen.queryByRole('heading', { level: 2 })

// ---------- Verificações nos dois lados da fronteira ----------

/** Espera a busca terminar (sai do carregamento) e devolve as requisições registradas. */
export const aguardarFimDaBusca = async () => {
  await waitFor(() => expect(screen.queryByText(MSG.carregando)).not.toBeInTheDocument())
  return requisicoes
}

export const esperarCard = async (cidade: string, pais: string) => {
  const titulo = await screen.findByRole('heading', { level: 2 })
  expect(titulo).toHaveTextContent(`${cidade}${pais}`)
  expect(screen.queryByText('Ops! Algo deu errado')).not.toBeInTheDocument()
}

export const esperarErro = async (mensagem: string) => {
  expect(await screen.findByText(mensagem)).toBeInTheDocument()
  expect(tituloDoCard()).not.toBeInTheDocument()
  expect(screen.queryByText(MSG.carregando)).not.toBeInTheDocument()
  expect(botaoLocalizacao()).toBeEnabled()
}
