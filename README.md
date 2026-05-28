# VPS Status

这个仓库已经搭好 Upptime 骨架，仓库名是 `vps-status`。

## 你后面主要改这几个地方

- `.upptimerc.yml`
- GitHub Secrets
- 仓库名和 GitHub Pages

## 当前状态

<!--live status--> **Unknown**

<!--start: status pages-->
<!-- 这里会由 Upptime 自动生成状态表 -->
<!--end: status pages-->

<!--start: docs-->
## 使用说明

1. 修改 `.upptimerc.yml` 里的 `owner`、`repo`、`baseUrl` 和 `sites`
2. 在 GitHub 仓库 Settings 里添加 `GH_PAT`
3. 再添加通知 Secret：
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
4. 打开 GitHub Pages
5. 手动跑一次 `Setup CI`
<!--end: docs-->
