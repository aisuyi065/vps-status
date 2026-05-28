# Upptime 需要改哪里

这个文件给你留一个修改清单，后面直接照着填。

## 1. `.upptimerc.yml`

- `owner`: 当前是 `aisuyi065`
- `repo`: 当前是 `vps-status`
- `user-agent`: 当前是 `aisuyi065`
- `sites`: 监控目标。现在用 `icmp-ping`，所以只放 IP，不放 HTTP 路径。前端显示名写在 `name` 字段里
- `status-website.baseUrl`: 仓库名
- `status-website.cname`: 如果你有自定义域名再填

## 2. GitHub Secrets

先建这个必需项：

- `GH_PAT`

真实 VPS IP 不要写进 `.upptimerc.yml`。把 IP 写成 Secret：

- `HOST1_IPV4_IP`: IPv4 地址，例如 `192.0.2.10`
- `HOST1_IPV6_IP`: IPv6 地址，例如 `2001:db8::10`
- `HOST2_IPV4_IP`: IPv4 地址，例如 `198.51.100.20`

如果你想只判断“机器是否活着”，这种 ping 方式最合适。它不会检查 HTTP 服务是否正常，只检查 IP 连通性。

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
