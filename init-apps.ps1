# Script de instalação dos Apps (Frontend e Backend)

Write-Host "Instalando o Frontend (Next.js 16) em apps/web..." -ForegroundColor Cyan
Set-Location -Path "apps\web"
pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
pnpm add @tanstack/react-query react-hook-form zod @hookform/resolvers date-fns lucide-react
Set-Location -Path "..\.."

Write-Host "Instalando o Backend (Fastify) em apps/api..." -ForegroundColor Cyan
Set-Location -Path "apps\api"
if (!(Test-Path package.json)) { pnpm init }
pnpm add fastify @fastify/cors @fastify/env @fastify/jwt @fastify/swagger @fastify/swagger-ui zod
pnpm add prisma @prisma/client
pnpm add -D typescript tsx @types/node

Write-Host "Inicializando o Prisma..." -ForegroundColor Cyan
pnpm prisma init
Set-Location -Path "..\.."

Write-Host "✅ Fase 2 concluída com sucesso! (Responda 'sim' a qualquer pergunta do create-next-app caso precise)" -ForegroundColor Green
