# Saída bruta: Prompt 2 (casos de erro), v1

> Modelo: Claude Sonnet, em sessão isolada, sem acesso ao código e sem ferramentas.
> Data: 2026-10-25. Texto copiado sem edição.

---

# Casos de erro para testar a integração React x OpenWeatherMap

## 1. Erros HTTP da API
- **400 Bad Request**: parâmetros malformados (ex.: lat/lon inválidos, query vazia).
- **401 Unauthorized**: API key ausente, inválida, expirada ou ainda não ativada (novas chaves levam algumas horas para funcionar).
- **404 Not Found**: cidade inexistente, nome com erro de digitação, nome com caracteres especiais ou código de país errado.
- **429 Too Many Requests**: limite do plano gratuito excedido (60 chamadas/min). Teste cliques repetidos e digitação rápida sem debounce.
- **500, 502, 503, 504**: falha do servidor ou gateway da API.
- **Corpo de erro inesperado**: o JSON de erro vem sem o campo `message`, ou o `cod` vem como string em vez de número (a OpenWeatherMap faz isso).

## 2. Rede e infraestrutura
- Usuário offline (`navigator.onLine === false`) ou perda de conexão no meio da requisição.
- Timeout ou resposta muito lenta, com o loading ficando preso.
- Falha de DNS ou servidor inacessível.
- Erro de CORS, ou bloqueio por adblock, proxy ou firewall corporativo.
- Mixed content (HTTP chamado a partir de página HTTPS).
- Requisição cancelada com `AbortController` ao desmontar o componente ou trocar de cidade.

## 3. Respostas inesperadas ou malformadas
- JSON inválido ou resposta vazia (corpo vazio, HTML de erro de proxy).
- Campos ausentes ou `null`: `weather[]` vazio, sem `main.temp`, `wind`, `sys.country`, `rain` ou `snow`.
- Tipos diferentes do esperado (string no lugar de número).
- Ícone do clima inexistente, ou URL do ícone que falha ao carregar.
- Valores extremos: temperatura muito alta ou baixa, umidade acima de 100, `timezone` ou `dt` zerados.
- Mudança de contrato da API (campo renomeado ou removido) e versões diferentes dos endpoints (2.5 e 3.0).

## 4. Entrada do usuário
- Campo vazio ou só com espaços.
- Nomes com acentos, ç, caracteres asiáticos ou árabes (`São Paulo`, `Zürich`, `東京`).
- Caracteres especiais e tentativa de injeção (`<script>`, `&`, `?`, `#`, `%`), que devem ser codificados com `encodeURIComponent`.
- Entradas muito longas.
- Cidades homônimas (ex.: "Springfield"), ou formato `cidade,UF,país` incorreto.
- Coordenadas fora da faixa (lat > 90, lon > 180) ou não numéricas.

## 5. Geolocalização
- Permissão negada, indisponível ou com timeout.
- Navegador sem suporte à Geolocation API.
- Contexto inseguro (HTTP), em que a geolocalização é bloqueada.
- Coordenadas em oceano ou local sem estação próxima.

## 6. Estado e ciclo de vida do React
- Race condition: duas buscas seguidas em que a resposta antiga chega depois da nova e sobrescreve o estado.
- Atualização de estado após o desmonte (memory leak).
- Loading que não é resetado após erro, ou erro anterior que não é limpo após sucesso.
- Chamadas duplicadas pelo StrictMode (efeitos rodando duas vezes).
- Re-renderizações infinitas por dependências erradas no `useEffect`.
- Cache ou estado obsoleto ao trocar de unidade (°C/°F) ou de idioma.
- Falta de Error Boundary: um erro de renderização derruba a árvore inteira.

## 7. Configuração e segurança
- Variável de ambiente ausente (`REACT_APP_API_KEY` / `VITE_API_KEY` indefinida) ou build sem as envs.
- Chave exposta no bundle, ou enviada ao repositório por engano.
- Falta de tratamento para a chave inválida em produção versus desenvolvimento.
- Base URL errada ou endpoint desatualizado.

## 8. Experiência do usuário (UI)
- Mensagens de erro claras e diferenciadas por tipo (não encontrada, sem rede, limite excedido).
- Estado vazio inicial, e estado de loading com skeleton ou spinner.
- Botão de "tentar novamente" funcional.
- Acessibilidade das mensagens de erro (`role="alert"`, `aria-live`).
- Layout quebrado com nomes muito longos de cidade.
- Fuso horário e formatação de data/hora incorretos (nascer e pôr do sol).
- Formatação de unidades e localização (vírgula e ponto decimal, `lang`).

## 9. Estratégia de teste
- **Testes unitários e de componentes**: mockar `fetch`/`axios` com Jest + React Testing Library e MSW para simular cada status e payload acima.
- **Testes de integração/E2E**: Cypress ou Playwright, com interceptação de rede (`cy.intercept`, `page.route`) para forçar erros, atrasos e offline.
- **Contrato**: validar o shape da resposta com Zod ou Yup e verificar que dados inválidos caem no fluxo de erro.
- **Testes manuais**: throttling de rede no DevTools, chave inválida de verdade e bloqueio de geolocalização.
