# Prompt 1: geração de cenários de integração

**Objetivo:** obter cenários que exercitem o fluxo UI → hook → service → axios → API, com
resultado verificável **nos dois lados da fronteira**: as requisições que chegaram à API
simulada e o que aparece na tela.

**Testes resultantes:** [src/test/integracao/cenarios.test.tsx](../src/test/integracao/cenarios.test.tsx)

Todas as versões foram executadas no Claude Sonnet, cada uma em uma sessão nova, sem
acesso ao código e sem ferramentas. As respostas completas estão em [saidas/](saidas/).

---

## v1: prompt ingênuo

```text
Gere casos de teste de integração para uma aplicação de clima feita em React que consome a API OpenWeatherMap.
```

**O que a LLM devolveu** ([saída completa](saidas/01-cenarios-v1.md)): 23 casos (CT-01..CT-23)
em tabela, mais setup do MSW e 6 testes de exemplo em código.

**Problemas:**
- **Inventou funcionalidades que não existem:** troca °C/°F (CT-12), previsão de 5 dias com
  `/forecast` (CT-15), histórico de buscas (CT-18), persistência em `localStorage` (CT-19),
  botão "tentar novamente" (CT-08), aviso de validação "digite o nome da cidade" (CT-09).
  São 6 de 23 casos que dependem, no todo ou em parte, de algo que não existe.
- **Mensagens e seletores inventados:** "Carregando...", `role="alert"`, input com label
  "cidade". Nenhum existe no app, então os exemplos de código não rodariam.
- **Resultado esperado vago:** "mensagem de erro de autenticação ou erro genérico amigável".
  Não dá para escrever um `expect` a partir disso.
- **Fronteira verificada em apenas 3 casos:** só CT-09 (nenhuma requisição), CT-11
  (codificação de q) e CT-20 (parâmetros) olham o que chegou na API. O resto só olha a tela.

**Aproveitável:** a ideia de usar MSW com `onUnhandledRequest: 'error'`, o caso de race
condition (CT-14) e a verificação dos parâmetros fixos (CT-20).

**Mudança para a v2:** colar o [contexto comum](00-contexto-comum.md) com contrato, regras
e definição de teste de integração; proibir funcionalidades fora das regras; exigir
número de requisições e texto exato em cada caso.

---

## v2: com contexto e formato obrigatório

```text
Você vai me ajudar a projetar testes de integração. Leia o contexto e depois siga as instruções.

<contexto>
(bloco de 00-contexto-comum.md)
</contexto>

<instrucoes>
Gere cenários de integração para os fluxos de busca por cidade e por localização.
- Use somente as funcionalidades, parâmetros e mensagens descritos no contexto. Não invente telas, botões, textos, endpoints ou recursos (histórico, troca de unidade, previsão etc.).
- Cubra: caminho feliz de cada fluxo, entradas-limite (espaços nas pontas, acentos, caracteres que precisam de codificação na URL, entrada vazia) e sequências de ações (ex.: erro seguido de sucesso, duas buscas seguidas).
- Para cada cenário informe: ID (CI-01, CI-02…), ação do usuário, resposta configurada na API simulada, verificação na fronteira (número exato de requisições e parâmetros esperados), verificação na tela (texto exato quando houver) e regra coberta (R1–R7).
- Formato: uma tabela markdown. Não escreva código.
</instrucoes>
```

**O que a LLM devolveu** ([saída completa](saidas/01-cenarios-v2.md)): 40 cenários (CI-01..CI-40),
todos com número de requisições e texto exato.

**Melhorou:** nenhuma funcionalidade inventada; todos os casos verificam a fronteira;
apareceram sequências interessantes, como cidade → localização sem `q` residual (CI-33/34)
e caracteres reservados de URL (`Rio & Janeiro?#=+`, CI-06).

**Problemas:**
- **Volume e redundância:** 40 casos, vários exercitando a mesma fronteira do mesmo jeito.
  Por exemplo, CI-04/CI-05 (acento) e CI-19/CI-20 (coordenadas).
- **Invadiu o escopo do Prompt 2:** 11 cenários (CI-12..CI-17, CI-21..CI-25) são modos de
  falha da API, que é exatamente o que o prompt de erros cobre.
- **Supôs comportamento:** CI-02 (Enter) e CI-17 (corpo malformado) dependem de regras que
  não existem. A LLM avisou numa observação final, mas preencheu o resultado mesmo assim.

**Mudança para a v3:** separar o escopo dos dois prompts; limitar a 12 cenários ordenados
por risco; exigir **perguntas** em vez de suposições.

---

## v3: escopo, prioridade por risco e perguntas

Mesmo contexto da v2. Instruções:

```text
<instrucoes>
Gere cenários de integração para os fluxos de busca por cidade e por localização.
- Use somente as funcionalidades, parâmetros e mensagens descritos no contexto. Não invente telas, botões, textos, endpoints ou recursos.
- Escopo: caminho feliz, entradas-limite e sequências de ações. NÃO inclua modos de falha da API (status de erro, rede, corpo inválido): eles são cobertos por outro prompt. A única exceção é quando a falha faz parte de uma sequência (ex.: erro seguido de sucesso).
- No máximo 12 cenários. Se dois cenários exercitam a mesma fronteira da mesma forma, mantenha só um. Ordene pelo risco de defeito de integração (o que tem mais chance de quebrar entre camadas primeiro) e justifique o risco em uma frase.
- Para cada cenário informe: ID (CI-01…), ação do usuário, resposta configurada na API simulada, verificação na fronteira (número exato de requisições e parâmetros), verificação na tela (texto exato quando houver), regra coberta e risco.
- Se o comportamento esperado de um cenário não estiver definido pelas regras R1–R7, NÃO suponha: coloque-o numa seção final "Perguntas" com a dúvida e o cenário que ela destrava.
- Formato: uma tabela markdown e, se houver, a lista de perguntas. Não escreva código.
</instrucoes>
```

**O que a LLM devolveu** ([saída completa](saidas/01-cenarios-v3.md)): 12 cenários ordenados
por risco e 6 perguntas.

**Resultado:** é a versão usada nos testes. Os 12 cenários viraram CI-01..CI-12, e CI-13
foi resgatado da v2 (caracteres reservados) porque cobre a codificação feita pelo axios,
que a v3 deixou de fora. As 6 perguntas viraram as decisões D-01..D-04 em
[docs/casos-gerados.md](../docs/casos-gerados.md#decisões-tomadas-a-partir-das-perguntas-da-llm).

**Defeito encontrado:** CI-05 e CI-07 falharam no código original. O 404 mostrava
"Erro ao buscar dados. Verifique sua conexão." (defeito D1, ver [reflexão](../docs/reflexao.md)).
