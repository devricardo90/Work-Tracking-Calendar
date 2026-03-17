# Product Requirements Document (PRD)

## 1. Visão do Produto
O **Worker Hours Tracker** é uma aplicação web responsiva para registrar horas trabalhadas, locais e observações. Foco em simplicidade (agendamento em < 30s) e utilidade (relatórios PDF profissionais).

## 2. Persona
Trabalhadores autônomos, técnicos de campo e prestadores de serviço que precisam consolidar horas de múltiplos locais para faturamento ou controle.

## 3. Escopo do MVP
- Calendário mensal com indicadores visuais.
- CRUD de lançamentos diários (Hours Worked, Location, Notes).
- Resumo mensal (Totais e Médias).
- Histórico pesquisável por data e local.
- Perfil de usuário com locais salvos.
- Exportação de relatório em PDF e compartilhamento por e-mail.
- Documentação da API com Swagger.

## 4. Requisitos Funcionais (Highlights)
- **RF01:** Calendário com navegação e marcação de registros.
- **RF02:** Registro de data, horas, local e notas.
- **RF04:** Cálculo automático de total mensal e média diária.
- **RF06:** Geração de PDF com nome do trabalhador, período e tabela de entradas.
- **RF08:** Opção de envio de relatório por e-mail.

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

**Regra atual do MVP:** apenas um registro por usuário em cada dia. Suporte formal a múltiplos locais no mesmo dia fica para evolução futura do domínio.

## 6. Fases de Execução
1. **Foundation:** Monorepo, Turborepo, Docker/Postgres, Prisma Init, Fastify/Next.js scaffolds.
2. **Core Domain:** Migrations, API de Entradas, Tela de Calendário e Formulários.
3. **Value MVP:** Resumo mensal, Histórico e Perfil.
4. **Reports:** Geração e Preview de PDF.
5. **Hardening:** Auth, Validação (Zod), Logs e Deploy.
