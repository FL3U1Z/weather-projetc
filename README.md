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

## Tecnologias

| Tecnologia | Versão |
|---|---|
| React | 18 |
| TypeScript | 5 |
| Tailwind CSS | 3 |
| Axios | 1.6 |
| Vite | 5 |

# ⚙️ Configuração do ambiente


## 📋 Pré-requisitos

| Requisito | Status | Detalhes |
|-----------|--------|----------|
| **Node.js** | Necessário | v16+ recomendado |
| **npm/yarn** |  Necessário | Gerenciador de pacotes |
| **Dependências** |  Necessário | React, TypeScript, Vite, Tailwind, Axios |
| **Variáveis de Ambiente** | Necessário | VITE_OPENWEATHER_API_KEY |

### Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento (Vite)
npm run build    # Build otimizado para produção
npm run preview  # Preview da build de produção
```

### 1. Clone o repositório

```bash
git clone git@github.com:FL3U1Z/weather-projetc.git
cd weather-project
```

### 2. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com sua chave:

```env
OPENAI_API_KEY=sua_chave_aqui
```

> Nunca suba o arquivo `.env` para o repositório. Ele já está no `.gitignore` para segurança.

---

## Como Executar

### 1. Instale as dependências (Se não foi instalada ainda)

```bash
npm install
```

### 2. Configure a chave da API - Passo fundamental para rodar o projeto

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

## API utilizada

[OpenWeatherMap Current Weather API](https://openweathermap.org/current)

Endpoint: `GET https://api.openweathermap.org/data/2.5/weather`

Parâmetros usados:
- `q` — nome da cidade
- `lat` / `lon` — coordenadas geográficas
- `appid` — chave da API
- `units=metric` — temperatura em Celsius
- `lang=pt_br` — descrições em português

### Assistentes de código
- **Claude (Anthropic)** — utilizado como assistente durante o desenvolvimento para estruturação do projeto, revisão de código e resolução de erros
