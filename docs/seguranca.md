# Worker Hours Tracker - Riscos e Seguranca

## Objetivo

Este documento consolida os principais riscos tecnicos, bugs provaveis e cuidados de seguranca do projeto Worker Hours Tracker, considerando a stack atual:

- Frontend: Next.js App Router, TypeScript, Tailwind, React Query, React Hook Form e Zod
- Backend: Fastify, TypeScript, Swagger e JWT
- ORM: Prisma
- Banco: PostgreSQL
- Infra local: Docker Compose

O foco esta nos riscos que mais costumam quebrar o produto ou gerar vulnerabilidades reais no fluxo de calendario, lancamentos diarios, resumo mensal, historico, perfil, PDF e envio por e-mail.

## Riscos prioritarios

1. Erros de data e timezone
2. Falha de isolamento entre usuarios
3. Race condition no lancamento diario
4. Autenticacao opcional mal definida
5. Validacao inconsistente entre frontend, API e banco
6. PDF ou e-mail com conteudo inseguro
7. Consultas de historico e resumo degradando performance
8. Divergencia de tipos entre Prisma Decimal, JSON e frontend
9. Swagger expondo detalhes sensiveis
10. Problemas de deploy, env e configuracao no monorepo

## Riscos funcionais

### Datas, calendario e timezone

Sintoma comum:
- usuario cria um lancamento para `2026-03-17`, mas o sistema mostra no dia anterior ou posterior

Causas provaveis:
- `workDate` salvo como `DateTime`
- parsing inconsistente entre backend e frontend
- uso de `new Date("2026-03-17")`
- timezone local diferente entre browser e servidor

Riscos:
- quebra da regra `@@unique([userId, workDate])`
- resumo mensal incorreto
- historico inconsistente

Recomendacoes:
- tratar `workDate` como data civil
- padronizar a regra ponta a ponta
- nao deixar frontend e backend inferirem timezone

### Race condition na criacao

Sintoma comum:
- duplo clique no botao salvar
- duas requisicoes simultaneas para o mesmo dia

Riscos:
- erro 500
- UX inconsistente
- conflito inesperado

Recomendacoes:
- manter a constraint unica no banco
- tratar erro de unique como `409 Conflict`
- bloquear submit duplicado no frontend

### Acesso cruzado entre usuarios

Risco critico:
- um usuario editar, excluir ou consultar dados de outro usuario

Pontos sensiveis:
- `PUT /entries/:id`
- `DELETE /entries/:id`
- `GET /history`
- `GET /summary/monthly`
- `GET /profile`

Recomendacoes:
- nunca aceitar `userId` vindo do client
- sempre cruzar ownership nas queries
- resolver `userId` pelo token

### Resumo mensal incorreto

Causas provaveis:
- filtro por mes calculado no frontend
- range de datas montado errado
- conversao incorreta de `Decimal`

Recomendacoes:
- centralizar calculo no backend
- usar regra fechada para inicio e fim do mes
- padronizar serializacao de `Decimal`

### Historico degradando ou retornando errado

Causas provaveis:
- filtros opcionais mal montados
- busca textual sem normalizacao
- falta de paginação
- indices insuficientes

Recomendacoes:
- paginação desde o MVP
- filtros explicitos
- revisar indices conforme as queries reais

## Falhas de seguranca principais

### Broken Access Control

Este e o risco mais importante do projeto.

Mitigacoes:
- todas as rotas privadas devem usar `userId` do token
- todas as queries devem filtrar por ownership
- nao confiar em `id` sozinho quando o recurso pertence a um usuario

### Autenticacao opcional mal modelada

Risco:
- parte da aplicacao assume usuario anonimo e parte assume identidade persistida

Direcao recomendada:
- ou MVP sem auth real
- ou MVP com auth consistente desde o inicio

Evitar:
- modelo hibrido sem fronteiras claras

### Validacao insuficiente de entrada

Campos criticos:
- `workDate`
- `hoursWorked`
- `location`
- `notes`
- `email`
- `language`

Regras recomendadas:
- `hoursWorked > 0`
- `hoursWorked <= 24`
- limites de tamanho para `location` e `notes`
- formato estrito para `workDate`

### XSS

Campos sensiveis:
- `notes`
- `location`
- `name`
- preview de PDF
- templates de e-mail

Mitigacoes:
- escapar conteudo
- evitar `dangerouslySetInnerHTML`
- sanitizar qualquer renderizacao HTML

### Swagger em producao

Riscos:
- exposicao desnecessaria de endpoints e contratos

Mitigacoes:
- proteger `/docs`
- ou desabilitar Swagger em producao
- nao expor exemplos com dados sensiveis

### JWT mal configurado

Problemas comuns:
- segredo fraco
- expiracao ausente
- politica de refresh inconsistente

