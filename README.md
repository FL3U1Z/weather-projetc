# WeatherApp 🌤️

MVP de aplicação de clima em React + TypeScript + Tailwind CSS + Axios.

## 🎯 Visão Geral

Uma aplicação web moderna e responsiva que fornece informações climáticas em tempo real. O usuário pode buscar o clima de qualquer cidade ou permitir acesso à sua localização para visualizar o clima local com um design dinâmico que se adapta às condições climáticas.

## ✨ Funcionalidades

- 🔍 **Busca por Cidade** - Digite o nome de qualquer cidade para obter dados climáticos
- 📍 **Geolocalização** - Obtenha o clima da sua localização atual (GPS)
- 🌡️ **Dados Detalhados** - Temperatura, sensação térmica, mín/máx
- 💧 **Informações Climáticas** - Umidade, velocidade do vento, pressão, visibilidade, cobertura de nuvens
- 🌅 **Horários Solares** - Nascer e pôr do sol ajustados para o fuso da cidade
- 🎨 **Background Dinâmico** - Gradiente que muda conforme hora local e condição do tempo
- ⚠️ **Tratamento de Erros** - Mensagens amigáveis para cidade não encontrada, sem conexão ou sem permissão de GPS
- 🧪 **Suite de Testes** - testes unitários com Vitest

## 🛠️ Stack Tecnológico

| Tecnologia | Versão | Propósito |
|---|---|---|
| **React** | 18 | Framework UI |
| **TypeScript** | 5 | Tipagem estática |
| **Tailwind CSS** | 3 | Estilização |
| **Axios** | 1.6 | Cliente HTTP |
| **Vite** | 5 | Build tool & Dev Server |
| **Vitest** | - | Testes Unitários |
| **Testing Library** | - | Testes de Componentes |

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── SearchBar.tsx
│   ├── WeatherCard.tsx
│   ├── LoadingState.tsx
│   ├── ErrorState.tsx
│   └── EmptyState.tsx
├── hooks/              # Custom hooks
│   └── useWeather.ts    # Hook para gerenciar estado de clima
├── services/           # Serviços e integrações
│   ├── api.ts          # Instância do Axios configurada
│   └── weather.ts      # Funções de chamada à API
├── utils/              # Funções utilitárias
│   └── weatherUtils.ts # Funções de formatação e transformação
├── types/              # Tipos TypeScript
│   └── weather.ts      # Interfaces e tipos
├── test/               # Configuração de testes
│   └── setup.ts        # Setup global do Vitest
├── App.tsx             # Componente raiz
├── main.tsx            # Entry point
└── index.css           # Estilos globais

```

## 📋 Pré-requisitos

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **npm** ou **yarn** (incluído com Node.js)
- Chave da API OpenWeatherMap (gratuita)

## 🚀 Como Começar

### 1. Clone o repositório

```bash
git clone git@github.com:FL3U1Z/weather-projetc.git
cd weather-projetc
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Abra o `.env` e adicione sua chave da OpenWeatherMap:

```env
VITE_OPENWEATHER_API_KEY=sua_chave_aqui
```

> **Como obter a chave:**
> 1. Acesse [openweathermap.org/api](https://openweathermap.org/api)
> 2. Crie uma conta gratuita
> 3. Gere uma chave de API
> 4. O plano gratuito permite até 1.000 chamadas/dia

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173) no seu navegador.

## 📖 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor com hot-reload
npm run build            # Build otimizado para produção
npm run preview          # Preview da build de produção

