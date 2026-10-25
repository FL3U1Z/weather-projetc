# Reflexão: GenAI como apoio a testes de integração

## Cenário

Integração **front-end ↔ API REST** num app de clima em React. O fluxo testado é
`SearchBar → hook useWeather → services/weather.ts → axios → OpenWeatherMap`, mais a decisão
de tela no `App`. Nos testes, todo o código da aplicação roda de verdade. Só a API externa
é substituída, **na camada de rede**, por um servidor MSW que registra cada requisição.
Assim cada teste verifica os dois lados da fronteira: o que chegou à API e o que o usuário vê.

## Os dois tipos de prompt

| | Prompt 1: cenários de integração | Prompt 2: casos de erro |
|---|---|---|
| Pergunta que responde | "Quais fluxos atravessam as camadas e como verificá-los?" | "O que acontece na fronteira quando a dependência falha?" |
| Entrada | Contexto + escopo (caminho feliz, limites, sequências) | Contexto + lista fechada de modos de falha |
| Técnica que mais ajudou | Limite de quantidade + ordenação por risco | Classes de equivalência |
| Versões | v1 → v2 → v3 | v1 → v2 → v3 |
| Casos aproveitados | 13 (CI-01..CI-13) | 16 (ER-01..ER-16) |
| Defeitos que revelou | D1 | D1, D2, D3 |

## Como cada tipo de prompt influenciou a qualidade e a diversidade

### Prompt 1: cenários de integração

**Qualidade.** A evolução foi de casos inviáveis para casos implementáveis sem interpretação:

| Versão | Casos | Inviáveis (funcionalidade inventada) | Verificam a requisição | Perguntas |
|---|---|---|---|---|
| v1 | 23 | 6 | 3 | 0 |
| v2 | 40 | 0 | 40 | 0 (2 suposições avisadas) |
| v3 | 12 | 0 | 12 | 6 |

Sem contexto, a LLM descreveu um app de clima "genérico" (troca °C/°F, previsão de 5 dias,
histórico, `role="alert"`), e os exemplos de código usavam seletores que não existem.
Com contexto, todos os casos passaram a ter texto exato na tela e número exato de
requisições, o que permitiu transformar cada linha da tabela num teste quase diretamente.

**Diversidade.** Este prompt explorou o eixo **ações do usuário**: entradas-limite (espaços
nas pontas, acentos, caracteres reservados `& ? # = +`) e principalmente **sequências**,
como cidade → localização sem `q` residual, erro → sucesso limpando a mensagem e cliques
durante o carregamento. Esses casos não aparecem num prompt de erros, que pensa em uma
requisição de cada vez. O ponto fraco foi a redundância: na v2, vários cenários exercitavam
a mesma fronteira do mesmo jeito, e 11 deles eram modos de falha, que são escopo do outro
prompt.

**Efetividade.** Os 13 testes deste prompt revelaram o defeito D1 (CI-05 e CI-07) e, sozinhos,
detectam **6 de 8** defeitos injetados na verificação por mutação.

### Prompt 2: casos de erro

**Qualidade.**

| Versão | Saída | Resultado esperado definido | Suposições | Perguntas |
|---|---|---|---|---|
| v1 | ~50 itens em 9 categorias | nenhum | — | 0 |
| v2 | 26 casos (matriz modo × caminho) | todos | 10, marcadas com (*) | 0 |
| v3 | 8 classes, 9 casos | todos | 0 | 5 |

A v1 foi um checklist, não um conjunto de testes: misturava acessibilidade, CORS, chave
exposta no bundle e StrictMode com erros de integração, sem dizer o resultado de nenhum item.
A v2 já era implementável, mas com explosão combinatória: 401, 429, 500 e 503 produzem o
mesmo resultado e viravam casos separados.

**Diversidade.** Este prompt explorou o eixo **comportamento da dependência**, e foi aqui
que a LLM mais contribuiu com ideias que eu não teria listado: **200 com HTML de proxy**
(portal de Wi-Fi), `weather` vazio, corpo de 5xx não-JSON e a distinção entre 404 na cidade
e 404 na localização (ER-06), que pode vazar a mensagem errada. Curiosamente, a v1 "ruim" foi
a mais diversa: várias dessas ideias saíram dela e foram reaproveitadas como lista fechada
de modos de falha na v2.

**Efetividade.** Os 16 testes deste prompt revelaram os três defeitos (D1, D2 e D3) e,
sozinhos, detectam **8 de 8** defeitos injetados.

### Comparando os dois

Os prompts se complementam. O de cenários cobre como o usuário chega à fronteira, e o de
erros cobre o que a fronteira devolve. Na detecção de defeitos, o de erros foi mais
efetivo, porque os defeitos de integração deste app estavam no tratamento das respostas da
API. O de cenários, porém, é o único que verifica sequências e a codificação da entrada,
riscos reais que os mutantes escolhidos não exercitaram.

## Ajustes de prompt necessários para obter resultados úteis

