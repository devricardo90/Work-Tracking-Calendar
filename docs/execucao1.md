# Diario de Execucao do Projeto - Continuacao

Continuacao do registro iniciado em `docs/execucao.md`.

---

## Passo 28: CRUD real de Day Details e persistencia de Profile
**Data:** 17 de Marco de 2026

**Objetivo:**
- completar o fluxo principal com exclusao real de entrada
- colocar dados reais de perfil e locais salvos desde o inicio do uso do app

**Alteracoes realizadas no backend:**
1. Criacao de `apps/api/src/modules/profile/profile.schemas.ts`
2. Atualizacao de `apps/api/src/modules/profile/profile.service.ts`
3. Atualizacao de `apps/api/src/modules/profile/profile.routes.ts`
4. Adicao do endpoint `PUT /profile`

**Alteracoes realizadas no frontend:**
1. Atualizacao de `apps/web/src/lib/entries.ts` com `deleteEntry`
2. Atualizacao de `apps/web/src/app/entries/day-details/page.tsx` com exclusao real via API
3. Atualizacao de `apps/web/src/lib/profile.ts` com `updateProfile`
4. Atualizacao de `apps/web/src/app/profile/page.tsx` com edicao e persistencia de:
   - nome
   - idioma
   - locais salvos

**Comportamento implementado:**
- a tela `day-details` agora pode excluir a entrada real e voltar ao calendario
- a tela `profile` agora carrega e salva dados reais do usuario padrao do MVP
- locais salvos passam a ser persistidos em banco
- o Scalar passa a refletir tambem o endpoint `PUT /profile`

**Validacao executada:**
1. `pnpm.cmd typecheck` em `apps/api`
2. `pnpm.cmd lint` em `apps/web`

---

## Passo 29: Reaproveitamento de locais salvos no Add Work Entry
**Data:** 17 de Marco de 2026

**Objetivo:**
- usar dados reais do perfil desde o inicio do fluxo de lancamento de horas
- evitar redigitacao de locais ja salvos pelo usuario

**Alteracoes realizadas no frontend:**
1. Atualizacao de `apps/web/src/app/entries/new/page.tsx`
2. Consumo de `GET /profile` na abertura da tela
3. Exibicao de `savedLocations` como selecao rapida no campo de location

**Comportamento implementado:**
- o formulario de entrada continua permitindo digitacao livre
- quando houver locais salvos no perfil, eles aparecem como atalhos selecionaveis
- o usuario pode tocar num local salvo e preencher o campo instantaneamente

**Validacao executada:**
1. `pnpm.cmd lint` em `apps/web`

---

## Passo 30: Base de autenticacao com Better Auth
**Data:** 17 de Marco de 2026

**Objetivo:**
- iniciar a autenticacao real do app com email/senha
- deixar a estrutura pronta para Google OAuth

**Alteracoes realizadas no backend:**
1. Instalacao de `better-auth` e `@better-auth/cli`
2. Criacao de `apps/api/auth.js`
3. Criacao de `apps/api/src/modules/auth/auth.routes.ts`
4. Registro das rotas `/api/auth/*` no Fastify
5. Atualizacao de `apps/api/src/config.ts` com variaveis de auth
6. Atualizacao de `apps/api/.env` com `BETTER_AUTH_*` e `GOOGLE_*`
7. Geracao do schema do Better Auth no Prisma via `pnpm.cmd exec better-auth generate --config auth.js --yes`
8. Sincronizacao do banco com `pnpm.cmd exec prisma db push --accept-data-loss`

**Alteracoes realizadas no frontend:**
1. Criacao de `apps/web/src/lib/auth.ts`
2. Atualizacao de `apps/web/src/app/login/page.tsx`
3. Login real com email/senha
4. Cadastro real com email/senha
5. Botao de Google apontando para o fluxo OAuth do backend

**Ajustes tecnicos adicionais:**
1. Criacao de `apps/api/auth.d.ts` para tipagem do `auth.js`
2. Atualizacao de `apps/api/tsconfig.json`
3. Ajuste manual do `User` no Prisma para preservar a tabela existente e evitar drop

**Comportamento implementado:**
- o app agora tem auth real em `/api/auth/*`
- a tela `/login` pode autenticar e cadastrar usuarios reais
- o backend ja aceita configuracao de Google OAuth por env
- a camada de dominio ainda nao usa o usuario da sessao; isso fica como proxima etapa