# Testes
npm run test             # Executa testes em modo watch
npm run test:ui          # Executa testes com interface visual
```

## 🧪 Testes

O projeto possui uma suite completa de **50+ testes unitários** cobrindo:

- **weatherUtils.ts** (29 testes)
  - Conversão de emojis por código climático
  - Cálculo de direção de vento
  - Formatação de horários com timezone
  - Temas de background dinâmico

- **weather.ts** (7 testes)
  - Busca por cidade
  - Busca por coordenadas
  - Tratamento de erros

- **useWeather.ts** (14 testes)
  - Estado inicial
  - Busca por cidade
  - Busca por geolocalização
  - Tratamento de erros

### Rodando os testes

```bash
npm run test
```

Para visualizar os testes em modo UI:

```bash
npm run test:ui
```

## 🌐 API Utilizada

**OpenWeatherMap Current Weather API**
- Endpoint: `GET https://api.openweathermap.org/data/2.5/weather`
- Documentação: [openweathermap.org/current](https://openweathermap.org/current)

### Parâmetros Enviados

```javascript
{
  q: "São Paulo",        // Nome da cidade
  lat: -23.5505,         // Latitude
  lon: -46.6333,         // Longitude
  appid: "YOUR_API_KEY", // Chave da API
  units: "metric",       // Temperatura em Celsius
  lang: "pt_br"          // Descrições em português
}
```

## 🎨 Design & UX

- **Responsivo** - Adaptado para diferentes tamanhos de tela
- **Temas Dinâmicos** - Background muda conforme:
  - Hora do dia (dia/amanhecer/entardecer/noite)
  - Condição climática (chuva, neve, nublado, etc)
- **Acessibilidade** - Semântica HTML adequada e bom contraste de cores
- **Performance** - Otimizado com Vite e React 18

## 📚 Boas Práticas Implementadas

✅ **Conventional Commits** - Histórico de commits estruturado  
✅ **TypeScript** - Tipagem estática em todo o projeto  
✅ **Custom Hooks** - Lógica reutilizável com `useWeather`  
✅ **Separação de Responsabilidades** - Serviços, hooks e componentes isolados  
✅ **Testes Unitários** - Cobertura de funções críticas  
✅ **Variáveis de Ambiente** - Segurança de dados sensíveis  
✅ **Tratamento de Erros** - Feedback amigável ao usuário  

## � Git Workflow & Versionamento

O projeto utiliza uma estratégia de **versionamento por branches** com nomes temáticos inspirados em jogos, facilitando a identificação de releases e versões:

### Convenção de Branches

```
develop                    # Branch principal de desenvolvimento
├── feature/...            # Novas funcionalidades
├── bugfix/...             # Correções de bugs
├── release/assassinsCreed # Release v1.0
├── release/cyberpunk      # Release v2.0
├── release/godOfWar       # Release v3.0
└── hotfix/...             # Correções urgentes
```

### Exemplos de Releases

- `release/assassinsCreed` - Primeira versão estável
- `release/cyberpunk` - Segunda versão com novas features
- `release/godOfWar` - Terceira versão com melhorias
- `release/theWitcher` - Próximas versões...

### Workflow

1. **Desenvolvimento** → Criar branch `feature/...` a partir de `develop`
2. **Commits** → Usar Conventional Commits no histórico
3. **Release** → Merge para `release/nomeDojogo`
4. **Merge** → Retornar para `develop` após release
5. **Tags** → Criar tags para cada release (v1.0, v2.0, etc)

## �🔒 Segurança

- Arquivo `.env` nunca é commitado (protegido no `.gitignore`)
- Chaves de API mantidas seguras do lado do cliente
- Validações de entrada antes de chamadas à API

## ⚠️ Limitações Conhecidas

- **Dependência da API** - Requer conexão com internet e API OpenWeatherMap ativa
- **Limite de Requisições** - Plano gratuito permite 1.000 chamadas/dia
- **Sem Histórico** - Não armazena dados históricos de clima (stateless)
- **Sem Previsão** - Fornece apenas clima atual, não prevê próximos dias
- **Cidades Duplicadas** - Não diferencia cidades com mesmo nome em países diferentes
- **Sem Persistência** - Dados não são salvos (localStorage) entre sessões
- **Sem Offline** - Requer acesso à internet para funcionar
- **Geolocalização Opcional** - Recurso de GPS depende de permissão do navegador
- **Fuso Horário** - Depende dos dados corretos da API
- **Responsividade Parcial** - Interface otimizada para desktop, melhorias planejadas para mobile

## 🗺️ Roadmap & Melhorias Futuras

- [ ] 📱 Responsividade aprimorada (mobile-first)
- [ ] 🌙 Dark mode manual
- [ ] 📊 Previsão para próximos dias (5-7 dias)
- [ ] ⭐ Favoritar cidades (localStorage)
- [ ] 🔔 Alertas climáticos
- [ ] 🌍 Suporte para múltiplos idiomas
- [ ] 📈 Análise histórica de clima

## 🎓 Objetivo Acadêmico

Este projeto foi desenvolvido como **MVP (Minimum Viable Product)** para a pós-graduação com foco em:

- ✅ Consumo de APIs REST
- ✅ Organização de projeto frontend moderno
- ✅ Boas práticas de versionamento (Conventional Commits)
- ✅ Criação de interfaces responsivas com Tailwind CSS
- ✅ Testes unitários e qualidade de código

## 👨‍💻 Desenvolvimento

**Assistentes utilizados:**
- **Claude (Anthropic)** - Estruturação do projeto, revisão de código e resolução de erros
- **Gemini 3 Flash** - Definição de requisitos funcionais e não funcionais, elicitação de escopo para MVP.
- **OpenAI – GPT-5.3** - Boas práticas

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

---

**Dúvidas ou sugestões?** Abra uma issue no repositório! 🙌


## 👨‍💻 Autor

Flávio Barbosa

* GitHub: https://github.com/FL3U1Z
* LinkedIn: https://www.linkedin.com/in/flávio-barbosa-ab26351a2/

---

## 📝 Licença

Este projeto está sob a licença MIT.