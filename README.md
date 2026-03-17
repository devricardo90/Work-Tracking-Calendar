# Worker Hours Tracker

Monorepo para um app de controle de horas trabalhadas com calendario, lançamentos diários, resumo mensal e documentação de API.

## Stack

- `pnpm` workspace + `turbo`
- `Node.js 24`
- `Next.js 16` em `apps/web`
- `Fastify 5` + `Prisma 7` em `apps/api`
- `PostgreSQL 17` via Docker
- `shadcn/ui` na interface
- `Scalar` para a documentação da API

## Estrutura

```text
apps/
  api/   Backend Fastify + Prisma + Scalar
  web/   Frontend Next.js + shadcn/ui
docs/    PRD, execução, erros, segurança e regras operacionais
```

## Requisitos

- `Node.js 24`
- `pnpm`
- Docker Desktop ativo

## Instalação

Na raiz do projeto:

```powershell
pnpm install
docker compose up -d
```

Aplicar o banco:

```powershell
cd apps\api
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init
```

## Rodando localmente

API:

```powershell
cd apps\api
pnpm build
pnpm start
```

Web:

```powershell
cd apps\web
pnpm dev
```

## Endpoints locais

- Web: `http://localhost:3000`
- API: `http://localhost:3333`
- Scalar docs: `http://localhost:3333/docs/api`
- OpenAPI JSON: `http://localhost:3333/docs/api/openapi.json`
- PostgreSQL: `localhost:5499`

## Estado atual

- backend base implementado com healthcheck e CRUD inicial de `WorkEntry`
- regra atual do MVP: um registro por usuário por dia
- web com base visual inicial e link direto para a documentação da API
- documentação operacional mantida em `docs/`

## Documentação do projeto

- `docs/Prd.md`
- `docs/resumo.md`
- `docs/sitemap.md`
- `docs/wireframe.md`
- `docs/seguranca.md`
- `docs/regras.md`
- `docs/execucao.md`
- `docs/error.md`

## Observações

- Para Prisma 7 com PostgreSQL, este projeto usa `@prisma/adapter-pg` e `pg` no runtime da API.
- O projeto usa o lockfile da raiz do monorepo.
