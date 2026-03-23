# Testes Manuais

Checklist operacional para validar a aplicação como app real.

## 1. Setup

1. Copiar `apps/api/.env.example` para `apps/api/.env`.
2. Copiar `apps/web/.env.example` para `apps/web/.env.local`.
3. Subir PostgreSQL com `docker compose up -d`.
4. Rodar migrations e Prisma generate em `apps/api`.
5. Iniciar API e Web.

## 2. Auth

1. Abrir `/login`.
2. Criar conta com email e senha válidos.
3. Confirmar redirecionamento para `/calendar`.
4. Fazer logout em `/profile`.
5. Tentar abrir `/calendar` sem sessão e confirmar redirecionamento para `/login`.
6. Se `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estiverem configurados, validar `Continue with Google`.

## 3. Entries

1. Em `/calendar`, abrir um dia sem registro.
2. Criar lançamento com horas, local e notas.
3. Confirmar retorno ao calendário com indicador no dia.
4. Abrir o detalhe do dia e validar horas, local, notas e ação de editar.
5. Editar o lançamento e confirmar atualização.
6. Tentar criar dois registros para a mesma data e validar erro de conflito.
7. Excluir o lançamento e confirmar retorno ao calendário sem o registro.

## 4. History

1. Criar lançamentos em datas e locais diferentes no mesmo mês.
2. Abrir `/history`.
3. Validar busca por data e por local.
4. Validar filtro por location.
5. Abrir um item da lista e confirmar navegação para `day-details`.
6. Se `NEXT_PUBLIC_MAPTILER_KEY` estiver configurada, validar mapa e autocomplete.

## 5. Profile

1. Abrir `/profile`.
2. Alterar nome e idioma.
3. Adicionar e remover locais salvos.
4. Salvar e confirmar persistência após recarregar a página.

## 6. Summary e Reports

1. Abrir `/summary` com lançamentos no mês.
2. Validar totais, média diária e lista de entradas.
3. Abrir `Preview PDF`.
4. Validar `Export as PDF`.
5. Se SMTP estiver configurado, validar `Send by Email`.
6. Se SMTP não estiver configurado, validar mensagem de indisponibilidade sem quebrar a tela.

## 7. Regressão visual rápida

1. Conferir navegação inferior em `calendar`, `history`, `summary` e `profile`.
2. Conferir CTA flutuante `Add Entry`.
3. Verificar estados de loading, vazio e erro nas telas principais.
4. Validar uso em viewport mobile estreita e desktop.
