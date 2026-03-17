# Logica do App

Documento canonico das regras funcionais e decisoes de logica ja implementadas no projeto.

## Regra central de entradas

- O MVP atual suporta **um registro por usuario por dia**.
- A unicidade e garantida no backend e no banco pela regra `userId + workDate`.
- Se ja existir entrada para a data, o fluxo correto e editar, nao criar outra.

## Datas

- A data usada na UI e na API segue o formato `YYYY-MM-DD`.
- O calendario trabalha por mes no formato `YYYY-MM`.
- O frontend navega por data usando query string, por exemplo:
  - `/entries/new?date=2026-03-17`
  - `/entries/day-details?date=2026-03-17`

## Fluxo principal

### Calendar

- A tela `/calendar` consulta `GET /entries?month=YYYY-MM`.
- Dias com entrada exibem horas e indicador visual.
- Se o dia ja tiver entrada:
  - navegar para `/entries/day-details?date=YYYY-MM-DD`
- Se o dia nao tiver entrada:
  - navegar para `/entries/new?date=YYYY-MM-DD`

### Add Work Entry

- A tela `/entries/new` sempre recebe uma data alvo.
- Ao abrir, ela consulta `GET /entries/:workDate`.
- A tela tambem consulta `GET /profile` para reaproveitar `savedLocations`.
- Se existir entrada:
  - o formulario entra em modo de edicao
  - usa `PUT /entries/:id`
- Se nao existir:
  - o formulario entra em modo de criacao
  - usa `POST /entries`
- Os locais salvos do perfil aparecem como selecao rapida no campo de location.

## Day Details

- A tela `/entries/day-details` consulta `GET /entries/:workDate`.
- Se a entrada existir:
  - mostra horas, local e notas
  - permite excluir a entrada com `DELETE /entries/:id`
- Se nao existir:
  - informa ausencia de registro
  - oferece CTA para criar entrada nessa data

## Monthly Summary

- A tela `/summary` usa `GET /entries?month=YYYY-MM`.
- A partir dessa lista mensal, calcula:
  - total de horas
  - total de dias trabalhados
  - media diaria
- A lista de entradas do resumo tambem vem dessa mesma resposta mensal.

## History

- A tela `/history` usa o endpoint mensal existente.
- O filtro atual e orientado por mes.
- A busca textual e feita no frontend sobre os dados ja carregados do mes.
- Filtros mais robustos de historico podem migrar para endpoint dedicado no backend depois.

## Profile

- A tela `/profile` usa o usuario autenticado da sessao atual.
- O backend expoe os dados basicos do perfil pela API em `GET /profile`.
- O backend permite salvar o perfil em `PUT /profile`.
- O frontend mostra nome, email, idioma e lista de locais salvos a partir dessa resposta.
- Alteracoes de nome, idioma e locais salvos sao persistidas no banco.

## Auth

- O backend expoe auth do Better Auth em `/api/auth/*`.
- O login com email e senha usa:
  - `POST /api/auth/sign-in/email`
- O cadastro com email e senha usa:
  - `POST /api/auth/sign-up/email`
- O login com Google usa:
  - `GET /api/auth/sign-in/social?provider=google`
- O Google OAuth so fica ativo quando `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estiverem preenchidos.
- As rotas privadas de dominio agora resolvem o usuario pela sessao do Better Auth.
- `entries` e `profile` nao usam mais `DEFAULT_USER_EMAIL` para ownership.
- Sem sessao valida, `GET /entries`, `GET /entries/:workDate`, `POST /entries`, `PUT /entries/:id`, `DELETE /entries/:id`, `GET /profile` e `PUT /profile` retornam `401`.
- O frontend envia cookies de sessao com `credentials: include`.
- O backend aceita cookies cross-origin do frontend local com `credentials: true` no CORS.
- O frontend tambem le a sessao atual pela rota `GET /api/auth/get-session`.
- As rotas web protegidas sao bloqueadas antes da renderizacao por layouts do App Router.
- As rotas protegidas atuais sao:
  - `/calendar`
  - `/entries/new`
  - `/entries/day-details`
  - `/summary`
  - `/history`
  - `/profile`
- Sem sessao valida nessas rotas, a web redireciona para `/login`.
- A rota `/login` redireciona para `/calendar` quando a sessao ja existe.
- O botao de sair em `/profile` usa `POST /api/auth/sign-out`.

## Backend atual

### Endpoints existentes

- `GET /health`
- `GET /entries?month=YYYY-MM`
- `GET /entries/:workDate`
- `POST /entries`
- `PUT /entries/:id`
- `DELETE /entries/:id`
- `GET /profile`
- `PUT /profile`
- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `GET /api/auth/sign-in/social`

### Documentacao da API

- A documentacao da API e gerada no Fastify e exibida em Scalar.
- URL local:
  - `http://localhost:3333/docs/api`
- Como `GET /profile` e `PUT /profile` existem no backend, ambos aparecem no Scalar.

## Observacoes

- O `docs/execucao.md` registra o historico de implementacao.
- Este arquivo registra a logica funcional vigente do app.
