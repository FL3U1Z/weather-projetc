/**
 * Casos de erro gerados pelo Prompt 2 (prompts/02-casos-de-erro.md).
 * ER-01..ER-09 vêm direto da v3. ER-10..ER-16 só existiram depois que as perguntas
 * da LLM viraram decisões (D-05..D-08 em docs/casos-gerados.md).
 */
import { afterEach, describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { api } from '../../services/api'
import {
  MSG,
  PARAMS_FIXOS,
  botaoBuscar,
  botaoLocalizacao,
  esperarCard,
  esperarErro,
  iniciarApp,
  permitirLocalizacao,
  usarServidorSimulado,
} from './apoio/ambiente'
import {
  ERRO_404,
  fixtureCidade,
  fixtureSaoPaulo,
  json,
  nuncaResponder,
  requisicoes,
  responderEmSequencia,
  responderErro,
  responderErroDeRede,
  responderJson,
  responderPendente,
  responderTexto,
} from './apoio/servidor'

usarServidorSimulado()

const PARAMS_LOCALIZACAO = { lat: '-23.55', lon: '-46.63', ...PARAMS_FIXOS }

describe('Integração UI ↔ OpenWeatherMap: casos de erro (Prompt 2)', () => {
  describe('busca por cidade', () => {
    it('ER-01: 404 mostra "cidade não encontrada" (classe EQ-C1)', async () => {
      responderErro(404, ERRO_404)
      const app = iniciarApp()

      await app.buscarCidade('  Londres  ')

      await esperarErro(MSG.cidadeNaoEncontrada)
      expect(requisicoes).toEqual([{ metodo: 'GET', params: { q: 'Londres', ...PARAMS_FIXOS } }])
      expect(botaoBuscar()).toBeEnabled()
    })

    it('ER-02: 500 mostra a mensagem genérica, sem retentativa (classe EQ-C2)', async () => {
      responderErro(500, { message: 'Internal error' })
      const app = iniciarApp()

      await app.buscarCidade('Londres')

      await esperarErro(MSG.erroConexao)
      expect(requisicoes).toHaveLength(1)
    })

    it('ER-03: conexão derrubada mostra a mensagem genérica (EQ-C2, sem error.response)', async () => {
      responderErroDeRede()
      const app = iniciarApp()

      await app.buscarCidade('Londres')

      await esperarErro(MSG.erroConexao)
      expect(requisicoes).toHaveLength(1)
    })

    it('ER-04: 503 com corpo HTML mostra a mensagem genérica (EQ-C2, corpo não-JSON)', async () => {
      responderTexto(503, '<html>Service Unavailable</html>', 'text/html')
      const app = iniciarApp()

      await app.buscarCidade('Londres')

      await esperarErro(MSG.erroConexao)
      expect(requisicoes).toHaveLength(1)
    })

    it('ER-08: resposta lenta com cliques nos botões desabilitados gera uma única requisição', async () => {
      permitirLocalizacao(-23.55, -46.63)
      const liberar = responderPendente(fixtureCidade('London', 'GB', 12))
      const app = iniciarApp()

      await app.buscarCidade('Londres')
      await screen.findByText(MSG.carregando)
      await app.user.click(botaoBuscar())
      await app.user.click(botaoLocalizacao())
      liberar()

      await esperarCard('London', 'GB')
      expect(requisicoes).toEqual([{ metodo: 'GET', params: { q: 'Londres', ...PARAMS_FIXOS } }])
    })
  })

  describe('busca por localização', () => {
    it('ER-05: 500 mostra "erro ao buscar localização" (classe EQ-L1)', async () => {
      permitirLocalizacao(-23.55, -46.63)
      responderErro(500, { message: 'Internal error' })
      const app = iniciarApp()

      await app.clicarLocalizacao()

      await esperarErro(MSG.erroLocalizacao)
      expect(requisicoes).toEqual([{ metodo: 'GET', params: PARAMS_LOCALIZACAO }])
    })

    it('ER-06: 404 na localização não vaza a mensagem de cidade não encontrada', async () => {
      permitirLocalizacao(-23.55, -46.63)
      responderErro(404, ERRO_404)
      const app = iniciarApp()

      await app.clicarLocalizacao()

      await esperarErro(MSG.erroLocalizacao)
      expect(screen.queryByText(MSG.cidadeNaoEncontrada)).not.toBeInTheDocument()
      expect(requisicoes).toHaveLength(1)
    })

    it('ER-07: conexão derrubada mostra "erro ao buscar localização"', async () => {
      permitirLocalizacao(-23.55, -46.63)
      responderErroDeRede()
      const app = iniciarApp()

      await app.clicarLocalizacao()

      await esperarErro(MSG.erroLocalizacao)
      expect(requisicoes).toEqual([{ metodo: 'GET', params: PARAMS_LOCALIZACAO }])
    })

    it('ER-09: resposta lenta com cliques nos botões desabilitados gera uma única requisição', async () => {
      permitirLocalizacao(-23.55, -46.63)
      const liberar = responderPendente(fixtureSaoPaulo())
      const app = iniciarApp()

      await app.clicarLocalizacao()
      await screen.findByText(MSG.carregando)
      await app.user.click(botaoLocalizacao())
      await app.user.click(botaoBuscar())
      liberar()

      await esperarCard('São Paulo', 'BR')
      expect(requisicoes).toEqual([{ metodo: 'GET', params: PARAMS_LOCALIZACAO }])
    })
  })

  describe('casos destravados pelas perguntas da LLM', () => {
    const { timeout, adapter } = api.defaults
    afterEach(() => {
      Object.assign(api.defaults, { timeout, adapter })
    })

    // O interceptador de XHR do MSW não emula o timeout do XMLHttpRequest quando a resposta
    // é simulada. O adaptador fetch do axios controla o timeout ele mesmo e gera o mesmo
    // AxiosError, então service, hook e tela continuam sendo exercitados de verdade.
    const encurtarTimeout = () => Object.assign(api.defaults, { timeout: 100, adapter: 'fetch' })

    it('ER-10: o cliente HTTP tem timeout configurado (D-05)', () => {
      expect(api.defaults.timeout).toBe(10_000)
    })

    it('ER-11: resposta que nunca chega vira erro genérico na busca por cidade (D-05)', async () => {
      encurtarTimeout()
      nuncaResponder()
      const app = iniciarApp()

      await app.buscarCidade('Londres')

      await esperarErro(MSG.erroConexao)
      expect(requisicoes).toHaveLength(1)
    })

    it('ER-12: resposta que nunca chega vira erro de localização (D-05)', async () => {
      encurtarTimeout()
      permitirLocalizacao(-23.55, -46.63)
      nuncaResponder()
      const app = iniciarApp()

      await app.clicarLocalizacao()

      await esperarErro(MSG.erroLocalizacao)
      expect(requisicoes).toHaveLength(1)
    })

    it('ER-13: 200 sem o array weather é tratado como falha, sem derrubar a tela (D-06)', async () => {
      const { weather: _semWeather, ...corpo } = fixtureSaoPaulo()
      responderJson(corpo)
      const app = iniciarApp()

      await app.buscarCidade('São Paulo')

      await esperarErro(MSG.erroConexao)
      expect(requisicoes).toHaveLength(1)
    })

    it('ER-14: 200 com weather vazio na localização é tratado como falha (D-06)', async () => {
      permitirLocalizacao(-23.55, -46.63)
      responderJson({ ...fixtureSaoPaulo(), weather: [] })
      const app = iniciarApp()

      await app.clicarLocalizacao()

      await esperarErro(MSG.erroLocalizacao)
      expect(requisicoes).toHaveLength(1)
    })

    it('ER-15: 200 com HTML de proxy no corpo é tratado como falha (D-07)', async () => {
      responderTexto(200, '<html><body>Portal de acesso Wi-Fi</body></html>', 'text/html')
      const app = iniciarApp()

      await app.buscarCidade('São Paulo')

      await esperarErro(MSG.erroConexao)
      expect(requisicoes).toHaveLength(1)
    })

    it('ER-16: erro depois de um sucesso substitui o card pela mensagem (D-08)', async () => {
      responderEmSequencia(json(fixtureSaoPaulo()), json({ message: 'Internal error' }, 500))
      const app = iniciarApp()

      await app.buscarCidade('São Paulo')
      await esperarCard('São Paulo', 'BR')
      await app.buscarCidade('Curitiba')

      await esperarErro(MSG.erroConexao)
      await waitFor(() => expect(requisicoes).toHaveLength(2))
    })
  })
})
