# Upptime 需要改哪里

这个文件给你留一个修改清单，后面直接照着填。

## 1. `.upptimerc.yml`

- `owner`: 当前是 `aisuyi065`
- `repo`: 当前是 `vps-status`
- `user-agent`: 当前是 `aisuyi065`
- `sites`: 监控目标。真实 IP 不写在这里，只引用 GitHub Secrets
- `status-website.baseUrl`: 仓库名
- `status-website.cname`: 如果你有自定义域名再填

## 2. GitHub Secrets

先建这个必需项：

- `GH_PAT`

真实 VPS IP 不要写进 `.upptimerc.yml`。把完整监控 URL 写成 Secret：

- `VPS_IPV4_HTTP_URL`: IPv4 监控地址，例如 `http://192.0.2.10/health`
- `VPS_IPV6_HTTP_URL`: IPv6 监控地址，例如 `http://[2001:db8::10]/health`

如果 VPS 没有 `/health` 路径，可以先用根路径 `/`。如果是 HTTPS 直连 IP，证书可能因为域名不匹配失败；这种情况下优先用 HTTP 健康检查，或改用域名/反代健康检查。

建议再建通知项：

- `NOTIFICATION_TELEGRAM`
- `NOTIFICATION_TELEGRAM_BOT_KEY`
- `NOTIFICATION_TELEGRAM_CHAT_ID`
- `NOTIFICATION_EMAIL`
- `NOTIFICATION_EMAIL_FROM`
- `NOTIFICATION_EMAIL_TO`
- `NOTIFICATION_EMAIL_SMTP`
- `NOTIFICATION_EMAIL_SMTP_HOST`
- `NOTIFICATION_EMAIL_SMTP_PORT`
- `NOTIFICATION_EMAIL_SMTP_USERNAME`
- `NOTIFICATION_EMAIL_SMTP_PASSWORD`

## 3. GitHub Pages

- 仓库 Settings -> Pages
- 让 `Static Site CI` 负责部署

## 4. 常见修改点

- 想改检查频率，看 `.github/workflows/uptime.yml`
- 想改图表更新时间，看 `.github/workflows/graphs.yml`
- 想改状态页标题，看 `.upptimerc.yml`
