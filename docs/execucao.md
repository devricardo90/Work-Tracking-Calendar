# Diário de Execução do Projeto

Este documento registra o passo a passo de todas as execuções realizadas no terminal durante a construção do Worker Hours Tracker.

---

## Passo 1: Inicialização do Monorepo (Fase 1)
**Data:** 17 de Março de 2026

**Comando Executado:**
```powershell
.\init.ps1
```

**Ações Realizadas:**
1. ✅ Criação das pastas base (`apps/web`, `apps/api`, `packages/ui`, `packages/types`, `packages/config`).
2. ✅ Criação do arquivo `package.json` base do workspace (`pnpm init`).
3. ✅ Instalação das dependências raiz de desenvolvimento (`turbo`, `typescript`, `eslint`, `prettier`).
4. ❌ Tentativa de iniciar o PostgreSQL via `docker compose up -d`.

**Resultado / Observações:**
- A estrutura de pastas e arquivos (`package.json`, `pnpm-workspace.yaml`, `turbo.json`) foi criada com sucesso.
- Ocorreu um erro ao subir o banco via Docker: `failed: port is already allocated`. A porta `5432` já está em uso na máquina.

**Ação de Correção Executada:**
- Portas `5432`, `5433` e `5434` estavam todas ocupadas na máquina.
- Porta ajustada para **5435** no `docker-compose.yml`.
- Atributo `version` obsoleto removido do `docker-compose.yml`.

---

## Passo 2: Instalação dos Apps (Fase 2)
**Data:** 17 de Março de 2026

**Comando Executado:**
```powershell
.\init-apps.ps1
```

**Resultado:**
1. ✅ **Frontend (Next.js 16.1.6)** instalado em `apps/web` com React 19, TypeScript, Tailwind CSS 4, ESLint.
2. ✅ **Backend (Fastify)** inicializado em `apps/api` com dependências instaladas.
3. ✅ **Prisma** inicializado (`prisma init`) em `apps/api/prisma/`.

---

## Passo 3: Configuração do Prisma e Schema (Fase 3)
**Data:** 17 de Março de 2026

**Arquivos Criados:**
- `apps/api/prisma/schema.prisma` com models `User`, `WorkEntry` e `SavedLocation`.
- `apps/api/.env` com `DATABASE_URL` apontando para `localhost:5435`.

**Próximos Passos:**
1. Subir o banco via Docker (porta 5435).
2. Rodar a migration inicial do Prisma.

---

## Passo 4: Docker PostgreSQL (Porta Final)
**Data:** 17 de Março de 2026

**Resultado do `netstat`:** Portas 5432-5435 todas em uso pelo processo `13868` (outro PostgreSQL local).

**Solução:** Porta alterada para **5499** no `docker-compose.yml` e no `apps/api/.env`.

**Resultado:**
```
✔ Container worker_hours_postgres Recreated
```
✅ Banco PostgreSQL 17 rodando em `localhost:5499`, banco `worker_hours`.

**Próximo Passo:** Rodar migration do Prisma:
```powershell
cd apps\api
pnpm prisma migrate dev --name init
```

---

## Passo 5: Ajuste de compatibilidade do Docker + Prisma
**Data:** 17 de Março de 2026

**Contexto:**
- A imagem `postgres:18` entrou em loop com o volume existente por incompatibilidade de diretório de dados.
- O projeto foi alinhado para **PostgreSQL 17** no `docker-compose.yml`.

**Resultado:**
1. ✅ Container `worker_hours_postgres` subiu corretamente em `localhost:5499`.
2. ✅ `pnpm.cmd exec prisma generate` executado com sucesso.
3. ✅ `pnpm.cmd exec prisma migrate dev --name init` executado com sucesso.
4. ✅ Migração inicial criada em `apps/api/prisma/migrations/20260317173738_init/`.

---

## Passo 6: Início do Core Domain no backend
**Data:** 17 de Março de 2026

**Objetivo:**
- Implementar a base da API Fastify e o CRUD inicial de `WorkEntry`.

**Ações realizadas:**
1. ✅ Criação da estrutura `apps/api/src/`.
2. ✅ Bootstrap do Fastify com CORS, JWT, Swagger e healthcheck.
3. ✅ Criação de utilitários de configuração, parsing de datas e Prisma runtime.
4. ✅ Implementação das rotas:
   - `GET /health`
   - `GET /entries?month=YYYY-MM`
   - `GET /entries/:workDate`
   - `POST /entries`
   - `PUT /entries/:id`
   - `DELETE /entries/:id`
5. ✅ Regra de negócio aplicada: **um registro por usuário por dia**.
6. ✅ Tratamento de conflito de unicidade preparado para responder `409`.

**Problemas encontrados durante a execução:**
- `tsx` falhou com `spawn EPERM` neste ambiente.
- Prisma 7 exigiu adapter PostgreSQL em runtime.

