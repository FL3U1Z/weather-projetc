# Contexto comum

Bloco colado no início dos prompts a partir da v2. A v1 de cada prompt foi feita
**sem** ele, de propósito, para medir o efeito do contexto.

O texto abaixo é exatamente o que foi enviado à LLM (dentro das tags `<contexto>`).
Ele foi escrito a partir do código real: [SearchBar.tsx](../src/components/SearchBar.tsx),
[useWeather.ts](../src/hooks/useWeather.ts), [weather.ts](../src/services/weather.ts),
[api.ts](../src/services/api.ts) e a documentação de erros da OpenWeatherMap.

As regras R1–R7 descrevem o comportamento **pretendido**. Na hora de escrevê-las, o
código ainda não cumpria R5 (o 404 nunca mostrava "Cidade não encontrada"), mas eu
ainda não sabia disso: o defeito foi descoberto pelos testes gerados.

---

```text
<contexto>
## Sistema sob teste
Aplicação web de clima (React 18 + TypeScript + Vite). Fluxo de integração:
Usuário ──► SearchBar (campo "Digite uma cidade...", botão "Buscar", botão 📍 "Usar minha localização") ──► hook useWeather ──► services/weather.ts ──► cliente axios ──► API REST OpenWeatherMap.
App.tsx decide qual tela renderizar: LoadingState | ErrorState | EmptyState | WeatherCard.
Nos testes, todo o código da aplicação roda de verdade. Só a API externa é substituída, na camada de rede, por um servidor simulado (MSW) que registra cada requisição recebida.

## Contrato da API externa
GET https://api.openweathermap.org/data/2.5/weather
Parâmetros: q (busca por cidade, texto sem espaços nas pontas) | lat, lon (busca por localização) | appid (fixo) | units=metric (fixo) | lang=pt_br (fixo)
Resposta 200 (campos lidos): name, coord{lat,lon}, weather[{id,main,description,icon}], main{temp,feels_like,temp_min,temp_max,humidity,pressure}, visibility, wind{speed,deg}, clouds{all}, dt, sys{country,sunrise,sunset}, timezone.
Erros: 401 {"cod":401,"message":"Invalid API key..."} | 404 {"cod":"404","message":"city not found"} | 429 {"cod":429,"message":"Your account is temporary blocked..."} | 5xx corpo variável.

## Regras de negócio
R1 Busca por cidade envia exatamente uma requisição GET /weather com q = texto digitado sem espaços nas pontas, mais appid, units=metric e lang=pt_br.
R2 Busca por localização envia exatamente uma requisição GET /weather com lat e lon da geolocalização, mais os parâmetros fixos. Não envia q.
R3 Campo vazio ou só com espaços não gera requisição.
R4 Enquanto a requisição está pendente, a tela de carregamento aparece e os botões ficam desabilitados.
R5 Na busca por cidade: resposta 404 mostra "Cidade não encontrada. Verifique o nome e tente novamente."; qualquer outra falha mostra "Erro ao buscar dados. Verifique sua conexão."
R6 Na busca por localização: falha da API mostra "Erro ao buscar localização."; permissão negada mostra "Permissão de localização negada." e não gera requisição.
R7 Em caso de sucesso, o card mostra cidade, país, descrição e temperaturas arredondadas, e qualquer erro anterior some da tela.

## O que conta como teste de integração
1. começa por uma ação do usuário na interface;
2. passa por todas as camadas reais até a rede;
3. verifica os dois lados da fronteira: o que chegou na API simulada (quantas requisições, com quais parâmetros) E o que o usuário vê na tela.
</contexto>
```
