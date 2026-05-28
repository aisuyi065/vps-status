# Setup

## 1. Add Secrets

Store each real IP as a GitHub Secret. Keep the repository public if you want, but do not place IPs in the repo.

- `HOST1_IPV4_IP` = `your-first-ipv4`
- `HOST1_IPV6_IP` = `your-first-ipv6`
- `HOST2_IPV4_IP` = `your-second-ipv4`

## 2. Add more endpoints later

1. Edit `monitor.targets.json`
2. Add a new target with a unique `slug`
3. Create the matching GitHub Secret
4. Push the change

## 3. How the workflow works

- GitHub Actions runs every 5 minutes
- `ping-monitor.mjs` reads the target list and secrets
- The script pings each raw IP using ICMP
- A static status page is generated and published to the `gh-pages` branch

## 4. What is shown publicly

- Alias / display name
- IPv4 or IPv6
- Up / Down status
- Response time
- Last checked time

The raw IP values remain in GitHub Secrets only.