**Correções aplicadas:**
- Script de execução alterado para `build + node dist/src/server.js`.
- Dependências instaladas: `@prisma/adapter-pg` e `pg`.
- Prisma client configurado via `PrismaPg`.

**Validação executada:**
1. ✅ `pnpm.cmd build`
2. ✅ `pnpm.cmd typecheck`
3. ✅ `GET /health` respondendo `200`
4. ✅ `POST /entries` criando registro
5. ✅ `GET /entries?month=2026-03` listando corretamente
6. ✅ `GET /entries/2026-03-17` retornando o registro do dia
7. ✅ tentativa de duplicação no mesmo dia retornando `409`

---

## Passo 7: Formalização das regras operacionais
**Data:** 17 de Março de 2026

**Objetivo:**
- Registrar regras permanentes de execução e colaboração para este projeto.

**Ações realizadas:**
1. ✅ Criação de `docs/regras.md`.
2. ✅ Regra formalizada para uso de `pnpm`.
3. ✅ Regra formalizada para uso de `Node.js 24`.
4. ✅ Regra formalizada para Prisma 7 com PostgreSQL exigir `@prisma/adapter-pg` e `pg`.
5. ✅ Regra formalizada para registrar execuções em `docs/execucao.md`.
6. ✅ Regra formalizada para registrar erros em `docs/error.md`.
7. ✅ Regra formalizada para não insistir repetidamente em erros de sandbox ou ambiente e pedir ajuda ao usuário quando necessário.

**Observação prática:**
- Uma busca recursiva ampla com `Get-ChildItem -Recurse` falhou ao atravessar caminhos internos do sandbox em `node_modules`.
- A decisão operacional registrada foi preferir `rg` e buscas direcionadas.

---

## Passo 8: Solicitação de integração do shadcn/ui
**Data:** 17 de Março de 2026

**Solicitação do usuário:**
- adicionar `shadcn/ui` para ajudar na construção dos componentes da aplicação
- instalar componentes que possam ser reutilizados no app

**Tentativa executada:**
```powershell
pnpm.cmd dlx shadcn@latest init -y
```

**Resultado parcial:**
- o CLI iniciou corretamente
- a execução parou em um prompt interativo pedindo a seleção da biblioteca de componentes

**Próximo passo:**
- concluir a inicialização do `shadcn/ui`
- instalar o conjunto inicial de componentes base para calendário, formulários, diálogo, navegação e feedback

---

## Passo 9: Instalação concluída do shadcn/ui na web
**Data:** 17 de Março de 2026

**Ações executadas:**
```powershell
pnpm.cmd dlx shadcn@latest init --help
pnpm.cmd dlx shadcn@latest init -t next -b radix -p nova --no-monorepo -y
pnpm.cmd dlx shadcn@latest add button card input textarea label form select dialog drawer sheet tabs badge separator popover calendar dropdown-menu avatar toast alert skeleton
pnpm.cmd dlx shadcn@latest add button card input textarea label form select dialog drawer sheet tabs badge separator popover calendar dropdown-menu avatar sonner alert skeleton
```

**Resultado:**
1. ✅ `shadcn/ui` inicializado com preset `radix-nova`.
2. ✅ Arquivo `apps/web/components.json` criado.
3. ✅ `src/app/globals.css` atualizado pelo setup do `shadcn/ui`.
4. ✅ Componentes instalados em `apps/web/src/components/ui/`:
   - `alert`
   - `avatar`
   - `badge`
   - `button`
   - `calendar`
   - `card`
   - `dialog`
   - `drawer`
   - `dropdown-menu`
   - `input`
   - `label`
   - `popover`
   - `select`
   - `separator`
   - `sheet`
   - `skeleton`
   - `sonner`
   - `tabs`
   - `textarea`

**Observação:**
- O CLI recusou `toast` porque esse componente está deprecated.
- A substituição adotada foi `sonner`, conforme a recomendação atual do próprio CLI.

---

## Passo 10: Troca da documentação da API para Scalar
**Data:** 17 de Março de 2026

**Objetivo:**
- manter o OpenAPI no Fastify
- substituir o Swagger UI por Scalar
- expor a documentação da API em uma rota mais amigável

**Ações executadas:**
```powershell
pnpm.cmd add @scalar/fastify-api-reference
```

**Alterações realizadas:**
1. ✅ Instalação de `@scalar/fastify-api-reference` em `apps/api`.
2. ✅ Remoção do uso de `@fastify/swagger-ui` no bootstrap da API.
3. ✅ Integração do Scalar em `apps/api/src/app.ts`.
4. ✅ Definição da rota de documentação em `/docs/api`.
5. ✅ OpenAPI mantido com `@fastify/swagger`.

**Problema intermediário encontrado:**
- tentativa inicial de expor JSON com `exposeRoute` falhou por incompatibilidade de tipagem nesta versão do `@fastify/swagger`

