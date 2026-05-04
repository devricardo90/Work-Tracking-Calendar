# Deployment Baseline Handoff

## Estado do Deploy: IN_PROGRESS / PAUSED ⏸️

Este documento registra o ponto exato de parada do deploy baseline para a próxima sessão.

### 1. Resumo Técnico (Preflight Local)
O código local e no repositório GitHub está validado e pronto para deploy:
- **Lint (Web):** OK
- **Typecheck (Web):** OK
- **Build (Web):** OK (Next.js 16.1.6)
- **Build (API):** OK (TSC + Prisma Generate)
- **Migrations:** Migration crítica `20260427210533_sync_auth_schema` versionada e pronta.

### 2. Estado dos Providers
- **Vercel (Web):** 
  - Primeira tentativa apresentou erro de configuração (Build Command vs Root Directory).
  - **Ação necessária:** Configurar `Root Directory: apps/web` e `Build Command: pnpm build` (ou recriar o projeto).
- **Render/Railway (API):**
  - Aguardando confirmação final de deploy bem-sucedido com as variáveis de ambiente corretas.
- **Neon (Database):**
  - Aguardando confirmação de que a `DATABASE_URL` foi inserida no provider da API.
  - **Importante:** Migrations de produção (`prisma migrate deploy`) ainda não foram executadas.

### 3. Smoke Test Pendente (NÃO REALIZADO)
O deploy baseline só poderá ser marcado como DONE após a validação bem-sucedida de:
- [ ] API `/health` e `/config/status` (URLs reais).
- [ ] Web `/login` (URL real).
- [ ] Fluxo completo: Signup -> Login -> Criar Registro Teste -> Validar no Calendário -> Logout.

---

## PRÓXIMA TASK RECOMENDADA (READY)
**Título:** Deploy validation and authenticated smoke test

**Objetivo:**
Finalizar a configuração dos providers, executar as migrations de produção e validar o funcionamento real da aplicação (fluxo autenticado).

**Escopo:**
1. Confirmar/Configurar URLs reais:
   - `CORS_ORIGIN` (na API)
   - `BETTER_AUTH_URL` (na API)
   - `NEXT_PUBLIC_API_URL` (na Web)
2. Executar: `pnpm --filter api exec prisma migrate deploy` no ambiente de produção.
3. Realizar Smoke Test autenticado.
4. Documentar o sucesso final em `STATUS.md` e `backlog.md` (arquivos a serem criados no momento correto).
