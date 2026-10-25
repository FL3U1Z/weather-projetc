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

## Como cada ajuste mudou o resultado

**1. Contexto real (v1 → v2): eliminou a invenção.** Sem contexto, a LLM descreveu um app
de clima "genérico": troca °C/°F, previsão de 5 dias, histórico, botão de tentar de novo,
`role="alert"`. Foram 6 de 23 cenários inviáveis, e os exemplos de código usavam seletores
que não existem. Depois de colar o contrato e as regras, nenhuma funcionalidade foi
inventada nas duas v2.

**2. Exigir a verificação da fronteira (v1 → v2): mudou o tipo de teste.** Na v1, só 3 de
23 cenários olhavam o que chegou à API. O resto olhava apenas a tela. Com a definição
explícita de teste de integração ("verifica os dois lados da fronteira"), todos os casos
passaram a ter contagem de requisições e parâmetros. Foram essas verificações que pegaram
defeitos como "retentativa automática" e "parâmetro `lang` sumiu" na verificação por mutação.

**3. Pedir perguntas em vez de suposições (v2 → v3): o ajuste de maior impacto.** Na v2,
a LLM já sinalizava as incertezas com (*), mas preenchia o resultado mesmo assim. Por
exemplo, "200 sem `weather` → mensagem genérica". Na v3, proibi isso e saíram **11
perguntas** (6 no Prompt 1 e 5 no Prompt 2). Elas viraram 8 decisões explícitas
(D-01..D-08) e 7 testes novos. **Todos os defeitos D2 e D3 foram encontrados por testes que
só existiram por causa dessas perguntas.** As perguntas expuseram que as regras de negócio
estavam incompletas, o que é útil mesmo antes de escrever qualquer teste.

**4. Classes de equivalência e limite de quantidade (v2 → v3): menos casos, mesma
detecção.** A v2 de erros tinha 26 casos e a de cenários, 40. Na v3 caíram para 9 e 12.
Os 401/429/500/503 viraram uma classe só, e a LLM justificou cada segundo representante,
como o "404 na localização pode vazar a mensagem de cidade" (ER-06). A suíte final detecta
8 de 8 mutantes, então o corte não custou cobertura.

**Diversidade:** o prompt de erros trouxe casos que eu não teria listado: o **200 com HTML
de proxy** (portal de Wi-Fi), o `weather` vazio e a distinção entre 404 na cidade e 404 na
localização. Já o prompt de cenários foi mais útil para **sequências** de ações, como cidade
→ localização sem `q` residual e erro → sucesso limpando a mensagem.

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
