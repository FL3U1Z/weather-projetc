# Prompt 2: geração de casos de erro na fronteira

**Objetivo:** aplicar sistematicamente modos de falha da dependência externa (a API
OpenWeatherMap) aos dois caminhos de busca e definir, para cada combinação, o
comportamento esperado na tela e o número de requisições na fronteira.

**Testes resultantes:** [src/test/integracao/erros.test.tsx](../src/test/integracao/erros.test.tsx)

Todas as versões foram executadas no Claude Sonnet, cada uma em uma sessão nova, sem
acesso ao código e sem ferramentas. As respostas completas estão em [saidas/](saidas/).

---

## v1: prompt ingênuo

```text
Liste casos de erro para testar a integração entre o front-end de uma aplicação de clima em React e a API OpenWeatherMap.
```

**O que a LLM devolveu** ([saída completa](saidas/02-erros-v1.md)): cerca de 50 itens em 9
categorias (HTTP, rede, resposta malformada, entrada, geolocalização, ciclo de vida do React,
configuração/segurança, UX, estratégia).

**Problemas:**
- **É um checklist, não um conjunto de casos de teste:** nenhum item diz o resultado esperado
  ou quantas requisições devem ocorrer.
- **Mistura níveis:** acessibilidade, layout, chave exposta no bundle, StrictMode, CORS e
  mixed content estão misturados com os erros de integração.
- **Detalhes inventados:** variável `REACT_APP_API_KEY` (o projeto usa Vite), troca de
  unidade °C/°F, botão "tentar novamente".

**Aproveitável:** a lista trouxe ideias que eu não tinha considerado: **200 com HTML de
proxy**, `weather[]` vazio, `cod` como string no 404, timeout com loading preso e race
condition. Vários viraram modos de falha explícitos na v2.

**Mudança para a v2:** colar o [contexto comum](00-contexto-comum.md); fornecer a lista
fechada de modos de falha; pedir a combinação modo × caminho com resultado e contagem de
requisições.

---

## v2: matriz modo de falha × caminho

```text
Você vai me ajudar a projetar casos de erro para testes de integração. Leia o contexto e depois siga as instruções.

<contexto>
(bloco de 00-contexto-comum.md)
</contexto>

<instrucoes>
Aplique cada modo de falha abaixo a cada um dos dois caminhos (busca por cidade e busca por localização):
- API fora do ar / erro de rede (conexão recusada ou derrubada)
- timeout / resposta que nunca chega
- 401, 404, 429, 500, 503
- 200 com corpo fora do contrato: JSON sem o array weather, weather vazio, corpo HTML de proxy, corpo vazio
- resposta lenta seguida de uma segunda busca do usuário antes de a primeira terminar

Para cada combinação informe: ID (ER-01, ER-02…), caminho, modo de falha, como configurar a API simulada, número exato de requisições esperadas na fronteira, o que o usuário deve ver (texto exato quando a regra definir) e a regra que justifica.
Formato: uma tabela markdown. Não escreva código.
</instrucoes>
```

**O que a LLM devolveu** ([saída completa](saidas/02-erros-v2.md)): 24 casos (12 por caminho)
mais 2 adicionais e 3 "pontos de decisão a confirmar".

**Melhorou:** cada caso tem configuração, contagem e mensagem exata. A LLM separou bem a
mensagem de 404 da cidade (R5) da localização (R6), mostrando no ER-16 que a localização
**não** deve exibir "Cidade não encontrada".

**Problemas:**
- **Explosão combinatória:** 401, 429, 500 e 503 produzem o mesmo resultado pelas regras.
  Testar todos é repetição, não cobertura.
- **Comportamento inventado, ainda que sinalizado:** 10 linhas marcadas com (*) preenchem
  um resultado que as regras não definem. Por exemplo, "200 sem weather → mensagem genérica".
  Mesmo com o aviso, a tabela induz a implementar o teste com o palpite da LLM.

**Mudança para a v3:** pedir classes de equivalência com um representante por classe e
proibir o preenchimento de comportamento indefinido, que deve virar pergunta.

---

## v3: classes de equivalência e perguntas em vez de suposições

Mesmo contexto da v2. Instruções:

```text
<instrucoes>
Considere estes modos de falha, aplicados à busca por cidade e à busca por localização:
- API fora do ar / erro de rede (conexão recusada ou derrubada)
- timeout / resposta que nunca chega
- 401, 404, 429, 500, 503
- 200 com corpo fora do contrato: JSON sem o array weather, weather vazio, corpo HTML de proxy, corpo vazio
- resposta lenta seguida de uma segunda ação do usuário antes de a primeira terminar

Passos:
1. Agrupe os modos de falha em classes de equivalência: modos que, pelas regras, devem produzir o mesmo comportamento observável no mesmo caminho formam uma classe. Mostre as classes.
2. Gere casos de teste escolhendo um representante por classe e por caminho. Inclua um segundo representante só quando houver motivo concreto para suspeitar que o código trate os membros da classe de forma diferente, e diga qual motivo.
3. Para cada caso informe: ID (ER-01…), caminho, modo de falha, como configurar a API simulada, número exato de requisições esperadas na fronteira, o que o usuário deve ver (texto exato) e a regra que justifica.
4. IMPORTANTE: quando as regras R1–R7 não definirem o comportamento esperado de um caso, NÃO preencha o resultado esperado nem marque como "inferido". Em vez disso, coloque o caso numa seção "Perguntas" com uma pergunta objetiva para o time e as opções de resposta que você enxerga. Não gere o caso de teste até a pergunta ser respondida.

Formato: tabelas markdown e a lista de perguntas. Não escreva código.
</instrucoes>
```

**O que a LLM devolveu** ([saída completa](saidas/02-erros-v3.md)): 8 classes de equivalência,
9 casos e 5 perguntas com opções.

**Resultado:** é a versão usada nos testes.
- ER-01..ER-09 foram implementados como a LLM descreveu.
- Os segundos representantes vieram com motivo concreto: ER-03 (sem `error.response`),
  ER-04 (corpo 5xx não-JSON) e ER-06 (404 na localização pode vazar a mensagem da cidade).
- As 5 perguntas viraram as decisões D-05..D-08 e geraram ER-10..ER-16
  ([docs/casos-gerados.md](../docs/casos-gerados.md#decisões-tomadas-a-partir-das-perguntas-da-llm)).

**Defeitos encontrados:** os casos destravados pelas perguntas foram os mais valiosos.
ER-10..ER-12 revelaram a falta de timeout (D2) e ER-13..ER-15 revelaram que um 200 fora do
contrato derrubava a aplicação inteira (D3).
