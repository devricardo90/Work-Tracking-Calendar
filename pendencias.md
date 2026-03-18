# Pendencias do Projeto

Registro das pendencias abertas para execucao posterior.

---

## Email de relatorios

**Status atual:**
- o fluxo de envio do relatorio mensal por e-mail ja foi implementado no codigo
- o envio real ainda nao esta operacional neste ambiente porque faltam variaveis SMTP no `apps/api/.env`

**Variaveis pendentes no `.env`:**
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER` (quando o provedor exigir autenticacao)
- `SMTP_PASS` (quando o provedor exigir autenticacao)
- `SMTP_FROM`

**Impacto atual:**
- `POST /reports/monthly/email` responde que o email nao esta configurado
- o botao `Send by Email` da tela `/summary` ainda nao conclui envio real sem essas configuracoes

**Proximo passo quando for retomar:**
1. preencher as variaveis SMTP em `apps/api/.env`
2. reiniciar a API
3. testar o envio real pela tela `/summary`