**Solução adotada:**
- usar o comportamento nativo do Scalar integrado ao `@fastify/swagger`
- acessar o spec em `/docs/api/openapi.json`

**Validação executada:**
1. ✅ `pnpm.cmd build`
2. ✅ `pnpm.cmd typecheck`
3. ✅ `GET /docs/api` respondendo `200`
4. ✅ `GET /docs/api/openapi.json` respondendo `200`

---

## Passo 11: Link da documentação da API na web
**Data:** 17 de Março de 2026

**Objetivo:**
- adicionar um link visível na interface web para abrir a documentação Scalar da API local

**Alteração realizada:**
1. ✅ Atualização de `apps/web/src/app/page.tsx`
2. ✅ Inclusão de CTA para `http://localhost:3333/docs/api`
3. ✅ Inclusão de bloco visual informando também o endpoint do OpenAPI JSON

**Validação executada:**
1. ✅ `pnpm.cmd lint`
2. ⚠️ `pnpm.cmd build` bloqueado por fetch de Google Fonts (`Geist` e `Geist Mono`) no sandbox

---

## Passo 12: Remoção de Google Fonts do layout da web
**Data:** 17 de Março de 2026

**Objetivo:**
- remover a dependência de `next/font/google` para destravar o build local da web

**Alterações realizadas:**
1. ✅ Remoção de `Geist` e `Geist Mono` de `apps/web/src/app/layout.tsx`
2. ✅ Atualização dos metadados da aplicação web
3. ✅ Manutenção da tipografia via CSS/base do projeto

**Validação executada:**
1. ✅ `pnpm.cmd lint`
2. ⚠️ `pnpm.cmd build` avançou além da etapa de fontes e compilou a app, mas falhou depois com `spawn EPERM` no ambiente atual

**Resultado prático:**
- o bloqueio de Google Fonts foi eliminado
- restou apenas um bloqueio de subprocesso do ambiente durante o build completo

---

## Passo 13: Correção do warning de múltiplos lockfiles no Next.js
**Data:** 17 de Março de 2026

**Objetivo:**
- remover o warning do Next.js sobre root inferido incorretamente no monorepo

**Alterações realizadas:**
1. ✅ Atualização de `apps/web/next.config.ts` com `turbopack.root` apontando para a raiz do monorepo
2. ✅ Remoção de `apps/web/pnpm-lock.yaml`, mantendo apenas o lockfile da raiz do projeto

**Resultado esperado:**
- o `next dev` da `apps/web` deixa de avisar sobre múltiplos lockfiles
- o workspace passa a usar de forma mais consistente o lockfile da raiz

---

## Passo 14: Criação do README da raiz
**Data:** 17 de Março de 2026

**Objetivo:**
- preparar o projeto para criação do repositório com uma documentação inicial clara na raiz

**Alteração realizada:**
1. ✅ Criação de `README.md` na raiz do monorepo

**Conteúdo incluído:**
- visão geral do projeto
- stack atual
- estrutura do monorepo
- requisitos
- passos de instalação
- comandos para rodar API e web
- endpoints locais úteis
- estado atual do projeto
- referência para os documentos em `docs/`

---

## Passo 15: Preparação do repositório para versionamento
**Data:** 17 de Março de 2026

**Objetivo:**
- preparar o projeto para o primeiro commit no GitHub

**Alteração realizada:**
1. ✅ Criação de `.gitignore` na raiz do monorepo

**Cobertura do `.gitignore`:**
- `node_modules`
- artefatos de build (`.next`, `dist`)
- logs locais
- arquivos de ambiente

---

## Passo 16: Inicialização do Git e commit inicial
**Data:** 17 de Março de 2026

**Objetivo:**
- conectar o projeto ao repositório GitHub informado pelo usuário
- criar o primeiro commit do monorepo

**Ações executadas:**
1. ✅ `git init`
2. ✅ branch principal definida como `main`
3. ✅ remoto `origin` configurado para `https://github.com/devricardo90/Work-Tracking-Calendar.git`
4. ✅ remoção do `.git` interno que existia em `apps/web`
5. ✅ correção do índice Git para versionar `apps/web` como pasta normal do monorepo
6. ✅ commit criado com a mensagem:
   - `feat: bootstrap worker hours tracker monorepo`

**Observação:**
- o scaffold inicial do Next criou um repositório Git próprio em `apps/web`, o que precisou ser removido para o monorepo funcionar corretamente sob um único repositório na raiz

---

## Passo 17: Preparação do push para o GitHub
**Data:** 17 de Março de 2026

**Objetivo:**
- publicar o commit inicial no repositório remoto do GitHub

**Ações executadas:**
1. ✅ tentativa inicial de `git push -u origin main`
2. ✅ detecção do bloqueio `dubious ownership`
3. ✅ adição de `safe.directory` para a pasta do projeto

**Próximo passo:**
- criar um commit curto com a atualização desta documentação
- repetir o push para `origin/main`