**Validacao executada:**
1. `pnpm.cmd exec prisma generate`
2. `pnpm.cmd typecheck` em `apps/api`
3. `pnpm.cmd build` em `apps/api`
4. `pnpm.cmd lint` em `apps/web`

---

## Passo 31: Ownership real por sessao nas rotas privadas
**Data:** 17 de Marco de 2026

**Objetivo:**
- eliminar o modo single-user local nos endpoints privados do dominio
- aplicar a recomendacao principal de seguranca sobre ownership por `userId`

**Precondicao seguida:**
1. leitura previa de `docs/seguranca.md` antes de continuar a etapa de auth e banco

**Alteracoes realizadas no backend:**
1. Criacao de `apps/api/auth.ts` como configuracao tipada do Better Auth
2. Remocao de `apps/api/auth.js` e `apps/api/auth.d.ts`
3. Criacao de `apps/api/src/modules/auth/auth-session.ts`
4. Atualizacao de `apps/api/src/modules/entries/entry.routes.ts`
5. Atualizacao de `apps/api/src/modules/entries/entry.service.ts`
6. Atualizacao de `apps/api/src/modules/profile/profile.routes.ts`
7. Atualizacao de `apps/api/src/modules/profile/profile.service.ts`
8. Atualizacao de `apps/api/src/app.ts` para `cors.credentials = true`
9. Atualizacao de `apps/api/tsconfig.json`

**Alteracoes realizadas no frontend:**
1. Atualizacao de `apps/web/src/lib/api.ts` para enviar cookies com `credentials: include`

**Ajustes tecnicos adicionais:**
1. Remocao dos `any` restantes no backend
2. Tipagem de `FastifyReply` nas funcoes de erro
3. Resolucao do usuario autenticado via `auth.api.getSession({ headers })`

**Comportamento implementado:**
- `entries` e `profile` agora usam o `userId` da sessao autenticada
- nao existe mais fallback para `DEFAULT_USER_EMAIL` nas rotas privadas
- sem sessao valida, as rotas privadas retornam `401`
- o frontend passa a enviar o cookie da sessao nas requisicoes para a API

**Validacao executada:**
1. `pnpm.cmd typecheck` em `apps/api`
2. `pnpm.cmd build` em `apps/api`
3. `pnpm.cmd lint` em `apps/web`
4. `rg "\\bany\\b" apps\\api apps\\web` sem ocorrencias em codigo do projeto

---

## Passo 32: Registro de planejamento para Zod no frontend
**Data:** 17 de Marco de 2026

**Objetivo:**
- registrar a decisao de nao antecipar `Zod` no frontend antes da hora

**Decisao registrada:**
1. `Zod` no frontend entra como etapa planejada, nao como implementacao imediata
2. o momento correto sera no endurecimento dos formularios com `react-hook-form`
3. a ordem definida fica:
   - estabilizar sessao e rotas autenticadas
   - depois adicionar validacao nos formularios

**Arquivo atualizado:**
1. `docs/Prd.md`

---

## Passo 33: Protecao de rotas privadas no frontend por sessao
**Data:** 17 de Marco de 2026

**Objetivo:**
- impedir acesso as telas privadas da web sem login
- alinhar o frontend com o backend que ja exige sessao valida

**Alteracoes realizadas no frontend:**
1. Criacao de `apps/web/src/lib/server-auth.ts`
2. Atualizacao de `apps/web/src/lib/auth.ts` com leitura de sessao atual e `signOut`
3. Criacao de `apps/web/src/app/calendar/layout.tsx`
4. Criacao de `apps/web/src/app/entries/layout.tsx`
5. Criacao de `apps/web/src/app/history/layout.tsx`
6. Criacao de `apps/web/src/app/profile/layout.tsx`
7. Criacao de `apps/web/src/app/summary/layout.tsx`
8. Criacao de `apps/web/src/app/login/layout.tsx`
9. Atualizacao de `apps/web/src/app/profile/page.tsx` com logout real

**Comportamento implementado:**
- a web le a sessao atual em `GET /api/auth/get-session`
- `/calendar`, `/entries/new`, `/entries/day-details`, `/summary`, `/history` e `/profile` exigem sessao antes de renderizar
- sem sessao valida, o usuario e redirecionado para `/login`
- se o usuario ja estiver autenticado, `/login` redireciona para `/calendar`
- o logout do perfil encerra a sessao e volta para `/login`

