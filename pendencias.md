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

---

## Melhorias de maps

**Status atual:**
- a tela `History` ja mostra mapa real com `MapTiler + MapLibre`
- o fluxo de localizacao foi melhorado com autocomplete
- ainda existem melhorias pendentes para a experiencia de mapa e qualidade geografica

**Pendencias mapeadas:**
- melhorar a precisao da geocodificacao dos locais salvos
- avaliar persistencia futura de coordenadas no banco para evitar geocodificacao repetida
- revisar UX do mapa na `History` para meses com muitos pontos
- avaliar mapa real tambem em `Day Details`
- tratar melhor locais ambiguos ou incompletos

**Proximo passo quando for retomar:**
1. revisar como os locais estao sendo salvos no fluxo real
2. decidir se coordenadas serao persistidas no banco
3. evoluir o mapa sem criar regressao no fluxo principal de lancamento
