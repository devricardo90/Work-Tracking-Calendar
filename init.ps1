# Script de inicialização do Monorepo Worker Hours

Write-Host "Criando diretórios do monorepo..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path apps\web | Out-Null
New-Item -ItemType Directory -Force -Path apps\api | Out-Null
New-Item -ItemType Directory -Force -Path packages\ui | Out-Null
New-Item -ItemType Directory -Force -Path packages\types | Out-Null
New-Item -ItemType Directory -Force -Path packages\config | Out-Null

Write-Host "Inicializando o package.json..." -ForegroundColor Cyan
if (!(Test-Path package.json)) {
    pnpm init
}

Write-Host "Instalando dependências base de desenvolvimento (Turbo, TypeScript, ESLint, Prettier)..." -ForegroundColor Cyan
# A flag -w assegura que as dependências sejam instaladas na raiz do workspace
pnpm add -D -w turbo typescript eslint prettier

Write-Host "Iniciando o banco de dados via Docker..." -ForegroundColor Cyan
docker compose up -d

Write-Host "✅ Fase 1 Base concluída!" -ForegroundColor Green