**Validacao executada:**
1. `pnpm.cmd lint` em `apps/web`

---

## Passo 34: Correcao operacional do login real com Better Auth + Prisma
**Data:** 18 de Marco de 2026

**Objetivo:**
- corrigir o travamento do login real na web
- alinhar a documentacao com o comportamento real de Prisma 7 + Better Auth no projeto atual

**Precondicao seguida:**
1. releitura de `docs/regras.md` e `docs/seguranca.md` antes de mexer novamente em auth e banco

**Problemas encontrados:**
1. o login por email na tela `/login` ficava em loading infinito
2. o `POST /api/auth/sign-in/email` entrava na API e nao concluia a resposta
3. o Better Auth estava sensivel ao nome fisico da tabela de usuario no Postgres

**Causa consolidada:**
1. o Better Auth com Prisma adapter passou a operar com a tabela fisica `user`, enquanto o banco ainda estava com `"User"`
2. o `auth.ts` podia ser inicializado antes do carregamento do `.env`
3. o handler Node do Better Auth, integrado ao Fastify, precisava receber o `request.body` anexado em `request.raw`

**Alteracoes realizadas no backend:**
1. Atualizacao de `apps/api/auth.ts` para carregar `.env` antes da inicializacao do Better Auth
2. Atualizacao de `apps/api/prisma/schema.prisma` para alinhar o model `User` ao nome fisico `user`
3. Atualizacao de `apps/api/src/modules/auth/auth.routes.ts` para anexar `request.body` em `request.raw` antes de chamar `toNodeHandler`
4. Regeneracao do Prisma Client apos o ajuste de schema

**Ajuste aplicado no banco:**
1. alinhamento da tabela de usuario para o nome fisico esperado pelo Better Auth no ambiente atual
2. criacao do usuario local de teste `ricardo@gmail.com`

**Alteracoes realizadas no frontend:**
1. Atualizacao de `apps/web/src/app/login/page.tsx` para usar navegacao completa apos login bem-sucedido

**Comportamento validado:**
- `POST /api/auth/sign-in/email` voltou a responder `200`
- a sessao passou a ser criada corretamente
- o acesso a `/calendar` com a sessao ativa passou a funcionar
- o redirecionamento pos-login deixou de depender de recarga manual

**Regra operacional registrada a partir deste incidente:**
1. antes de qualquer ajuste de Prisma/Auth, validar juntos:
   - `schema.prisma`
   - nome fisico das tabelas no Postgres
   - runtime real do Better Auth adapter
2. nao reutilizar automaticamente a decisao anterior sobre `@@map("user")` sem confirmar o estado real do banco e do auth
3. apos qualquer mudanca de schema/auth:
   - regenerar Prisma Client
   - validar login real
   - validar leitura de sessao

**Validacao executada:**
1. `pnpm.cmd build` em `apps/api`
2. `pnpm.cmd typecheck` em `apps/api`
3. `pnpm.cmd lint` em `apps/web`
4. teste real de login com acesso a `/calendar`

---

## Passo 35: Hardening inicial de formularios, erros e auth
**Data:** 18 de Marco de 2026

**Objetivo:**
- executar o bloco inicial de hardening previsto no PRD
- reduzir divergencia entre frontend e backend nos formularios principais
- padronizar respostas de erro e limitar abuso nas rotas de autenticacao

**Precondicao seguida:**
1. revisao de `docs/regras.md`, `docs/seguranca.md` e `docs/Prd.md` antes de continuar a etapa de endurecimento

**Alteracoes realizadas no frontend:**
1. Criacao de `apps/web/src/lib/validation.ts`
2. Migracao de `apps/web/src/app/login/page.tsx` para `react-hook-form` + `zodResolver`
3. Migracao de `apps/web/src/app/profile/page.tsx` para `react-hook-form` + `zodResolver`
4. Migracao de `apps/web/src/app/entries/new/page.tsx` para `react-hook-form` + `zodResolver`

**Regras de validacao aplicadas no frontend:**
1. login e cadastro com email valido e senha minima de 8 caracteres
2. cadastro com nome minimo de 2 caracteres
3. profile com:
   - nome valido
   - idioma limitado aos valores suportados na UI
   - no maximo 20 locais salvos
   - sem duplicidade de locais
