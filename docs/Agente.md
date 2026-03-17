# Project Architecture & Stack (Agente Context)

## 1. Stack Recomendada
- **Monorepo:** pnpm workspaces + Turborepo
- **Frontend:** Next.js 16.1.7, React 19, Tailwind CSS 4, shadcn/ui, TanStack Query
- **Backend:** Fastify 5.8.2, TypeScript, Prisma ORM 7.4, Zod
- **Database:** PostgreSQL 17 (Docker)

## 2. Estrutura do Monorepo
```text
worker-hours-app/
├── apps/
│   ├── web/          # Frontend Next.js
│   └── api/          # Backend Fastify
├── packages/
│   ├── ui/           # Shared components
│   ├── config/       # Shared configs (ESLint, TS, Prettier)
│   └── types/        # Shared types and contracts
├── pnpm-workspace.yaml
└── turbo.json
```

## 3. Versões Fixas (2026 Strategy)
- **Node.js:** 24.14.0 LTS
- **pnpm:** 10.26+
- **Next.js:** 16.1.7
- **Fastify:** 5.8.2
- **Prisma:** 7.4.x
- **PostgreSQL:** 17.x

## 4. Plano de Configuração Inicial

### Passo 1: Inicialização do Workspace
1. Criar diretório raiz.
2. `pnpm init`
3. Configurar `pnpm-workspace.yaml` e `turbo.json`.

### Passo 2: Frontend (apps/web)
- `pnpm create next-app@latest .`
- Dependências: `@tanstack/react-query`, `react-hook-form`, `zod`, `date-fns`, `lucide-react`.

### Passo 3: Backend (apps/api)
- Fastify com plugins: `@fastify/cors`, `@fastify/jwt`, `@fastify/swagger`, `@fastify/swagger-ui`.
- `prisma init`.

### Passo 4: Infraestrutura (Docker)
- `docker-compose.yml` com Postgres 17.

## 5. Próximos Passos Técnicos
1. Executar comandos de inicialização do workspace.
2. Configurar o `docker-compose.yml`.
3. Validar conexão com Prisma.
