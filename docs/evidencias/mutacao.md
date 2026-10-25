# Verificação por mutação

Gerado por `npm run test:mutacao` em 2026-10-25. Cada linha é uma execução com um único defeito injetado.

| Mutante | Defeito injetado | Integração | Unitários | Testes de integração que falharam |
|---|---|---|---|---|
| M1 | service descarta o status HTTP do erro (404 vira erro genérico) | detectado (3) | NÃO detectado | CI-05, CI-07, ER-01 |
| M2 | cliente deixa de enviar lang=pt_br | detectado (9) | NÃO detectado | CI-01, CI-02, CI-06, CI-13, ER-01, ER-08, ER-05, ER-07, ER-09 |
| M3 | SearchBar envia o texto sem remover os espaços das pontas | detectado (2) | NÃO detectado | CI-01, ER-01 |
| M4 | service troca lat e lon na busca por coordenadas | detectado (5) | detectado (2) | CI-02, CI-06, ER-05, ER-07, ER-09 |
| M5 | botão Buscar não é desabilitado durante o carregamento | detectado (2) | NÃO detectado | CI-03, ER-08 |
| M6 | service deixa de validar o corpo da resposta 200 | detectado (3) | NÃO detectado | ER-13, ER-14, ER-15 |
| M7 | cliente HTTP sem timeout | detectado (1) | NÃO detectado | ER-10 |
| M8 | service faz uma retentativa automática quando a requisição falha | detectado (13) | NÃO detectado | CI-05, CI-07, CI-13, ER-01, ER-02, ER-03, ER-04, ER-05, ER-06, ER-07, ER-11, ER-12, ER-16 |

Integração detectou 8/8; unitários detectaram 1/8.
