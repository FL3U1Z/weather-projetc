# Saída bruta: Prompt 1 (cenários de integração), v1

> Modelo: Claude Sonnet, em sessão isolada, sem acesso ao código e sem ferramentas.
> Data: 2026-10-25. Texto copiado sem edição.

---

# Casos de teste de integração: aplicação de clima (React + OpenWeatherMap)

**Stack sugerida:** Jest ou Vitest, React Testing Library, `user-event` e MSW (Mock Service Worker) para simular a API. Os testes não devem chamar a API real.

## 1. Setup do MSW

```js
// src/test/server.js
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://api.openweathermap.org/data/2.5/weather', ({ request }) => {
    const q = new URL(request.url).searchParams.get('q');
    if (q === 'Londres') {
      return HttpResponse.json({
        name: 'Londres',
        sys: { country: 'GB' },
        main: { temp: 15.2, feels_like: 14.1, humidity: 70 },
        weather: [{ description: 'nublado', icon: '04d' }],
        wind: { speed: 4.1 },
      });
    }
    return HttpResponse.json({ cod: '404', message: 'city not found' }, { status: 404 });
  }),
];

export const server = setupServer(...handlers);
```

```js
// src/setupTests.js
import '@testing-library/jest-dom';
import { server } from './test/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 2. Tabela de casos de teste

| ID | Cenário | Pré-condição / Mock | Ação | Resultado esperado |
|----|---------|---------------------|------|--------------------|
| CT-01 | Busca de cidade com sucesso | API retorna 200 para "Londres" | Digitar "Londres" e clicar em Buscar | Exibe nome, país, temperatura, sensação térmica, umidade, vento, descrição e ícone |
| CT-02 | Busca com a tecla Enter | Igual ao CT-01 | Digitar e pressionar Enter | Mesmo resultado do CT-01 |
| CT-03 | Estado de carregamento | Resposta com atraso (`delay`) | Buscar cidade | Spinner ou "Carregando..." aparece e some após a resposta |
| CT-04 | Cidade não encontrada (404) | API retorna 404 | Buscar "Xyzabc" | Mensagem "Cidade não encontrada"; nenhum dado antigo exibido |
| CT-05 | Chave de API inválida (401) | API retorna 401 | Buscar qualquer cidade | Mensagem de erro de autenticação ou erro genérico amigável |
| CT-06 | Limite de requisições (429) | API retorna 429 | Buscar cidade | Mensagem pedindo para tentar mais tarde |
| CT-07 | Erro de servidor (500) | API retorna 500 | Buscar cidade | Mensagem de erro genérica, app continua utilizável |
| CT-08 | Falha de rede | `HttpResponse.error()` | Buscar cidade | Mensagem de falha de conexão e opção de tentar novamente |
| CT-09 | Entrada vazia | Nenhuma | Clicar em Buscar sem texto | Nenhuma requisição é feita; aviso de validação |
| CT-10 | Entrada só com espaços | Nenhuma | Digitar "   " e buscar | Tratado como vazio (CT-09) |
| CT-11 | Entrada com caracteres especiais ou acentos | Handler captura `q` | Buscar "São Paulo" | Parâmetro `q` enviado corretamente codificado |
| CT-12 | Troca de unidade °C/°F | Dados já exibidos | Alternar unidade | Nova requisição com `units=imperial` (ou conversão local) e valores atualizados |
| CT-13 | Buscas consecutivas | Duas cidades mockadas | Buscar A, depois B | Só os dados de B são exibidos |
| CT-14 | Race condition | A responde lento, B rápido | Buscar A e logo B | Resultado final exibido é o de B (requisição de A ignorada ou cancelada) |
| CT-15 | Previsão de 5 dias | Mock de `/forecast` | Buscar cidade | Lista com 5 dias, cada um com data, mín/máx e ícone |
| CT-16 | Geolocalização permitida | `navigator.geolocation` mockado; handler com `lat`/`lon` | Clicar em "Usar minha localização" | Requisição por coordenadas e clima exibido |
| CT-17 | Geolocalização negada | `getCurrentPosition` chama o erro | Clicar no botão | Mensagem orientando a buscar manualmente |
| CT-18 | Histórico de buscas | `localStorage` limpo | Buscar 3 cidades | Histórico mostra as 3; clicar em um item refaz a busca |
| CT-19 | Persistência | `localStorage` com última cidade | Renderizar o app | Carrega o clima da última cidade automaticamente |
| CT-20 | Parâmetros da requisição | Handler inspeciona a URL | Qualquer busca | Contém `appid`, `units`, `lang=pt_br` e `q` corretos |
| CT-21 | Dados incompletos | Resposta sem `wind` ou `weather[0].icon` | Buscar cidade | App não quebra; campos ausentes com fallback ("--") |
| CT-22 | Acessibilidade | Dados exibidos | Navegar por teclado e roles | Input com label, botão acessível, erros em `role="alert"` |
| CT-23 | Retentativa após erro | Primeiro 500, depois 200 | Buscar, ver erro, buscar de novo | Erro some e dados aparecem |

## 3. Exemplos de implementação

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { server } from '../test/server';
import App from '../App';

describe('Aplicação de clima (integração)', () => {
  test('CT-01: exibe o clima da cidade buscada', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: /cidade/i }), 'Londres');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(await screen.findByText(/londres/i)).toBeInTheDocument();
    expect(screen.getByText(/15(\.2)?\s*°C/)).toBeInTheDocument();
    expect(screen.getByText(/nublado/i)).toBeInTheDocument();
    expect(screen.getByText(/70\s*%/)).toBeInTheDocument();
  });

  test('CT-03: mostra carregamento', async () => {
    server.use(
      http.get('https://api.openweathermap.org/data/2.5/weather', async () => {
        await delay(200);
        return HttpResponse.json({ name: 'Londres', sys: { country: 'GB' },
          main: { temp: 15, feels_like: 14, humidity: 70 },
          weather: [{ description: 'nublado', icon: '04d' }], wind: { speed: 3 } });
      })
    );
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('textbox'), 'Londres');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    expect(await screen.findByText(/londres/i)).toBeInTheDocument();
    expect(screen.queryByText(/carregando/i)).not.toBeInTheDocument();
  });

  test('CT-04: cidade não encontrada', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('textbox'), 'Xyzabc');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/não encontrada/i);
  });

  test('CT-08: falha de rede', async () => {
    server.use(
      http.get('https://api.openweathermap.org/data/2.5/weather', () => HttpResponse.error())
    );
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('textbox'), 'Londres');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/conexão|rede|tente novamente/i);
  });

  test('CT-09: não faz requisição com campo vazio', async () => {
    const spy = vi.fn(); // ou jest.fn()
    server.events.on('request:start', spy);
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByText(/digite o nome da cidade/i)).toBeInTheDocument();
  });

  test('CT-20: envia os parâmetros corretos', async () => {
    let params;
    server.use(
      http.get('https://api.openweathermap.org/data/2.5/weather', ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json({ name: 'Londres', sys: { country: 'GB' },
          main: { temp: 15, feels_like: 14, humidity: 70 },
          weather: [{ description: 'nublado', icon: '04d' }], wind: { speed: 3 } });
      })
    );
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('textbox'), 'Londres');
    await user.click(screen.getByRole('button', { name: /buscar/i }));
    await screen.findByText(/londres/i);

    expect(params.get('q')).toBe('Londres');
    expect(params.get('units')).toBe('metric');
    expect(params.get('lang')).toBe('pt_br');
    expect(params.get('appid')).toBeTruthy();
  });
});
```

## 4. Boas práticas

- Use `findBy*` e `waitFor` para operações assíncronas; evite `setTimeout` e `sleep` nos testes.
- Use `onUnhandledRequest: 'error'` para detectar chamadas não mockadas.
- Limpe `localStorage` e mocks de `navigator.geolocation` no `beforeEach`.
- Defina uma chave falsa via variável de ambiente nos testes (`VITE_OPENWEATHER_API_KEY=test-key`).
- Prefira consultas por role e label, não por classes CSS.
- Para testes end-to-end com navegador real (Cypress ou Playwright), reutilize os mesmos cenários e use `cy.intercept` ou `page.route` no lugar do MSW.
- Rode os testes no CI (`npm test -- --coverage`) e defina um limite mínimo de cobertura.

Se você me enviar a estrutura dos componentes e o serviço de API, posso adaptar os seletores e os textos exatos das mensagens.