Mitigacoes:
- segredo forte
- expiracao curta
- validacao centralizada

### Falta de rate limit

Rotas criticas:
- login
- registro
- geracao de PDF
- envio por e-mail
- filtros pesados de historico

Mitigacoes:
- rate limit por IP e por usuario
- cooldown para geracao e envio

### Exposicao de secrets

Riscos:
- `.env` commitado
- variaveis server expostas no client
- logs com secrets

Mitigacoes:
- separar env de server e client
- usar `.env.example`
- revisar logs

### Query injection indireta

Mesmo com Prisma, ainda existe risco ao:
- usar `queryRawUnsafe`
- montar ordenacao dinamica sem whitelist

Mitigacoes:
- evitar raw query sem necessidade
- whitelist de campos ordenaveis
- schema de entrada estrito

## Riscos por tecnologia

### Next.js

Problemas comuns:
- mistura incorreta de Server e Client Components
- cache errado
- hidratacao inconsistente

### React Query

Problemas comuns:
- query keys inconsistentes
- cache stale apos mutation
- invalidacao incompleta

### React Hook Form + Zod

Problemas comuns:
- frontend aceitando payload que o backend rejeita
- decimal chegando como string

### Fastify

Problemas comuns:
- hooks de auth aplicados de forma desigual
- tratamento de erro generico demais

Padrao recomendado de status:
- `400` validacao
- `401` autenticacao
- `403` autorizacao
- `404` nao encontrado
- `409` conflito
- `422` regra de negocio
- `500` erro interno

### Prisma

Problemas comuns:
- `Decimal` quebrando serializacao
- migrations divergentes entre ambientes
- constraint unica tratada como erro generico

### PostgreSQL

Problemas comuns:
- indices insuficientes
- comparacao errada de datas
- degradacao de listagens com o crescimento da tabela

### Docker Compose

Problemas comuns:
- porta ocupada
- banco subir depois da API
- volume antigo mascarando problemas de migration

## Riscos de modelagem

### Um registro por dia

Regra atual do MVP:
- um registro por usuario por dia
- uma localizacao principal por registro

Risco futuro:
- notas sendo usadas para representar multiplos locais no mesmo dia

Direcao:
- manter a regra simples agora
- documentar claramente a limitacao
- evoluir para blocos de trabalho apenas quando isso virar requisito real

### Campo `language`

Risco:
- string livre gera valores invalidos

Direcao:
- usar enum ou whitelist de idiomas

## Checklist de desenvolvimento seguro

### Dados e dominio
- definir uma estrategia unica para `workDate`
- nao misturar data civil com datetime arbitrario
- validar `hoursWorked`
- limitar `location` e `notes`
- documentar a regra de um registro por dia

### Seguranca
- nao confiar em `userId` do client
- garantir ownership em toda query
- proteger Swagger em producao
- aplicar rate limit
- proteger PDF e envio por e-mail

### Backend
- validar request e response
- tratar erro de unique como `409`
- centralizar auth e error handler
- nao expor stack trace

### Frontend
- bloquear multiplos submits
- invalidar cache corretamente
- nao duplicar regra critica no client
- tratar loading e error states

### Banco e Prisma
- revisar indices conforme as consultas reais
- padronizar `Decimal`
- versionar migrations com disciplina
- regenerar Prisma Client apos mudar o schema

### Infra
- separar env por ambiente
- garantir healthcheck do Postgres
- documentar bootstrap local

## Casos de teste obrigatorios

### Entries
- criar lancamento valido
- tentar criar duplicado no mesmo dia
- editar o proprio registro
- tentar editar registro de outro usuario
- excluir o proprio registro
- tentar excluir registro de outro usuario

### Datas
- criar registro no ultimo dia do mes
- navegar virada de mes
- validar timezone diferente

### Summary
- total de horas correto
- total de dias correto
- media correta
- mes sem dados

### History
- filtro por mes
- filtro por local
- filtro combinado
- paginacao

### Seguranca
- rota sem token
- token invalido
- acesso cruzado entre usuarios
- abuso de geracao de PDF

## Prioridade pratica

Critico:
- ownership por `userId`
- estrategia correta de `workDate`
- tratamento de conflito unico
- autenticacao e autorizacao consistentes

Alto:
- validacao forte
- rate limit
- protecao de PDF e e-mail
- controle de Swagger em producao

Medio:
- performance do historico
- padronizacao de `Decimal`
- observabilidade

## Conclusao

Os maiores riscos deste projeto nao estao na interface, mas em quatro pontos:

1. data e timezone
2. isolamento por usuario
3. conflito de criacao diaria
4. seguranca de exportacao e compartilhamento

Se esses pontos forem tratados desde a fundacao, o restante da stack tende a evoluir bem.
