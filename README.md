# VPS Status

Bare IP monitoring with GitHub Actions and a static GitHub Pages status page.

## What it does

- Pings raw IPv4 and IPv6 addresses from GitHub Actions
- Keeps the IPs out of the public repository by reading them from GitHub Secrets
- Publishes a status page to GitHub Pages with your custom aliases

## Current targets

- `主机 1 IPv4`
- `主机 1 IPv6`
- `主机 2 IPv4`

## Edit here

- `monitor.targets.json`: add, rename, or remove monitored endpoints
- GitHub Secrets: store the real IPs under the secret names declared in `monitor.targets.json`
- `.github/workflows/monitor.yml`: schedule and publish logic

## GitHub Secrets

Create these secrets now:

- `HOST1_IPV4_IP`
- `HOST1_IPV6_IP`
- `HOST2_IPV4_IP`

To add another endpoint later, add a new target in `monitor.targets.json` and create the matching secret.

## Status page

The page is published to GitHub Pages from the `gh-pages` branch.
