# Saída bruta: Prompt 1 (cenários de integração), v3

> Modelo: Claude Sonnet, em sessão isolada, sem acesso ao código e sem ferramentas.
> Data: 2026-10-25. Texto copiado sem edição.

---

## Cenários de integração: busca por cidade e por localização

| ID | Ação do usuário | Resposta configurada na API simulada | Verificação na fronteira | Verificação na tela | Regra | Risco (ordenado do maior ao menor) |
|---|---|---|---|---|---|---|
| CI-01 | Digita "  São Paulo  " (espaços nas pontas) e clica em "Buscar" | 200 com name "São Paulo", sys.country "BR", weather[0].description, main.temp etc. | Exatamente 1 GET /weather. q = "São Paulo" (sem espaços nas pontas). appid presente, units=metric, lang=pt_br. Sem lat/lon. | Card com cidade, país e descrição. Temperaturas arredondadas, sem decimais. | R1, R7 | Mais alto: o texto digitado passa por três camadas (input, hook, serviço/axios). Trim e codificação de acentos e espaços internos podem falhar entre elas. |
| CI-02 | Concede geolocalização (coordenadas fixas, ex.: lat -23.55, lon -46.63) e clica em 📍 "Usar minha localização" | 200 com dados válidos | Exatamente 1 GET /weather. lat e lon iguais às da geolocalização. Fixos: appid, units=metric, lang=pt_br. Nenhum q. | Card com cidade, país, descrição e temperaturas arredondadas. | R2, R7 | Alto: a conversão da API do navegador para parâmetros de query é um caminho distinto, e o serviço pode misturar q com lat/lon. |
| CI-03 | Digita "Londres" e clica em "Buscar"; antes da resposta, observa a tela | 200 com atraso controlado (resposta pendente até o teste liberar) | Durante a espera: 1 requisição recebida, ainda sem resposta. Depois de liberar: continua 1 no total. | Enquanto pendente: tela de carregamento visível e botões "Buscar" e 📍 desabilitados. Após liberar: carregamento some, botões voltam a habilitar e o card aparece. | R4, R7 | Alto: o estado de loading cruza hook, App e SearchBar, e o desabilitar e reabilitar costuma falhar na transição. |
| CI-04 | Digita "Rio de Janeiro" e clica em "Buscar"; depois digita "Curitiba" e clica em "Buscar" (sequência de sucessos) | 200 para cada cidade, com dados distintos | 2 requisições no total, na ordem: 1ª q="Rio de Janeiro", 2ª q="Curitiba". Cada uma com os fixos. | Após a 2ª: card mostra só Curitiba, sem resquício dos dados do Rio. | R1, R7 | Alto: estado antigo pode vazar entre buscas ou a resposta atrasada pode sobrescrever a nova. |
| CI-05 | Digita cidade inexistente, ex.: "Xyzabc", clica em "Buscar" (erro); depois digita "Recife" e clica em "Buscar" | 1ª: 404 {"cod":"404","message":"city not found"}. 2ª: 200 válido | 2 requisições: q="Xyzabc", depois q="Recife". | Após a 1ª: "Cidade não encontrada. Verifique o nome e tente novamente." Após a 2ª: o texto de erro desaparece e o card de Recife aparece. | R5, R7 | Alto: a limpeza do erro anterior depende do hook e do App; é um defeito clássico de estado preso. |
| CI-06 | Com o card de uma cidade já exibido, clica em 📍 com permissão concedida | 1ª busca por cidade: 200 (cidade A). Busca por localização: 200 (cidade B) | 2 requisições. A 1ª tem q e não tem lat/lon. A 2ª tem lat e lon e não tem q (nada do q anterior vaza). | Card passa a mostrar a cidade B. | R1, R2, R7 | Médio-alto: alternar entre os dois modos de busca pode reaproveitar parâmetros ou estado do modo anterior. |
| CI-07 | Concede geolocalização e clica em 📍 depois de uma busca por cidade que falhou com 404 | 1ª: 404. 2ª (localização): 200 válido | 2 requisições: 1ª com q, 2ª com lat e lon e sem q. | Após a 2ª: mensagem de erro de cidade some e o card aparece. | R5, R2, R7 | Médio-alto: o erro de um modo precisa sumir ao concluir com sucesso o outro modo. |
| CI-08 | Clica em "Buscar" com o campo vazio | Nenhuma resposta configurada (o servidor simulado não deve receber nada) | 0 requisições. | Nenhuma tela de carregamento e nenhuma mensagem nova. A tela permanece como estava (ver Pergunta 1). | R3 | Médio: a validação fica na interface e pode vazar uma requisição com q vazio. |
| CI-09 | Digita "     " (só espaços) e clica em "Buscar" | Nenhuma resposta configurada | 0 requisições. | Igual ao CI-08. | R3 | Médio: o trim precisa ser aplicado antes da validação; é um limite diferente do campo vazio. |
| CI-10 | Digita um nome com espaço interno e acento, ex.: "São José dos Campos", e clica em "Buscar" | 200 válido | Exatamente 1 requisição. O valor decodificado de q é "São José dos Campos". | Card exibe a cidade retornada. | R1, R7 | Médio: a codificação de URL do cliente axios é uma fronteira real. Mantido separado do CI-01 porque o foco é o espaço interno, não as pontas. |
| CI-11 | Bloqueia a permissão de geolocalização e clica em 📍 | Resposta 200 configurada, mas não deve ser acionada | 0 requisições. | "Permissão de localização negada." | R6 | Médio: o erro da geolocalização nasce fora do axios e precisa chegar à tela sem passar pela rede. |
| CI-12 | Digita "Salvador" e pressiona Enter em vez de clicar em "Buscar" | 200 válido | Ver Pergunta 2. | Ver Pergunta 2. | (nenhuma) | Baixo: é um comportamento não definido nas regras, por isso depende da resposta à Pergunta 2. |

Observação: CI-12 fica bloqueado até a Pergunta 2 ser respondida. Se for decidido que Enter não faz parte do escopo, o cenário sai e restam 11.

## Perguntas

1. **Campo vazio ou só com espaços (CI-08, CI-09):** R3 só diz que não gera requisição. O que o usuário deve ver depois: a tela anterior permanece intacta (card ou erro anterior continua), aparece o EmptyState ou alguma mensagem? Isso destrava a verificação na tela dos dois cenários.
2. **Tecla Enter (CI-12):** as regras não dizem se Enter no campo dispara a busca. Ela dispara, e exatamente 1 vez? Isso destrava o CI-12.
3. **Clique durante o carregamento (reforço do CI-03):** os botões ficam desabilitados, mas não está definido o que ocorre com o texto do campo de busca durante o carregamento (continua editável ou também fica desabilitado). Preciso saber se devo verificar o campo ou só os dois botões.
4. **Temperaturas arredondadas (CI-01, CI-02):** R7 diz "arredondadas", mas não define a regra para valores como 20,5 (arredondar para cima, para o mais próximo ou truncar). Qual é o valor esperado exato na tela? Sem isso uso valores sem ambiguidade, como 21,2 para 21.
5. **Campo de texto após busca por localização (CI-06, CI-07):** o campo "Digite uma cidade..." mantém o texto anterior, é limpo ou é preenchido com a cidade retornada? Não há regra, então não verifico o campo até a resposta.
6. **Sucesso seguido de busca vazia (CI-08, CI-09):** se já houver um card na tela, a busca vazia mantém o card? Faz parte da Pergunta 1, mas a resposta muda o resultado esperado quando há card prévio.
