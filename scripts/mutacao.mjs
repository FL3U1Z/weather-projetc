// Injeta, um de cada vez, defeitos de integração no código da aplicação e verifica
// quais suítes detectam cada um. O arquivo original é sempre restaurado.
//
// Uso: npm run test:mutacao

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const SUITES = {
  integracao: ['src/test/integracao'],
  unitarios: ['src/services/weather.test.ts', 'src/hooks/useWeather.test.ts', 'src/utils/weatherUtils.test.ts'],
}

const MUTANTES = [
  {
    id: 'M1',
    descricao: 'service descarta o status HTTP do erro (404 vira erro genérico)',
    arquivo: 'src/services/weather.ts',
    de: 'response: axios.isAxiosError(causa) ? { status: causa.response?.status } : undefined,',
    para: 'response: undefined,',
  },
  {
    id: 'M2',
    descricao: 'cliente deixa de enviar lang=pt_br',
    arquivo: 'src/services/api.ts',
    de: "    lang: 'pt_br',\n",
    para: '',
  },
  {
    id: 'M3',
    descricao: 'SearchBar envia o texto sem remover os espaços das pontas',
    arquivo: 'src/components/SearchBar.tsx',
    de: 'if (value.trim()) onSearch(value.trim())\n  }\n\n  const handleKeyDown',
    para: 'if (value.trim()) onSearch(value)\n  }\n\n  const handleKeyDown',
  },
  {
    id: 'M4',
    descricao: 'service troca lat e lon na busca por coordenadas',
    arquivo: 'src/services/weather.ts',
    de: 'buscarClima({ lat, lon },',
    para: 'buscarClima({ lat: lon, lon: lat },',
  },
  {
    id: 'M5',
    descricao: 'botão Buscar não é desabilitado durante o carregamento',
    arquivo: 'src/components/SearchBar.tsx',
    de: 'disabled={loading || !value.trim()}',
    para: 'disabled={!value.trim()}',
  },
  {
    id: 'M6',
    descricao: 'service deixa de validar o corpo da resposta 200',
    arquivo: 'src/services/weather.ts',
    de: '  if (!respostaValida(data)) throw erroDoServico(mensagem)\n',
    para: '',
  },
  {
    id: 'M7',
    descricao: 'cliente HTTP sem timeout',
    arquivo: 'src/services/api.ts',
    de: '  timeout: 10_000,\n',
    para: '',
  },
  {
    id: 'M8',
    descricao: 'service faz uma retentativa automática quando a requisição falha',
    arquivo: 'src/services/weather.ts',
    de: '  } catch (error) {\n    throw erroDoServico(mensagem, error)\n  }',
    para:
      "  } catch {\n    try {\n      data = (await api.get<WeatherData>('/weather', { params })).data\n    } catch (error) {\n      throw erroDoServico(mensagem, error)\n    }\n  }",
  },
]

const pastaTemp = mkdtempSync(join(tmpdir(), 'mutacao-'))

const rodarSuite = arquivos => {
  const saida = join(pastaTemp, 'resultado.json')
  spawnSync('npx', ['vitest', 'run', ...arquivos, '--reporter=json', `--outputFile=${saida}`], {
    shell: true,
    stdio: 'ignore',
  })
  const { numFailedTests, testResults } = JSON.parse(readFileSync(saida, 'utf8'))
  const falharam = testResults
    .flatMap(arquivo => arquivo.assertionResults)
    .filter(teste => teste.status === 'failed')
    .map(teste => teste.title.split(':')[0])
  return { numFailedTests, falharam }
}

const lerArquivo = caminho => readFileSync(caminho, 'utf8').replace(/\r\n/g, '\n')

const linhas = []
try {
  for (const mutante of MUTANTES) {
    const original = readFileSync(mutante.arquivo, 'utf8')
    const normalizado = lerArquivo(mutante.arquivo)
    if (!normalizado.includes(mutante.de)) {
      throw new Error(`${mutante.id}: trecho não encontrado em ${mutante.arquivo}`)
    }
    writeFileSync(mutante.arquivo, normalizado.replace(mutante.de, mutante.para))
    try {
      process.stdout.write(`${mutante.id} ${mutante.descricao}... `)
      const integracao = rodarSuite(SUITES.integracao)
      const unitarios = rodarSuite(SUITES.unitarios)
      console.log('ok')
      linhas.push({ ...mutante, integracao, unitarios })
    } finally {
      writeFileSync(mutante.arquivo, original)
    }
  }
} finally {
  rmSync(pastaTemp, { recursive: true, force: true })
}

const marca = ({ numFailedTests }) => (numFailedTests > 0 ? `detectado (${numFailedTests})` : 'NÃO detectado')
console.log('\n| Mutante | Defeito injetado | Integração | Unitários | Testes de integração que falharam |')
console.log('|---|---|---|---|---|')
for (const l of linhas) {
  console.log(
    `| ${l.id} | ${l.descricao} | ${marca(l.integracao)} | ${marca(l.unitarios)} | ${l.integracao.falharam.join(', ') || '-'} |`
  )
}
const total = suite => linhas.filter(l => l[suite].numFailedTests > 0).length
console.log(`\nIntegração detectou ${total('integracao')}/${linhas.length}; unitários detectaram ${total('unitarios')}/${linhas.length}.`)
