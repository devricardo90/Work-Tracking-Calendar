# Erros Conhecidos e Soluções

Referência rápida de erros encontrados durante o desenvolvimento. Consulte antes de debugar.

---

## ERR-01 — Docker: Porta já alocada

**Erro:**
```
Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Causa:** Outro processo (geralmente um PostgreSQL local instalado diretamente no Windows) já está usando a porta.

**Solução:** Alterar a porta do host no `docker-compose.yml` e no `apps/api/.env` para uma porta livre.

```yaml
# docker-compose.yml
ports:
  - "5499:5432"  # formato host:container
```

```env
# apps/api/.env
DATABASE_URL="postgresql://postgres:postgres@localhost:5499/worker_hours"
```

Para verificar quais portas estão ocupadas:
```powershell
netstat -ano | findstr ":54"
```

---

## ERR-02 — Docker: Engine não está rodando

**Erro:**
```
error during connect: [...] The system cannot find the file specified
```

**Causa:** O Docker Desktop não está aberto/iniciado.

**Solução:** Abrir o aplicativo Docker Desktop no Windows e aguardar o ícone ficar estável antes de rodar o `docker compose up -d`.

---

## ERR-03 — Prisma 7: `url` não é mais suportado no schema.prisma

**Erro:**
```
Error code: P1012
error: The datasource property `url` is no longer supported in schema files.
```

**Causa:** O Prisma 7 removeu o suporte a `url` dentro do `schema.prisma`. A configuração da URL de conexão agora fica exclusivamente no `prisma.config.ts`.

**Solução:**

Remover o bloco `datasource` do `schema.prisma`:
```diff
- datasource db {
-   provider = "postgresql"
-   url      = env("DATABASE_URL")
- }
```

E garantir que o `prisma.config.ts` contém a configuração correta:
```ts
// apps/api/prisma.config.ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

---

## ERR-04 — Docker: Atributo `version` obsoleto

**Aviso:**
```
the attribute `version` is obsolete, it will be ignored
```

**Causa:** O atributo `version` no topo do `docker-compose.yml` foi depreciado nas versões recentes do Docker Compose.

**Solução:** Remover a linha `version:` do `docker-compose.yml`. O arquivo funciona sem ela.

```diff
- version: "3.9"

 services:
   postgres:
```

---

## ERR-05 — pnpm: ENOTFOUND registry.npmjs.org

**Erro:**
```
ERR_PNPM_META_FETCH_FAIL GET https://registry.npmjs.org/...: getaddrinfo ENOTFOUND
```

**Causa:** Falha temporária de rede ou DNS. O pnpm tenta novamente automaticamente.

**Solução:** Aguardar as tentativas automáticas (`Will retry in 10 seconds`). Se persistir, verificar a conexão com a internet e tentar novamente.

---

## ERR-06 — Prisma schema duplicado após edição manual

**Erro:**
```
The model "SavedLocation" cannot be defined because a model with that name already exists.
```

**Causa:** Edição incorreta do `schema.prisma` resultou em models duplicados no arquivo.

**Solução:** Sobrescrever completamente o arquivo `schema.prisma` com o conteúdo correto e único.

---

## ERR-07 — Prisma 7: `@db.Decimal` não suportado / "Default connector"

**Erro:**
```
Error code: P1012
Field `hoursWorked` can't be of type Decimal. The current connector does not support the Decimal type.
Native type Decimal is not supported for Default connector.
```

**Causa:** No Prisma 7, remover completamente o bloco `datasource` do `schema.prisma` faz o Prisma usar um "conector padrão" que não conhece tipos nativos do PostgreSQL (`@db.Decimal`, etc).

**Comportamento correto no Prisma 7:**
- A `url` de conexão vai para `prisma.config.ts` ✅
- O `provider` ainda precisa estar no `schema.prisma` ✅

**Solução — `schema.prisma` correto para Prisma 7:**
```prisma
datasource db {
  provider = "postgresql"
  // sem url aqui! ela fica em prisma.config.ts
}
```

