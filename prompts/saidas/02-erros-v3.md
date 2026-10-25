# Saída bruta: Prompt 2 (casos de erro), v3

> Modelo: Claude Sonnet, em sessão isolada, sem acesso ao código e sem ferramentas.
> Data: 2026-10-25. Texto copiado sem edição.

---

# Casos de erro para testes de integração (busca por cidade e por localização)

Convenções: **C** é a busca por cidade e **L** é a busca por localização. Todos os casos partem da tela inicial (EmptyState), sem busca anterior. "Fronteira" é a API simulada (MSW).

## 1. Classes de equivalência

| Classe | Caminho | Modos de falha que ela cobre | Comportamento observável pelas regras | Regra |
|---|---|---|---|---|
| EQ-C1 | C | 404 | "Cidade não encontrada. Verifique o nome e tente novamente." | R5 |
| EQ-C2 | C | API fora do ar, conexão derrubada, 401, 429, 500, 503 | "Erro ao buscar dados. Verifique sua conexão." | R5 ("qualquer outra falha") |
| EQ-L1 | L | API fora do ar, conexão derrubada, 401, 404, 429, 500, 503 | "Erro ao buscar localização." (o 404 não tem tratamento especial em L) | R6 |
| EQ-S1 | C e L | Resposta lenta e segunda ação feita pelos botões, que estão desabilitados | Uma única requisição e a resposta lenta renderiza normalmente | R4, R1, R2, R7 |
| EQ-IND-1 | C e L | Timeout / resposta que nunca chega | Não definido | Ver Perguntas P1 |
| EQ-IND-2 | C e L | 200 com JSON sem `weather` ou com `weather` vazio | Não definido | Ver Perguntas P2 |
| EQ-IND-3 | C e L | 200 com corpo HTML de proxy ou corpo vazio | Não definido | Ver Perguntas P3 |
| EQ-IND-4 | C e L | Resposta lenta e segunda ação por outro meio (Enter no campo, troca de caminho) | Não definido | Ver Perguntas P4 |

## 2. Casos de teste

Segundos representantes só entram onde há motivo concreto. Os motivos estão na coluna "Observação".

| ID | Caminho | Modo de falha | Configuração da API simulada | Requisições esperadas | O usuário deve ver | Regra | Observação |
|---|---|---|---|---|---|---|---|
| ER-01 | C | 404 | Responde 404 com `{"cod":"404","message":"city not found"}`. Usuário digita `"  Londres  "` (com espaços) e clica em "Buscar". | **1** GET /weather com `q=Londres` (sem espaços), `appid`, `units=metric` e `lang=pt_br` | "Cidade não encontrada. Verifique o nome e tente novamente." Sem card, sem carregamento, botões habilitados. | R5, R1, R4 | Representante de EQ-C1. Os espaços verificam o trim em um caso de erro. |
| ER-02 | C | 500 | Responde 500 com `{"message":"Internal error"}`. Usuário digita "Londres" e clica em "Buscar". | **1** com `q=Londres` e os parâmetros fixos (sem retentativa) | "Erro ao buscar dados. Verifique sua conexão." Sem card, sem carregamento, botões habilitados. | R5, R1, R4 | Representante principal de EQ-C2. |
| ER-03 | C | API fora do ar / conexão derrubada | Handler retorna erro de rede (conexão recusada). Busca por "Londres". | **1** com `q=Londres` e os parâmetros fixos | "Erro ao buscar dados. Verifique sua conexão." Sem card. | R5, R1 | Segundo representante de EQ-C2. Motivo: sem resposta HTTP, o código pode ler `error.response.status` e quebrar, ou mapear a mensagem de outro jeito. |
| ER-04 | C | 503 com corpo não-JSON | Responde 503 com corpo HTML (`<html>Service Unavailable</html>`). Busca por "Londres". | **1** com `q=Londres` e os parâmetros fixos | "Erro ao buscar dados. Verifique sua conexão." Sem card. | R5, R1 | Segundo representante de EQ-C2. Motivo: o contrato diz que o corpo do 5xx é variável, e o código pode ler `data.message` ou `data.cod` e falhar. |
| ER-05 | L | 500 | Geolocalização retorna lat -23.55 e lon -46.63. A API responde 500 com `{"message":"Internal error"}`. Usuário clica em 📍. | **1** com `lat=-23.55`, `lon=-46.63` e os parâmetros fixos, **sem `q`** | "Erro ao buscar localização." Sem card, sem carregamento, botões habilitados. | R6, R2, R4 | Representante principal de EQ-L1. |
| ER-06 | L | 404 | Mesma geolocalização. A API responde 404 com `{"cod":"404","message":"city not found"}`. Clique em 📍. | **1** com `lat`, `lon` e os parâmetros fixos, sem `q` | "Erro ao buscar localização." (e **não** "Cidade não encontrada...") | R6, R2 | Segundo representante de EQ-L1. Motivo: o serviço pode reutilizar o mapeamento de 404 da busca por cidade e vazar a mensagem errada. |
| ER-07 | L | API fora do ar / conexão derrubada | Mesma geolocalização. Handler retorna erro de rede. Clique em 📍. | **1** com `lat`, `lon` e os parâmetros fixos, sem `q` | "Erro ao buscar localização." Sem card. | R6, R2 | Segundo representante de EQ-L1. Motivo: o caminho sem `error.response` pode ter um tratamento diferente no caminho de localização. |
| ER-08 | C | Resposta lenta e segunda ação pelos botões | Handler com atraso controlado (a resposta só é liberada pelo teste) e 200 válido (Londres, GB). Usuário busca "Londres". Durante a espera, tenta clicar em "Buscar" e em 📍, que estão desabilitados. Depois o teste libera a resposta. | **1** no total, com `q=Londres` e os parâmetros fixos. A tentativa de clique nos botões desabilitados não gera nada. | Durante a espera: tela de carregamento e botões desabilitados. Depois: card com a cidade, o país, a descrição e as temperaturas arredondadas. Nenhuma mensagem de erro. | R4, R1, R7 | Representante de EQ-S1 em C. |
| ER-09 | L | Resposta lenta e segunda ação pelos botões | Mesma ideia, com geolocalização válida. Usuário clica em 📍 e, durante a espera, tenta clicar em 📍 e em "Buscar", que estão desabilitados. Depois o teste libera a resposta. | **1** no total, com `lat`, `lon` e os parâmetros fixos, sem `q` | Durante a espera: carregamento e botões desabilitados. Depois: card com os dados da resposta. | R4, R2, R7 | Representante de EQ-S1 em L. |

