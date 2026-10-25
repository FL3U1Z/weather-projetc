/**
 * Cenários de integração gerados pelo Prompt 1 (prompts/01-cenarios-integracao.md).
 * Cada teste começa numa ação do usuário, atravessa App → useWeather → service → axios
 * e verifica os dois lados da fronteira: as requisições que chegaram à API simulada
 * e o que aparece na tela.
 */
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import {
  MSG,
  PARAMS_FIXOS,
  aguardarFimDaBusca,
  botaoBuscar,
  botaoLocalizacao,
  campoCidade,
  esperarCard,
  esperarErro,
  iniciarApp,
  negarLocalizacao,
  permitirLocalizacao,
  usarServidorSimulado,
} from './apoio/ambiente'
import {
  ERRO_404,
  fixtureCidade,
  fixtureSaoPaulo,
  json,
  requisicoes,
  responderEmSequencia,
  responderErro,
  responderJson,
  responderPendente,
} from './apoio/servidor'

usarServidorSimulado()

const TEXTO_EMPTY_STATE = 'Consulte o clima de qualquer cidade'

describe('Integração UI ↔ OpenWeatherMap: cenários (Prompt 1)', () => {
  it('CI-01: busca por cidade remove espaços das pontas e mostra temperaturas arredondadas', async () => {
    // temp_max 23.5 exercita a decisão D-04 (arredondamento com Math.round: .5 sobe).
    responderJson({ ...fixtureSaoPaulo(), main: { ...fixtureSaoPaulo().main, temp_max: 23.5 } })
    const app = iniciarApp()

    await app.buscarCidade('  São Paulo  ')

    await esperarCard('São Paulo', 'BR')
    expect(requisicoes).toEqual([{ metodo: 'GET', params: { q: 'São Paulo', ...PARAMS_FIXOS } }])
    expect(screen.getByText('nublado')).toBeInTheDocument()
    expect(screen.getByText('22')).toBeInTheDocument() // temp 22.4
    expect(screen.getByText(/Sensação 22°C/)).toHaveTextContent('Mín 21° / Máx 24°')
  })

  it('CI-02: busca por localização envia lat/lon da geolocalização e nenhum q', async () => {
    permitirLocalizacao(-23.5505, -46.6333)
    const app = iniciarApp()

    await app.clicarLocalizacao()

    await esperarCard('São Paulo', 'BR')
    expect(requisicoes).toEqual([
      { metodo: 'GET', params: { lat: '-23.5505', lon: '-46.6333', ...PARAMS_FIXOS } },
    ])
  })

  it('CI-03: durante a requisição pendente mostra carregamento e bloqueia campo e botões', async () => {
    const liberar = responderPendente(fixtureCidade('London', 'GB', 12))
    const app = iniciarApp()

    await app.buscarCidade('Londres')

    expect(await screen.findByText(MSG.carregando)).toBeInTheDocument()
    await waitFor(() => expect(requisicoes).toHaveLength(1))
    expect(botaoBuscar()).toBeDisabled()
    expect(botaoLocalizacao()).toBeDisabled()
    expect(campoCidade()).toBeDisabled() // decisão D-03

    liberar()

    await esperarCard('London', 'GB')
    expect(botaoBuscar()).toBeEnabled()
    expect(botaoLocalizacao()).toBeEnabled()
    expect(requisicoes).toHaveLength(1)
  })

  it('CI-04: duas buscas seguidas com sucesso mostram só a última cidade', async () => {
    responderEmSequencia(
      json(fixtureCidade('Rio de Janeiro', 'BR', 30)),
      json(fixtureCidade('Curitiba', 'BR', 14))
    )
    const app = iniciarApp()

    await app.buscarCidade('Rio de Janeiro')
    await esperarCard('Rio de Janeiro', 'BR')
    await app.buscarCidade('Curitiba')

    await esperarCard('Curitiba', 'BR')
    expect(screen.queryByText(/Rio de Janeiro/)).not.toBeInTheDocument()
    expect(requisicoes.map(r => r.params.q)).toEqual(['Rio de Janeiro', 'Curitiba'])
  })

  it('CI-05: erro 404 seguido de busca com sucesso limpa a mensagem de erro', async () => {
    responderEmSequencia(json(ERRO_404, 404), json(fixtureCidade('Recife', 'BR', 29)))
    const app = iniciarApp()

    await app.buscarCidade('Xyzabc')
    await esperarErro(MSG.cidadeNaoEncontrada)

    await app.buscarCidade('Recife')

    await esperarCard('Recife', 'BR')
    expect(screen.queryByText(MSG.cidadeNaoEncontrada)).not.toBeInTheDocument()
    expect(requisicoes.map(r => r.params.q)).toEqual(['Xyzabc', 'Recife'])
  })

  it('CI-06: busca por localização depois de busca por cidade não reaproveita o q', async () => {
    permitirLocalizacao(-8.05, -34.9)
    responderEmSequencia(json(fixtureCidade('Curitiba', 'BR', 14)), json(fixtureCidade('Recife', 'BR', 29)))
    const app = iniciarApp()

    await app.buscarCidade('Curitiba')
    await esperarCard('Curitiba', 'BR')
    await app.clicarLocalizacao()

    await esperarCard('Recife', 'BR')
    expect(requisicoes[0].params).toEqual({ q: 'Curitiba', ...PARAMS_FIXOS })
    expect(requisicoes[1].params).toEqual({ lat: '-8.05', lon: '-34.9', ...PARAMS_FIXOS })
  })

  it('CI-07: erro na busca por cidade some quando a busca por localização dá certo', async () => {
    permitirLocalizacao(-23.55, -46.63)
    responderEmSequencia(json(ERRO_404, 404), json(fixtureSaoPaulo()))
    const app = iniciarApp()

    await app.buscarCidade('Xyzabc')
    await esperarErro(MSG.cidadeNaoEncontrada)
    await app.clicarLocalizacao()

    await esperarCard('São Paulo', 'BR')
    expect(screen.queryByText(MSG.cidadeNaoEncontrada)).not.toBeInTheDocument()
    expect(requisicoes).toHaveLength(2)
    expect(requisicoes[1].params).not.toHaveProperty('q')
  })

  it('CI-08: campo vazio não gera requisição e a tela inicial permanece', async () => {
    const app = iniciarApp()

    await app.buscarCidade('')

    expect(screen.getByText(TEXTO_EMPTY_STATE)).toBeInTheDocument()
    expect(screen.queryByText(MSG.carregando)).not.toBeInTheDocument()
    expect(requisicoes).toHaveLength(0)
  })

  it('CI-09: campo só com espaços não gera requisição e mantém o card anterior', async () => {
    const app = iniciarApp()
    await app.buscarCidade('São Paulo')
    await esperarCard('São Paulo', 'BR')

    await app.buscarCidade('     ')

    // Decisão D-01: a busca vazia não altera a tela.
    await esperarCard('São Paulo', 'BR')
    expect(requisicoes).toHaveLength(1)
  })

  it('CI-10: acentos e espaços internos chegam intactos no parâmetro q', async () => {
    const app = iniciarApp()

    await app.buscarCidade('São José dos Campos')
    await aguardarFimDaBusca()

    expect(requisicoes).toHaveLength(1)
    expect(requisicoes[0].params.q).toBe('São José dos Campos')
  })

  it('CI-11: permissão de localização negada mostra a mensagem e não chama a API', async () => {
    negarLocalizacao()
    const app = iniciarApp()

    await app.clicarLocalizacao()

    await esperarErro(MSG.permissaoNegada)
    expect(requisicoes).toHaveLength(0)
  })

  it('CI-12: Enter no campo dispara exatamente uma busca', async () => {
    const app = iniciarApp()

    await app.digitarEPressionarEnter('Salvador')
    await aguardarFimDaBusca()

    // Decisão D-02. O SearchBar trata Enter no onKeyDown E no submit do form:
    // o teste garante que isso não vira duas requisições.
    expect(requisicoes).toHaveLength(1)
    expect(requisicoes[0].params.q).toBe('Salvador')
  })

  it('CI-13: caracteres reservados de URL não quebram nem criam parâmetros extras', async () => {
    // Cenário da v2 (CI-06 de lá) mantido por cobrir a codificação feita pelo axios.
    responderErro(404, ERRO_404)
    const app = iniciarApp()

    await app.buscarCidade('Rio & Janeiro?#=+')
    await aguardarFimDaBusca()

    expect(requisicoes).toEqual([{ metodo: 'GET', params: { q: 'Rio & Janeiro?#=+', ...PARAMS_FIXOS } }])
  })
})