| # | Ajuste | Versão | Problema que resolveu | Efeito observado |
|---|---|---|---|---|
| 1 | Colar o contrato real da API e as regras de negócio R1–R7 | v1 → v2 | Funcionalidades, mensagens e seletores inventados | Invenções caíram de 6/23 para 0 |
| 2 | Definir o que conta como teste de integração ("verifica os dois lados da fronteira") | v1 → v2 | Casos que só olhavam a tela | Requisição verificada em 3/23 → 40/40 casos |
| 3 | Exigir formato fixo: tabela com ID, ação, resposta simulada, nº de requisições, texto exato e regra; sem código | v1 → v2 | Resultados vagos ("erro genérico amigável") e código com seletores falsos | Cada linha virou um teste quase diretamente |
| 4 | Dar uma lista fechada de modos de falha (Prompt 2) | v1 → v2 | Checklist genérico misturando níveis | Matriz modo × caminho só com falhas da dependência |
| 5 | Separar o escopo dos prompts e limitar a 12 cenários ordenados por risco (Prompt 1) | v2 → v3 | 40 cenários, 11 deles invadindo o escopo de erros | 40 → 12, sem sobreposição |
| 6 | Pedir classes de equivalência, com segundo representante só com motivo (Prompt 2) | v2 → v3 | Explosão combinatória (401/429/500/503 repetidos) | 26 → 9 casos, ainda 8/8 na mutação |
| 7 | **Proibir suposições: comportamento indefinido vira pergunta** | v2 → v3 | Palpites preenchidos como resultado esperado | 11 perguntas → 8 decisões → 7 testes novos |

O ajuste 7 teve o maior impacto. **Os defeitos D2 (sem timeout) e D3 (tela branca) só foram
encontrados por testes que nasceram dessas perguntas.** Elas também expuseram que as regras
de negócio estavam incompletas, o que tem valor mesmo antes de escrever qualquer teste.

**Um efeito colateral:** o limite de 12 cenários (ajuste 5) fez a v3 descartar o caso de
caracteres reservados na URL, que a v2 tinha. Recuperei esse caso manualmente (CI-13).
Restringir a saída melhora o foco, mas pode cortar casos úteis, e a revisão humana entre
versões continua necessária.

## Validação: os testes pegam defeitos de verdade?

**Contra o código original:** 9 dos 29 testes falharam e revelaram 3 defeitos reais
([execução](evidencias/execucao-antes-das-correcoes.txt)):

- **D1:** o 404 **nunca** mostrava "Cidade não encontrada". O service descartava o status
  HTTP. Os 50 testes unitários existentes passavam porque o mock do service, no teste do
  hook, lançava um erro que o service real nunca lança. É o exemplo clássico de defeito que
  só aparece na integração.
- **D2:** sem timeout, uma resposta que não chega trava o app no carregamento.
- **D3:** um 200 fora do contrato **derrubava a aplicação inteira** (tela branca).

**Verificação por mutação** ([resultado](evidencias/mutacao.md), `npm run test:mutacao`):
injetei 8 defeitos de integração, um de cada vez.

| Suíte | Mutantes detectados |
|---|---|
| Integração gerada com os prompts (29 testes) | **8 / 8** |
| Testes unitários que já existiam (50 testes) | 1 / 8 |

## Limitações

- **Timeout com adaptador diferente:** o interceptador de XHR do MSW não emula o
  `timeout` do `XMLHttpRequest` quando a resposta é simulada. Por isso ER-11 e ER-12 usam o
  adaptador `fetch` do axios, que gera o mesmo `AxiosError` de timeout. Service, hook e
  tela continuam sendo exercitados, mas o transporte difere do de produção. O ER-10 garante
  que o timeout está configurado.
- **A API simulada segue o contrato documentado, não a API real.** Se a OpenWeatherMap
  mudar o formato, esses testes não percebem. Um teste de contrato contra a API real
  (fora do CI, com chave) complementaria.
- **Uma só LLM:** todas as versões rodaram no Claude Sonnet, em sessões novas e sem acesso
  ao código. Outra LLM pode dar resultados diferentes. Uma comparação seria um próximo passo.
- **As decisões D-01..D-08 foram humanas.** A LLM fez as perguntas, mas a escolha de cada
  resposta (timeout de 10 s, 200 inválido = falha etc.) é decisão de produto.

## Conclusão

A GenAI funcionou bem como **copiloto para explorar a fronteira**. Ela lista modos de
falha e sequências que eu não teria enumerado e, quando instruída a não supor, aponta
lacunas nas regras de negócio. Sem contexto, porém, ela descreve um sistema imaginário. Mesmo
com contexto, tende a gerar volume em vez de cobertura e a preencher lacunas com palpites.
Os três ajustes que tornaram o resultado útil foram colar o contrato real, definir o que é
teste de integração e trocar suposições por perguntas. Definir as regras, responder às
perguntas, implementar os testes e validar que eles pegam defeitos reais continua sendo
trabalho humano.
