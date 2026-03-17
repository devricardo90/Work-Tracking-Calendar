# Product Requirements Document (PRD)

## 1. Visao do Produto
O **Worker Hours Tracker** e uma aplicacao web responsiva para registrar horas trabalhadas, locais e observacoes. O foco e simplicidade no lancamento e utilidade no acompanhamento mensal.

## 2. Persona
Trabalhadores autonomos, tecnicos de campo e prestadores de servico que precisam consolidar horas de multiplos locais para faturamento ou controle.

## 3. Escopo do MVP
- Calendario mensal com indicadores visuais.
- CRUD de lancamentos diarios (Hours Worked, Location, Notes).
- Resumo mensal (Totais e Medias).
- Historico pesquisavel por data e local.
- Perfil de usuario com locais salvos.
- Exportacao de relatorio em PDF e compartilhamento por e-mail.
- Documentacao da API com Swagger/Scalar.

## 4. Requisitos Funcionais (Highlights)
- **RF01:** Calendario com navegacao e marcacao de registros.
- **RF02:** Registro de data, horas, local e notas.
- **RF04:** Calculo automatico de total mensal e media diaria.
- **RF06:** Geracao de PDF com nome do trabalhador, periodo e tabela de entradas.
- **RF08:** Opcao de envio de relatorio por e-mail.

## 5. Modelo de Dados (Prisma Schema)
```prisma
model User {
  id               String          @id @default(cuid())
  name             String
  email            String          @unique
  passwordHash     String?
  defaultWorkHours Decimal?        @db.Decimal(5,2)
  language         String          @default("en")
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
  entries          WorkEntry[]
  savedLocations   SavedLocation[]
}

model SavedLocation {
  id        String   @id @default(cuid())
  userId    String
  name      String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model WorkEntry {
  id          String   @id @default(cuid())
  userId      String
  workDate    DateTime
  hoursWorked Decimal  @db.Decimal(5,2)
  location    String
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, workDate])
  @@index([userId, workDate])
}
```

**Regra atual do MVP:** apenas um registro por usuario em cada dia. Suporte formal a multiplos locais no mesmo dia fica para evolucao futura do dominio.

## 6. Fases de Execucao
1. **Foundation:** Monorepo, Turborepo, Docker/Postgres, Prisma Init, Fastify/Next.js scaffolds.
2. **Core Domain:** Migrations, API de Entradas, Tela de Calendario e Formularios.
3. **Value MVP:** Resumo mensal, Historico e Perfil.
4. **Reports:** Geracao e Preview de PDF.
5. **Hardening:** Auth, validacao com Zod, logs e deploy.

## 7. Planejamento Tatico Atual
- Auth e ownership por sessao ja estao em andamento na API e no frontend.
- A validacao com `Zod` no frontend deve ser adicionada no momento de endurecer os formularios com `react-hook-form`, para alinhar UI e API sem retrabalho precoce.
- Prioridade sugerida para essa etapa:
  - proteger rotas autenticadas no frontend
  - estabilizar sessao e fluxo real do usuario
  - depois adicionar `Zod` nos formularios de login, profile e entries