4. entries com:
   - `workDate` em `YYYY-MM-DD`
   - `hoursWorked > 0` e `<= 24`
   - `location` entre 2 e 120 caracteres
   - `notes` com maximo de 1000 caracteres

**Alteracoes realizadas no backend:**
1. Criacao de `apps/api/src/lib/http-errors.ts`
2. Centralizacao do tratamento de erros de `entries` e `profile`
3. Padronizacao de erros de validacao com `message`, `code` e `issues`
4. Ajuste para erros inesperados responderem `500` com log, em vez de cair como `400`
5. Ativacao de `rateLimit` no Better Auth em `apps/api/auth.ts`

**Rate limit aplicado na auth:**
1. regra geral: 10 requisicoes por 60 segundos
2. `sign-in`: 5 por 60 segundos
3. `sign-up`: 3 por 60 segundos
4. `sign-in/social`: 5 por 60 segundos

**Ajustes tecnicos adicionais no frontend:**
1. `ApiError` passou a preservar `code` e `issues`
2. requests de auth passaram a propagar `code` e `issues` quando presentes

**Comportamento implementado:**
- os formularios principais agora validam antes do envio com regras alinhadas a API
- a camada web preserva metadados de erro para exibicao e tratamento mais fino
- o backend responde de forma mais consistente para validacao, autenticacao, conflito, nao encontrado e erro interno
- as rotas de autenticacao passam a ter limitacao de abuso desde o ambiente local

**Validacao executada:**
1. `pnpm.cmd lint` em `apps/web`
2. `pnpm.cmd typecheck` em `apps/api`
3. `pnpm.cmd build` em `apps/api`

---

## Passo 36: Entrada real do app pela rota raiz
**Data:** 18 de Marco de 2026

**Objetivo:**
- remover a home provisoria de desenvolvimento
- fazer `http://localhost:3000` se comportar como entrada real do produto

**Alteracoes realizadas no frontend:**
1. Substituicao de `apps/web/src/app/page.tsx`
2. Leitura da sessao atual na rota raiz com `getServerSession()`
3. Redirecionamento da raiz para:
   - `/calendar` quando houver sessao
   - `/login` quando nao houver sessao

**Comportamento implementado:**
- a rota raiz do app deixa de funcionar como landing page de debug
- o fluxo de entrada fica alinhado ao uso real do produto
- a navegacao inicial passa a respeitar o estado de autenticacao do usuario

**Validacao executada:**
1. `pnpm.cmd lint` em `apps/web`

---

## Passo 37: Inicio de Reports com exportacao mensal em PDF
**Data:** 18 de Marco de 2026

**Objetivo:**
- iniciar a fase `Reports` prevista no PRD
- disponibilizar exportacao real do resumo mensal em PDF a partir da tela `/summary`

**Precondicao seguida:**
1. revisao de `docs/Prd.md` e `docs/seguranca.md` antes de iniciar PDF

**Alteracoes realizadas no backend:**
1. Criacao de `apps/api/src/lib/pdf.ts`
2. Criacao de `apps/api/src/modules/reports/report.schemas.ts`
3. Criacao de `apps/api/src/modules/reports/report.service.ts`
4. Criacao de `apps/api/src/modules/reports/report.routes.ts`
5. Registro das rotas de reports em `apps/api/src/app.ts`

**Alteracoes realizadas no frontend:**
1. Atualizacao de `apps/web/src/app/summary/page.tsx`
2. Ligacao do botao `Export as PDF` ao endpoint real do backend

**Comportamento implementado:**
- o backend agora expoe `GET /reports/monthly.pdf?month=YYYY-MM`
- a rota e protegida por sessao autenticada
- o PDF inclui:
  - nome do trabalhador
  - periodo selecionado
  - total de horas
  - total de dias trabalhados
  - media diaria
  - lista das entradas do mes
- a tela `/summary` abre o PDF real do mes corrente em nova aba

**Direcao adotada nesta etapa:**
- gerar um PDF simples e funcional sem adicionar dependencia externa nova
- manter o formato enxuto para validar o fluxo de relatorio antes da etapa de e-mail

**Validacao executada:**
1. `pnpm.cmd typecheck` em `apps/api`
2. `pnpm.cmd build` em `apps/api`
3. `pnpm.cmd lint` em `apps/web`

