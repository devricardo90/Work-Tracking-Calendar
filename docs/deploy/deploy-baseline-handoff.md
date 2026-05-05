# Deployment Baseline Handoff

## Estado do Deploy: VALIDATED

Este documento registra o estado final confirmado do deploy baseline em producao.

Data do registro: 2026-05-05

### 1. Commit ativo

- **Commit ativo:** `13b2cd9 fix: route web auth through first-party proxy`
- **Vercel (Production):** Ready, rodando o commit `13b2cd9`
- **GitHub `origin/main`:** `13b2cd9`

### 2. Estado dos providers

- **Vercel (Web):**
  - Production Deployment confirmado como Ready.
  - Deploy ativo confirmado no commit `13b2cd9`.
  - Proxy first-party de auth validado.

- **Render (API):**
  - API online.
  - `BETTER_AUTH_URL` corrigido no Render para a URL base da API.
  - Fluxo email/password validado em producao.

- **Neon (Database):**
  - Nao mexer sem autorizacao explicita.
  - Nenhuma migration foi executada durante este registro.
  - Nenhum seed foi executado durante este registro.

### 3. Smoke test autenticado

Confirmado manualmente em producao:

- [x] Login por e-mail/senha.
- [x] Acesso autenticado a `/calendar`.
- [x] Auth proxy + `BETTER_AUTH_URL` corrigidos.

Fora de escopo neste baseline:

- Google OAuth.
- SMTP/e-mail transacional.
- Alteracoes de Neon.
- Prisma migrations.
- Seed de dados.

### 4. Estado operacional final

O baseline de producao esta validado para o fluxo autenticado por e-mail/senha.

O proximo trabalho deve partir deste ponto, sem repetir ajustes de auth ja validados, salvo se um novo erro de producao for observado.
