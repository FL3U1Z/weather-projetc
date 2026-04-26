# WeatherApp 🌤️

MVP de aplicação de clima em React + TypeScript + Tailwind CSS + Axios.

## Funcionalidades

- 🔍 Busca de clima por nome de cidade
- 📍 Clima pela localização atual do usuário (GPS)
- 🌡️ Temperatura, sensação térmica, mín/máx
- 💧 Umidade, vento, pressão, visibilidade, cobertura de nuvens
- 🌅 Horários de nascer e pôr do sol (ajustados para o fuso da cidade)
- 🎨 Fundo dinâmico que muda conforme hora local e condição do tempo
- ⚠️ Tratamento de erros (cidade não encontrada, sem conexão, sem permissão de GPS)

## Stack

| Tecnologia | Versão |
|---|---|
| React | 18 |
| TypeScript | 5 |
| Tailwind CSS | 3 |
| Axios | 1.6 |
| Vite | 5 |

## Como rodar

### 1. Instale as dependências

```bash
npm install
```

### 2. Configure a chave da API

Crie um arquivo `.env` na raiz do projeto (copie o `.env.example`):

```bash
cp .env.example .env
```

Abra o `.env` e substitua `sua_chave_aqui` pela sua chave da OpenWeatherMap:

```
VITE_OPENWEATHER_API_KEY=sua_chave_aqui
```

> Obtenha sua chave gratuita em: https://openweathermap.org/api  
> Plano gratuito cobre até 1.000 chamadas/dia — mais que suficiente para desenvolvimento.

### 3. Rode o servidor de desenvolvimento

```bash
npm run dev
```

Acesse em `http://localhost:5173`

### 4. Build para produção

```bash
npm run build
npm run preview
```

## Estrutura do projeto

```
src/
├── components/
│   ├── SearchBar.tsx       # Campo de busca + botão de localização
│   ├── WeatherCard.tsx     # Card principal com todos os dados
│   ├── EmptyState.tsx      # Estado inicial (sem busca)
│   ├── ErrorState.tsx      # Estado de erro
│   └── LoadingState.tsx    # Estado de carregamento
├── hooks/
│   └── useWeather.ts       # Custom hook (toda a lógica de estado)
├── services/
│   └── weatherService.ts   # Chamadas Axios para a API
├── types/
│   └── weather.ts          # Tipos TypeScript da API
├── utils/
│   └── weatherUtils.ts     # Funções utilitárias (emojis, formatação, tema)
├── App.tsx                 # Componente raiz
├── main.tsx                # Entry point
└── index.css               # Tailwind + utilitários globais
```

## API utilizada

[OpenWeatherMap Current Weather API](https://openweathermap.org/current)

Endpoint: `GET https://api.openweathermap.org/data/2.5/weather`

Parâmetros usados:
- `q` — nome da cidade
- `lat` / `lon` — coordenadas geográficas
- `appid` — chave da API
- `units=metric` — temperatura em Celsius
- `lang=pt_br` — descrições em português