---

## Passo 38: Envio do relatorio mensal por e-mail
**Data:** 18 de Marco de 2026

**Objetivo:**
- concluir o segundo fluxo principal da fase `Reports`
- permitir o envio do relatorio mensal em PDF por e-mail

**Precondicao seguida:**
1. revisao de `docs/seguranca.md` com foco em protecao de PDF e e-mail

**Alteracoes realizadas no backend:**
1. Atualizacao de `apps/api/src/config.ts` com variaveis SMTP opcionais
2. Criacao de `apps/api/src/lib/mailer.ts`
3. Atualizacao de `apps/api/src/lib/http-errors.ts` para tratar ausencia de configuracao de e-mail como `503`
4. Atualizacao de `apps/api/src/modules/reports/report.schemas.ts`
5. Atualizacao de `apps/api/src/modules/reports/report.service.ts` com envio do PDF anexado
6. Atualizacao de `apps/api/src/modules/reports/report.routes.ts` com `POST /reports/monthly/email`
7. Instalacao de `nodemailer` e `@types/nodemailer`

**Alteracoes realizadas no frontend:**
1. Criacao de `apps/web/src/lib/reports.ts`
2. Atualizacao de `apps/web/src/app/summary/page.tsx`
3. Ligacao do botao `Send by Email` ao backend
4. Inclusao de feedback claro quando SMTP ainda nao estiver configurado

**Comportamento implementado:**
- o backend agora expoe `POST /reports/monthly/email`
- a rota e protegida por sessao autenticada
- o relatorio mensal e enviado como anexo PDF
- o fluxo usa o e-mail do perfil como valor inicial no frontend
- quando o SMTP nao estiver configurado, a API responde `503` com erro explicito

**Pendencia operacional registrada:**
1. o envio real ainda depende do preenchimento de `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM` em `apps/api/.env`
2. essa pendencia foi registrada em `pendencias.md`

**Validacao executada:**
1. `pnpm.cmd typecheck` em `apps/api`
2. `pnpm.cmd build` em `apps/api`
3. `pnpm.cmd lint` em `apps/web`

---

## Passo 39: Melhoria do layout do PDF mensal
**Data:** 18 de Marco de 2026

**Objetivo:**
- evoluir o PDF mensal de um formato funcional minimo para um relatorio mais legivel e mais proximo de uso real

**Alteracoes realizadas no backend:**
1. Refatoracao de `apps/api/src/lib/pdf.ts`
2. Atualizacao de `apps/api/src/modules/reports/report.service.ts`

**Melhorias aplicadas no PDF:**
1. cabecalho mais claro com titulo e contexto do relatorio
2. bloco de identificacao do trabalhador e periodo
3. cards textuais de resumo para:
   - total de horas
   - total de dias trabalhados
   - media diaria
4. tabela monoespacada mais legivel
5. rodape com paginacao
6. melhor quebra de pagina para meses com muitos registros

**Direcao adotada:**
- manter a geracao sem dependencia externa nova de PDF
- priorizar legibilidade e consistencia do documento antes de pensar em design mais sofisticado

**Validacao executada:**
1. `pnpm.cmd typecheck` em `apps/api`
2. `pnpm.cmd build` em `apps/api`

---

## Passo 40: Preview dedicado do relatorio mensal em PDF
**Data:** 18 de Marco de 2026

**Objetivo:**
- fechar a fase `Reports` com um fluxo de preview real do PDF
- separar melhor preview, exportacao e envio por e-mail na UX da tela `/summary`

**Alteracoes realizadas no frontend:**
1. Criacao de `apps/web/src/app/reports/layout.tsx`
2. Criacao de `apps/web/src/app/reports/preview/page.tsx`
3. Atualizacao de `apps/web/src/app/summary/page.tsx`

**Comportamento implementado:**
- a web agora tem a rota protegida `/reports/preview?month=YYYY-MM`
- essa tela carrega o PDF mensal dentro de um `iframe`
- a tela de resumo passou a separar tres acoes distintas:
  - `Preview PDF`
  - `Export as PDF`
  - `Send by Email`

**Resultado pratico:**
- o fluxo de relatorios fica mais completo e mais proximo do wireframe planejado
- o usuario pode revisar o documento antes de baixar ou compartilhar

**Validacao executada:**
1. `pnpm.cmd lint` em `apps/web`
