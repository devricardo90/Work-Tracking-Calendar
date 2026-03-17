# Regras Operacionais do Projeto

## Ambiente

- Usar `pnpm` como gerenciador de pacotes do projeto.
- Usar `Node.js 24`.
- Para este projeto e projetos futuros com Prisma 7 + PostgreSQL, considerar como regra o uso de `@prisma/adapter-pg` e `pg` no runtime da API.

## Execucao

- Sempre registrar execucoes relevantes em `docs/execucao.md`.
- Sempre registrar erros relevantes em `docs/error.md`.
- Antes de executar uma etapa importante, carregar os `.md` de `docs/` para manter o contexto atualizado.

## Tratamento de erro

- Nao insistir varias vezes no mesmo erro.
- Se o mesmo tipo de erro bloquear a execucao mais de uma vez, parar, registrar em `docs/error.md` e pedir ajuda ao usuario.
- Se houver erro de sandbox, permissao ou restricao do ambiente, nao insistir em loops de tentativa.
- Nesses casos, registrar o bloqueio e pedir ao usuario que execute o comando necessario quando isso for mais eficiente.

## Colaboracao com o usuario

- Quando houver bloqueio por sandbox, permissao ou politica do ambiente, informar claramente:
  - o que falhou
  - por que isso bloqueia a etapa
  - qual comando o usuario pode executar
- Se for necessario pedir ajuda ao usuario, fazer isso de forma direta e objetiva.

## Prisma e banco

- Antes de executar etapas relacionadas a Prisma, banco de dados ou auth, ler `docs/seguranca.md`.
- Em Prisma 7 com PostgreSQL, lembrar que o client precisa de adapter em runtime.
- Regenerar o Prisma Client sempre que o schema mudar.
- Registrar migrations, ajustes de runtime e problemas de compatibilidade no arquivo de execucao correspondente.

## Regra de produto atual

- O MVP atual suporta apenas um registro por usuario por dia.
