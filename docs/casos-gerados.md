# Catálogo dos casos de teste gerados

São 29 testes de integração automatizados, todos aprovados depois das correções.

| Arquivo | Prompt de origem | Testes |
|---|---|---|
| [cenarios.test.tsx](../src/test/integracao/cenarios.test.tsx) | [Prompt 1, v3](../prompts/01-cenarios-integracao.md) (+1 da v2) | 13 |
| [erros.test.tsx](../src/test/integracao/erros.test.tsx) | [Prompt 2, v3](../prompts/02-casos-de-erro.md) + decisões | 16 |

A coluna **Código original** mostra o resultado de cada teste antes de qualquer correção
na aplicação ([evidência](evidencias/execucao-antes-das-correcoes.txt)).

## Cenários de integração (Prompt 1)

| ID | Cenário | Origem | Fronteira verificada | Código original |
|---|---|---|---|---|
| CI-01 | Cidade com espaços nas pontas; temperaturas arredondadas | v3 CI-01 + D-04 | 1 req, `q` sem espaços + fixos | ✅ |
| CI-02 | Busca por localização | v3 CI-02 | 1 req, `lat`/`lon` exatos, sem `q` | ✅ |
| CI-03 | Requisição pendente bloqueia campo e botões | v3 CI-03 + D-03 | 1 req durante e depois | ✅ |
| CI-04 | Duas buscas com sucesso, só a última aparece | v3 CI-04 | 2 reqs na ordem | ✅ |
| CI-05 | 404 seguido de sucesso limpa o erro | v3 CI-05 | 2 reqs na ordem | ❌ **D1** |
| CI-06 | Localização depois de cidade não reaproveita `q` | v3 CI-06 | 2ª req sem `q` | ✅ |
| CI-07 | Erro de cidade some com sucesso na localização | v3 CI-07 | 2ª req sem `q` | ❌ **D1** |
| CI-08 | Campo vazio | v3 CI-08 + D-01 | 0 reqs | ✅ |
| CI-09 | Só espaços com card na tela | v3 CI-09 + D-01 | continua 1 req | ✅ |
| CI-10 | Acento e espaços internos | v3 CI-10 | `q` decodificado intacto | ✅ |
| CI-11 | Permissão de localização negada | v3 CI-11 | 0 reqs | ✅ |
| CI-12 | Enter dispara exatamente uma busca | v3 CI-12 + D-02 | 1 req | ✅ |
| CI-13 | Caracteres reservados `& ? # = +` | **v2 CI-06** | 1 req, sem parâmetros extras | ✅ |

## Casos de erro (Prompt 2)

| ID | Caminho | Modo de falha | Origem | Esperado na tela | Código original |
|---|---|---|---|---|---|
| ER-01 | Cidade | 404 | v3 ER-01 (EQ-C1) | "Cidade não encontrada…" | ❌ **D1** |
| ER-02 | Cidade | 500 | v3 ER-02 (EQ-C2) | "Erro ao buscar dados…" | ✅ |
| ER-03 | Cidade | Conexão derrubada | v3 ER-03 (EQ-C2, 2º repr.) | "Erro ao buscar dados…" | ✅ |
| ER-04 | Cidade | 503 com HTML | v3 ER-04 (EQ-C2, 2º repr.) | "Erro ao buscar dados…" | ✅ |
| ER-05 | Localização | 500 | v3 ER-05 (EQ-L1) | "Erro ao buscar localização." | ✅ |
| ER-06 | Localização | 404 | v3 ER-06 (EQ-L1, 2º repr.) | "Erro ao buscar localização." | ✅ |
| ER-07 | Localização | Conexão derrubada | v3 ER-07 (EQ-L1, 2º repr.) | "Erro ao buscar localização." | ✅ |
| ER-08 | Cidade | Resposta lenta + cliques | v3 ER-08 (EQ-S1) | card, 1 req | ✅ |
| ER-09 | Localização | Resposta lenta + cliques | v3 ER-09 (EQ-S1) | card, 1 req | ✅ |
| ER-10 | — | Cliente sem timeout | pergunta P1 → D-05 | timeout = 10 s | ❌ **D2** |
| ER-11 | Cidade | Resposta nunca chega | pergunta P1 → D-05 | "Erro ao buscar dados…" | ❌ **D2** |
| ER-12 | Localização | Resposta nunca chega | pergunta P1 → D-05 | "Erro ao buscar localização." | ❌ **D2** |
| ER-13 | Cidade | 200 sem `weather` | pergunta P2 → D-06 | "Erro ao buscar dados…" | ❌ **D3** (tela branca) |
| ER-14 | Localização | 200 com `weather: []` | pergunta P2 → D-06 | "Erro ao buscar localização." | ❌ **D3** (tela branca) |
| ER-15 | Cidade | 200 com HTML de proxy | pergunta P3 → D-07 | "Erro ao buscar dados…" | ❌ **D3** (tela branca) |
| ER-16 | Cidade | 500 depois de um sucesso | pergunta P5 → D-08 | erro substitui o card | ✅ |

