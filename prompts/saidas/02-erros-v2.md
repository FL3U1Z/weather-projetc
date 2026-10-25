# Saída bruta: Prompt 2 (casos de erro), v2

> Modelo: Claude Sonnet, em sessão isolada, sem acesso ao código e sem ferramentas.
> Data: 2026-10-25. Texto copiado sem edição.

---

## Premissas comuns (valem para todas as linhas)

- **Entrada da cidade:** o usuário digita "  São Paulo  " (com espaços nas pontas). A API simulada deve receber q=`São Paulo`, mais appid, units=metric e lang=pt_br (R1).
- **Entrada da localização:** a geolocalização simulada devolve lat=-23.55 e lon=-46.63 imediatamente. A API simulada deve receber lat e lon, mais os parâmetros fixos, e **nunca** q (R2).
- **Em toda linha de erro, verificar também:**
  - A tela de carregamento aparece enquanto a requisição está pendente, e os botões ficam desabilitados (R4).
  - Depois do erro, aparece só o ErrorState. Não há WeatherCard nem EmptyState, e os botões voltam a ficar habilitados.
  - A aplicação não quebra: não há tela em branco nem erro não tratado no console.
- **Não há retry automático** no contrato, então cada ação do usuário gera exatamente 1 requisição na fronteira. Se o código fizer retry, o teste deve falhar e expor isso.
- **Linhas marcadas com (*)** são comportamentos inferidos das regras, porque o contrato não os define literalmente. Devem ser confirmados com o time. Se a aplicação fizer outra coisa, trate como bug ou como lacuna de especificação.
- **Teste complementar (R7), um por caminho:** depois de qualquer erro, faça uma nova busca com sucesso. Deve haver mais 1 requisição (2 no total) e o card aparece, com a mensagem de erro anterior sumindo.

Mensagens usadas na tabela:
- **MC-404** = "Cidade não encontrada. Verifique o nome e tente novamente."
- **MC-GEN** = "Erro ao buscar dados. Verifique sua conexão."
- **ML** = "Erro ao buscar localização."

## Caminho A: busca por cidade (digitar e clicar em "Buscar")

| ID | Caminho | Modo de falha | Configuração da API simulada | Reqs esperadas | O que o usuário vê | Regra |
|---|---|---|---|---|---|---|
| ER-01 | Cidade | API fora do ar / erro de rede | Handler de GET /weather responde com erro de rede (conexão derrubada, sem resposta HTTP) | 1 (com q=`São Paulo`) | MC-GEN | R1, R5 |
| ER-02 | Cidade | Timeout / resposta nunca chega | Handler que nunca responde (espera infinita). Usar timers falsos ou o timeout do cliente axios, se houver | 1 | (*) Se o cliente tem timeout: carregamento até estourar, depois MC-GEN. Se não tem: carregamento permanece e os botões seguem desabilitados, o que é uma lacuna a reportar | R4, R5 |
| ER-03 | Cidade | 401 | Status 401, corpo {"cod":401,"message":"Invalid API key..."} | 1 | MC-GEN (não é 404) | R5 |
| ER-04 | Cidade | 404 | Status 404, corpo {"cod":"404","message":"city not found"} | 1 | MC-404 | R5 |
| ER-05 | Cidade | 429 | Status 429, corpo {"cod":429,"message":"Your account is temporary blocked..."} | 1 (sem retry) | MC-GEN | R5 |
| ER-06 | Cidade | 500 | Status 500 com corpo JSON qualquer | 1 | MC-GEN | R5 |
| ER-07 | Cidade | 503 | Status 503 com corpo de texto simples | 1 | MC-GEN | R5 |
| ER-08 | Cidade | 200 sem array weather | Status 200, JSON válido com name, main, sys etc., mas sem a chave weather | 1 | (*) MC-GEN. Não pode haver card parcial nem crash | R5, R7 |
| ER-09 | Cidade | 200 com weather vazio | Status 200, JSON completo com weather igual a lista vazia | 1 | (*) MC-GEN. Sem card, porque não há descrição nem ícone | R5, R7 |
| ER-10 | Cidade | 200 com corpo HTML de proxy | Status 200, Content-Type text/html, corpo "<html>...captive portal...</html>" | 1 | (*) MC-GEN | R5, R7 |
| ER-11 | Cidade | 200 com corpo vazio | Status 200, sem corpo e sem Content-Type | 1 | (*) MC-GEN | R5, R7 |
| ER-12 | Cidade | Resposta lenta e segunda busca antes de a primeira terminar | Handler com atraso controlável (resposta liberada manualmente) para q=`São Paulo`. Enquanto pendente, o usuário tenta clicar "Buscar" de novo com outro texto, "Recife" | 1 (só q=`São Paulo`). O clique no botão desabilitado não dispara nada. Após liberar a resposta, continua 1 | Durante a espera: carregamento e botões desabilitados. Ao liberar: card de São Paulo, nunca de Recife. Depois dessa liberação, uma nova busca por Recife funciona e totaliza 2 requisições | R1, R4 |