**`prisma.config.ts` correto:**
```ts
export default defineConfig({
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

---

## ERR-08 — Docker: `postgres:18` reiniciando com volume antigo

**Erro:**
```
Error: in 18+, these Docker images are configured to store database data in a
format which is compatible with "pg_ctlcluster"
```

**Causa:** A imagem `postgres:18` mudou o layout esperado de armazenamento e entrou em conflito com o volume local já existente.

**Solução adotada no projeto:** usar `postgres:17` no `docker-compose.yml` para manter compatibilidade com o volume atual do ambiente local.

---

## ERR-09 — `tsx` / `esbuild`: `spawn EPERM` ao iniciar a API

**Erro:**
```text
Error: spawn EPERM
```

**Causa:** Neste ambiente, o runtime do `tsx` depende de um fluxo do `esbuild` que falhou ao tentar abrir subprocesso.

**Solução adotada no projeto:** usar `tsc` para gerar `dist/` e iniciar a API com `node dist/src/server.js`.

---

## ERR-10 — Prisma 7: client exige driver adapter em runtime

**Erro:**
```text
PrismaClientInitializationError: PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions
```

**Causa:** No Prisma 7, o client local usado neste projeto exige adapter de banco em runtime.

**Solução adotada no projeto:**
- instalar `@prisma/adapter-pg` e `pg`
- criar o Prisma client com `PrismaPg`

---

## ERR-11 — Busca recursiva em `node_modules` falhando no sandbox

**Erro:**
```text
Get-ChildItem -Recurse ...
DirectoryNotFoundException
```

**Causa:** Busca recursiva ampla atingiu caminhos temporários/internos do sandbox dentro de `node_modules`.

**Solução adotada no projeto:**
- preferir `rg --files` e buscas direcionadas
- evitar `Get-ChildItem -Recurse` amplo na raiz quando houver `node_modules`

---

## ERR-12 — Tipagem do `@fastify/swagger` sem `exposeRoute` no shape usado

**Erro:**
```text
Object literal may only specify known properties, and 'exposeRoute' does not exist
```

**Causa:** A configuração tentada para expor o JSON do OpenAPI não correspondia ao shape tipado disponível nesta versão do `@fastify/swagger`.

**Solução adotada no projeto:**
- deixar o `@scalar/fastify-api-reference` consumir o OpenAPI direto do `@fastify/swagger`
- usar os endpoints expostos pelo próprio Scalar em `/docs/api/openapi.json`

---

## ERR-13 — Build da web bloqueado por fetch de Google Fonts no sandbox

**Erro:**
```text
next/font: error:
Failed to fetch `Geist` from Google Fonts.
```

**Causa:** O build do Next tentou baixar as fontes `Geist` e `Geist Mono` da Google Fonts, mas o ambiente atual não permitiu a conexão externa necessária.

**Solução adotada no projeto:**
- não insistir repetidamente nesse build no sandbox
- registrar o bloqueio
- se necessário, substituir `next/font/google` por uma estratégia local ou pedir ao usuário para executar o build fora da restrição

---

## ERR-14 — Build da web bloqueado por `spawn EPERM` após compilação inicial

**Erro:**
```text
Error: spawn EPERM
```

**Causa:** Após remover o bloqueio de Google Fonts, o `next build` avançou até a etapa de TypeScript, mas o ambiente atual bloqueou a abertura de subprocesso necessária nessa fase.

**Solução adotada no projeto:**
- não insistir repetidamente no mesmo build dentro do sandbox
- considerar executar o build manualmente fora da restrição do ambiente, se necessário
- manter `lint` e validações locais complementares enquanto isso

---

## ERR-15 — Git push bloqueado por `dubious ownership`

**Erro:**
```text
fatal: detected dubious ownership in repository
```

**Causa:** O repositório foi criado dentro do ambiente de sandbox e o Git local exigiu marcar a pasta como segura para permitir operações de push.

**Solução adotada no projeto:**
- adicionar `safe.directory` para `C:/Users/ricardodev/Desktop/calendar-project`
- repetir o push apenas uma vez após essa correção

---

## 17 de Marco de 2026 - Better Auth e Prisma no ambiente atual

### Problemas encontrados
- `pnpm.cmd add ...` falhou inicialmente com `EPERM` no sandbox ao escrever arquivos temporarios do workspace.
- `pnpm.cmd exec prisma generate` falhou inicialmente com `EPERM` ao criar `.prisma` em `node_modules`.
- `pnpm.cmd exec better-auth generate` nao encontrou a config automaticamente; foi necessario usar `--config auth.js`.
- `pnpm.cmd exec prisma migrate dev --name auth_init` nao pode ser usado neste ambiente porque o comando e interativo e o terminal atual e nao-interativo.
- O schema gerado pelo Better Auth adicionou `@@map("user")` em `User`, o que faria o Prisma tentar dropar a tabela `User` existente.

### Decisoes aplicadas
- Escalar a instalacao e o `prisma generate` quando o sandbox bloqueou subprocessos/escrita.
- Usar `auth.js` como arquivo de configuracao do Better Auth para o CLI.
- Executar `pnpm.cmd exec better-auth generate --config auth.js --yes`.
- Remover `@@map("user")` do model `User` antes de sincronizar o banco.
- Usar `pnpm.cmd exec prisma db push --accept-data-loss` em vez de `migrate dev` para concluir a fase de auth neste ambiente.

---

## ERR-16 - Better Auth travando login por incompatibilidade entre tabela `User` e `user`

**Erro observado em 18 de Marco de 2026:**
```text
POST /api/auth/sign-in/email
```
ficava pendurado sem resposta no fluxo real da web, e em validacoes locais o adapter tambem apontou incompatibilidade com a tabela `public.user`.

**Causa composta encontrada:**
- o banco ficou com a tabela `"User"` maiuscula, enquanto o Better Auth com Prisma adapter passou a resolver o model para `public.user`
- o handler Node do Better Auth recebia `request.raw` do Fastify sem o `body` parseado anexado, e o `POST` de login ficava aguardando um stream de body que o Fastify ja havia consumido
- `auth.ts` podia ser carregado antes do `.env` local, deixando a inicializacao do auth dependente de defaults indevidos

**Solucao adotada no projeto:**
- alinhar o model `User` com `@@map("user")` no Prisma quando a estrutura real do Better Auth exigir esse nome fisico
- alinhar o banco ao nome fisico esperado pelo auth antes de depurar login ou sessao
- garantir que `apps/api/auth.ts` carregue o `.env` local antes de ler `process.env`
- ao integrar Better Auth com Fastify via `toNodeHandler`, anexar `request.body` em `request.raw` antes de chamar o handler
- sempre revalidar login real com `POST /api/auth/sign-in/email` e leitura de sessao apos qualquer ajuste de schema/auth

**Regra operacional derivada:**
- em etapas de Prisma/Auth, nao assumir que a decisao anterior sobre `@@map("user")` continua valida
- validar sempre em conjunto:
  - `schema.prisma`
  - nome fisico das tabelas no Postgres
  - comportamento real do Better Auth adapter
- registrar qualquer divergencia de mapeamento ou runtime em `docs/error.md` e `docs/execucao1.md`