Itens que ficaram fora de propósito:
- Os modos 401, 429 e 503 simples não têm caso próprio. Pelas regras eles são equivalentes ao 500 em cada caminho e não há motivo concreto para suspeitar de tratamento diferente.
- O ER-01 usa espaços nas pontas para exercitar o trim (R1), mas o foco do caso continua sendo o erro 404.

## 3. Perguntas

Estes casos não foram gerados. O resultado esperado só será preenchido depois da resposta do time.

| ID | Caso bloqueado | Pergunta objetiva | Opções |
|---|---|---|---|
| P1 | Timeout / resposta que nunca chega, em C e em L | A aplicação deve ter timeout? Se tiver, qual valor, e o que o usuário vê quando ele estoura? As regras não definem timeout nem dizem se uma resposta que nunca chega conta como "falha". | (a) Há timeout de N ms e conta como falha comum: em C aparece "Erro ao buscar dados. Verifique sua conexão." e em L aparece "Erro ao buscar localização.". (b) Há timeout com mensagem própria (qual?). (c) Não há timeout: o carregamento fica indefinidamente e o teste só verifica isso. |
| P2 | 200 com JSON válido mas sem `weather`, ou com `weather: []`, em C e em L | Uma resposta 200 que viola o contrato deve ser tratada como falha ou como sucesso parcial? Os dois sub-casos (campo ausente e array vazio) devem ter o mesmo comportamento? R7 só define o sucesso com dados completos. | (a) Falha: C mostra a mensagem genérica de R5 e L mostra a de R6. (b) Sucesso parcial: o card aparece sem descrição ou ícone. (c) Mensagem nova e específica (qual?). (d) Ausente e vazio se comportam de forma diferente (detalhar). |
| P3 | 200 com corpo HTML de proxy ou corpo vazio, em C e em L | Resposta 200 com corpo que não é JSON deve ser tratada como falha? Vale a mesma decisão de P2? | (a) Falha, com as mesmas mensagens de P2(a). (b) Mensagem diferente. (c) Mesma decisão de P2, que vale para todo corpo fora do contrato. |
| P4 | Segunda ação durante a pendência por meio diferente dos botões (Enter no campo de texto; outro texto digitado; troca entre C e L) | Durante a requisição pendente, o campo de texto fica desabilitado? Enter deve disparar uma nova busca? Se disparar, o que vale? Isso define quantas requisições chegam à fronteira e qual resposta aparece quando as duas chegam fora de ordem. | (a) A segunda ação é ignorada: 1 requisição, e o usuário vê só a primeira resposta. (b) Nova requisição e a antiga é cancelada (abort): 2 requisições, e o usuário vê só a última. (c) Nova requisição e a antiga é descartada ao chegar (última ação vence): 2 requisições. (d) Nova requisição sem descarte (a última resposta a chegar vence): 2 requisições. |
| P5 | Erro depois de uma busca bem-sucedida (card já na tela), em C e em L | Quando uma busca seguinte falha, o card anterior some e dá lugar ao erro, ou permanece junto da mensagem? R7 só diz que o erro some no sucesso, e o App parece escolher uma tela única. | (a) O card some e só o erro é exibido. (b) O card anterior permanece e o erro é mostrado junto. (c) O card permanece e nenhum erro é mostrado (improvável). |
