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
