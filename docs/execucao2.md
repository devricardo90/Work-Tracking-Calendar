# Diario de Execucao do Projeto - Continuacao 2

Continua a partir de `docs/execucao1.md`.

---

## Ponto de partida
**Data:** 18 de Marco de 2026

**Estado consolidado antes da proxima fase:**
- autenticacao real estabilizada com Better Auth
- rotas privadas protegidas por sessao
- validacao forte aplicada em `login`, `profile` e `entries/new`
- tratamento de erros padronizado
- rate limit ativo nas rotas de auth
- fase `Reports` concluida com:
  - exportacao mensal em PDF
  - preview dedicado de PDF
  - envio do relatorio por e-mail

**Regra de continuidade adotada:**
- novos passos passam a ser registrados neste arquivo para evitar crescimento excessivo de `docs/execucao1.md`

**Proxima direcao planejada:**
- retomar a fase de hardening mais ampla do projeto

---

## Passo 41: Hardening operacional de docs, env e reports
**Data:** 18 de Marco de 2026

**Objetivo:**
- iniciar a continuacao da fase de hardening alem de auth e formularios
- reduzir exposicao indevida de docs em producao
- melhorar o bootstrap seguro do ambiente
- limitar abuso das rotas de relatorio

**Precondicao seguida:**
1. releitura de `docs/seguranca.md` com foco em:
   - Swagger em producao
   - exposicao de secrets
   - cooldown para geracao de PDF e envio por e-mail

**Alteracoes realizadas no backend:**
1. Atualizacao de `apps/api/src/config.ts` com `API_DOCS_ENABLED`
2. Atualizacao de `apps/api/src/app.ts` para habilitar docs apenas quando permitido pela configuracao
3. Criacao de `apps/api/src/lib/report-rate-limit.ts`
4. Atualizacao de `apps/api/src/lib/http-errors.ts` com tratamento `429` para abuso de reports
5. Atualizacao de `apps/api/src/modules/reports/report.routes.ts` com limitacao por usuario para:
   - geracao de PDF
   - envio por e-mail

**Alteracoes realizadas na configuracao do projeto:**
1. Criacao de `apps/api/.env.example`
2. Atualizacao de `README.md` com passo explicito para copiar `.env.example` para `.env`

**Comportamento implementado:**
- docs da API deixam de ser expostos automaticamente em producao
- o bootstrap local da API passa a ter um arquivo de exemplo de ambiente
- as rotas de reports passam a responder `429` quando houver abuso:
  - PDF mensal com limite mais alto
  - envio por e-mail com limite mais restrito

**Validacao executada:**
1. `pnpm.cmd typecheck` em `apps/api`
2. `pnpm.cmd build` em `apps/api`

---

## Passo 43: Persistencia de coordenadas de maps nas entradas
**Data:** 18 de Marco de 2026

**Objetivo:**
- deixar o mapa menos dependente de geocodificacao em tempo de render
- persistir latitude e longitude no banco junto com cada `WorkEntry`
- preparar a base para evolucao futura de maps com mais performance e confiabilidade

**Precondicao seguida:**
1. releitura de `docs/regras.md`
2. releitura de `docs/seguranca.md`
3. validacao da regra operacional de Prisma 7 + PostgreSQL antes de alterar schema

**Alteracoes realizadas no banco e backend:**
1. Atualizacao de `apps/api/prisma/schema.prisma`
   - adicao de `latitude` e `longitude` em `WorkEntry`
2. Atualizacao de `apps/api/src/modules/entries/entry.schemas.ts`
   - payload de entrada passa a aceitar coordenadas opcionais
3. Atualizacao de `apps/api/src/modules/entries/entry.service.ts`
   - create/update passam a persistir as coordenadas
   - list/get passam a devolver `latitude` e `longitude`
4. Execucao de:
   - `pnpm.cmd exec prisma generate`
   - `pnpm.cmd exec prisma db push`

**Alteracoes realizadas no frontend:**
1. Atualizacao de `apps/web/src/lib/entries.ts`
   - `Entry` e `EntryPayload` passam a carregar coordenadas
2. Atualizacao de `apps/web/src/app/entries/new/page.tsx`
   - ao salvar ou editar entrada, o frontend tenta geocodificar o local e enviar as coordenadas para a API
3. Atualizacao de `apps/web/src/components/history-map.tsx`
   - o mapa passa a preferir coordenadas persistidas no banco antes de geocodificar novamente
4. Atualizacao de `apps/web/src/lib/maptiler.ts`
   - cache simples de geocodificacao no client

**Comportamento implementado:**
- novas entradas passam a salvar `latitude` e `longitude` quando a localizacao puder ser resolvida
- entradas editadas passam a atualizar as coordenadas quando o local mudar
- `History` e `Day Details` reaproveitam o dado persistido quando ele ja existir
- a geocodificacao em runtime deixa de ser o unico caminho para desenhar os pontos

**Validacao executada:**
1. `pnpm.cmd exec prisma generate`
2. `pnpm.cmd exec prisma db push`
3. `pnpm.cmd typecheck` em `apps/api`
4. `pnpm.cmd build` em `apps/api`
5. `pnpm.cmd lint` em `apps/web`
3. `pnpm.cmd lint` em `apps/web`

---

## Passo 42: Hardening de logs e erro global da API
**Data:** 18 de Marco de 2026

**Objetivo:**
- reduzir exposicao de dados sensiveis em logs da API
- garantir resposta generica quando um erro escapar das rotas tratadas manualmente

**Alteracoes realizadas no backend:**
1. Atualizacao de `apps/api/src/app.ts`
2. Configuracao de redaction no logger do Fastify para:
   - `authorization`
   - `cookie`
   - `set-cookie`
   - campos sensiveis de body como `password`, `token` e similares
3. Adicao de `setErrorHandler` global com resposta padronizada `500`

**Comportamento implementado:**
- logs passam a ocultar credenciais e cookies sensiveis
- erros nao capturados por handlers especificos deixam de vazar detalhe acidental ao cliente
- a API responde `INTERNAL_SERVER_ERROR` de forma consistente nesses casos

**Validacao executada:**
1. `pnpm.cmd typecheck` em `apps/api`
2. `pnpm.cmd build` em `apps/api`