## Caminho B: busca por localização (botão 📍 "Usar minha localização")

| ID | Caminho | Modo de falha | Configuração da API simulada | Reqs esperadas | O que o usuário vê | Regra |
|---|---|---|---|---|---|---|
| ER-13 | Localização | API fora do ar / erro de rede | Handler responde com erro de rede. Geolocalização concedida | 1 (com lat e lon, sem q) | ML | R2, R6 |
| ER-14 | Localização | Timeout / resposta nunca chega | Handler nunca responde. Geolocalização concedida | 1 | (*) Se há timeout no cliente: carregamento até estourar, depois ML. Se não há: carregamento permanece e os botões ficam desabilitados, o que é uma lacuna a reportar | R4, R6 |
| ER-15 | Localização | 401 | Status 401, corpo de chave inválida | 1 | ML | R6 |
| ER-16 | Localização | 404 | Status 404, corpo "city not found" | 1 | ML. Não aparece MC-404, que é exclusiva da busca por cidade | R6 |
| ER-17 | Localização | 429 | Status 429, corpo de conta bloqueada | 1 (sem retry) | ML | R6 |
| ER-18 | Localização | 500 | Status 500 com corpo JSON qualquer | 1 | ML | R6 |
| ER-19 | Localização | 503 | Status 503 com corpo de texto simples | 1 | ML | R6 |
| ER-20 | Localização | 200 sem array weather | Status 200, JSON sem a chave weather | 1 | (*) ML. Sem card nem crash | R6, R7 |
| ER-21 | Localização | 200 com weather vazio | Status 200, JSON completo com weather vazio | 1 | (*) ML | R6, R7 |
| ER-22 | Localização | 200 com corpo HTML de proxy | Status 200, Content-Type text/html, corpo de página de portal | 1 | (*) ML | R6, R7 |
| ER-23 | Localização | 200 com corpo vazio | Status 200, sem corpo | 1 | (*) ML | R6, R7 |
| ER-24 | Localização | Resposta lenta e segunda busca antes de a primeira terminar | Handler com atraso controlável. Enquanto pendente, o usuário clica em 📍 de novo e também em "Buscar" com texto digitado | 1 (só lat e lon, sem q). Os cliques nos botões desabilitados não disparam nada. Após liberar a resposta, continua 1 | Durante a espera: carregamento e botões desabilitados. Ao liberar: card da localização, sem requisição extra | R2, R4 |

## Casos adicionais relacionados

Não fazem parte da matriz pedida, mas completam a cobertura do mesmo fluxo:

| ID | Caminho | Cenário | Configuração | Reqs | O que o usuário vê | Regra |
|---|---|---|---|---|---|---|
| ER-25 | Localização | Permissão de geolocalização negada | Geolocalização simulada rejeita com "permissão negada" | **0** | "Permissão de localização negada." | R6 |
| ER-26 | Cidade | Campo vazio ou só com espaços | Qualquer handler registrado | **0** | EmptyState, sem erro | R3 |

## Pontos de decisão a confirmar

1. **Timeout (ER-02 e ER-14):** o contrato não define timeout no cliente axios. Se não existir, o usuário fica preso no carregamento para sempre, o que é um risco de UX.
2. **200 fora do contrato (ER-08 a ER-11 e ER-20 a ER-23):** as regras só definem "falha", então inferi a mensagem genérica de cada caminho. A aplicação precisa validar a resposta, ou ao menos tratar a exceção ao ler weather[0]. Se ela quebrar a renderização, esses testes encontram um bug real.
3. **Segunda busca (ER-12 e ER-24):** pelo R4 os botões ficam desabilitados, então a corrida entre duas buscas não deveria ocorrer por clique. Se o campo de texto aceitar Enter durante o carregamento, vale um caso extra: 2 requisições e "última busca vence", com a resposta da primeira descartada mesmo que chegue depois.