## Defeitos encontrados

| Defeito | Causa | Correção |
|---|---|---|
| **D1** | `services/weather.ts` embrulhava o erro do axios em `new Error(...)` e descartava `response.status`. O hook testa `status === 404`, então a mensagem "Cidade não encontrada" **nunca** aparecia. O teste unitário do hook não pegava isso porque o mock do service lançava um erro já com `response.status`, coisa que o service real não fazia. | O service preserva o status no erro que lança. |
| **D2** | O cliente axios não tinha `timeout`. Uma resposta que não chega deixava o app preso em "Buscando dados do clima..." com os botões desabilitados para sempre. | `timeout: 10_000` em `services/api.ts`. |
| **D3** | Um 200 fora do contrato chegava ao `App`, que lê `data.weather[0].id` e lança `TypeError`. Sem Error Boundary, **a aplicação inteira desmontava** e a tela ficava em branco. | O service valida `name`, `main` e `weather` não vazio, e trata a resposta inválida como falha. |

## Decisões tomadas a partir das perguntas da LLM

A v3 dos dois prompts devolveu perguntas em vez de supor comportamento. Cada resposta
virou uma decisão explícita e, em geral, um teste. Decidi a partir do comportamento que o
código já tinha quando ele era razoável, e corrigi o código quando não era.

| Decisão | Pergunta (prompt/versão) | Resposta | Testes |
|---|---|---|---|
| D-01 | Busca vazia: o que o usuário vê? (P1 v3, perg. 1 e 6) | Nada muda: a tela anterior permanece, seja card, erro ou tela inicial. | CI-08, CI-09 |
| D-02 | Enter no campo dispara a busca? (P1 v3, perg. 2) | Sim, exatamente uma vez. | CI-12 |
| D-03 | O campo fica desabilitado no carregamento? (P1 v3, perg. 3; P2 v3, P4) | Sim. Toda segunda ação durante a espera é ignorada: 1 requisição. | CI-03, ER-08, ER-09 |
| D-04 | Regra de arredondamento? (P1 v3, perg. 4) | `Math.round`: 0,5 arredonda para cima (23,5 → 24). | CI-01 |
| — | Campo após busca por localização? (P1 v3, perg. 5) | Fora do escopo: não é comportamento de integração. | — |
| D-05 | Deve haver timeout? (P2 v3, P1) | Sim, de 10 s, e conta como falha comum (opção a). | ER-10..ER-12 |
| D-06 | 200 sem `weather` ou com `weather` vazio? (P2 v3, P2) | Falha, com a mensagem do caminho (opção a). | ER-13, ER-14 |
| D-07 | 200 com corpo não-JSON? (P2 v3, P3) | Mesma decisão de D-06 (opção c). | ER-15 |
| D-08 | Erro depois de sucesso: o card fica? (P2 v3, P5) | O card some e só o erro aparece (opção a). | ER-16 |

## Casos descartados

| Origem | Casos | Motivo |
|---|---|---|
| P1 v1 | CT-12, CT-15, CT-18, CT-19 | Funcionalidades inexistentes (°C/°F, previsão, histórico, `localStorage`). |
| P1 v1 | CT-05, CT-06, CT-08, CT-09, CT-22 | Mensagens, botão ou atributos de acessibilidade que o app não tem. |
| P1 v1 | os demais | Substituídos pelas versões com contexto, que verificam a fronteira. |
| P1 v2 | CI-12..CI-17, CI-21..CI-25 | Modos de falha: são escopo do Prompt 2. |
| P1 v2 | CI-04/05, CI-19/20, CI-31..CI-38 | Redundantes: exercitam a mesma fronteira de outro cenário mantido. |
| P1 v2 | CI-40 | Arredondamento coberto no CI-01 (D-04). |
| P2 v1 | itens de UX, segurança, StrictMode, CORS, mixed content | Não são testes de integração entre o front-end e a API. |
| P2 v2 | 401, 429, 503 simples (ER-03, ER-05, ER-07, ER-15, ER-17, ER-19) | Mesma classe de equivalência que o 500 (ver v3). |
| P2 v2 | linhas com (*) | Comportamento suposto: refeito como pergunta na v3. |
