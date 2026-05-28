import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const configPath = new URL('../monitor.targets.json', import.meta.url);
const siteDir = new URL('../site/', import.meta.url);
const summaryPath = new URL('../site/status.json', import.meta.url);
const htmlPath = new URL('../site/index.html', import.meta.url);

const config = JSON.parse(await readFile(configPath, 'utf8'));
const secrets = parseSecrets(process.env.SECRETS_CONTEXT ?? '{}');
const generatedAt = new Date().toISOString();

const checks = [];
for (const target of config.targets ?? []) {
  checks.push(await pingTarget(target, secrets));
}

const summary = buildSummary(checks);
const payload = {
  generatedAt,
  title: config.title ?? 'Status',
  subtitle: config.subtitle ?? '',
  description: config.description ?? '',
  summary,
  checks
};

await mkdir(siteDir, { recursive: true });
await writeFile(summaryPath, JSON.stringify(payload, null, 2) + '\n');
await writeFile(htmlPath, renderHtml(payload), 'utf8');
await writeStepSummary(payload);

async function pingTarget(target, secretsMap) {
  if (!target || typeof target !== 'object') {
    throw new Error('Invalid target definition.');
  }

  const { name, slug, secret, family } = target;
  if (!name || !slug || !secret || ![4, 6].includes(family)) {
    throw new Error(`Invalid target config for ${slug ?? name ?? 'unknown target'}.`);
  }

  const value = secretsMap[secret];
  if (!value || typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing GitHub Secret: ${secret}`);
  }

  const address = value.trim();
  const startedAt = Date.now();
  const args = family === 6
    ? ['-6', '-n', '-c', '1', '-W', '2', address]
    : ['-4', '-n', '-c', '1', '-W', '2', address];

  try {
    await execFileAsync('ping', args, {
      encoding: 'utf8',
      timeout: 7000,
      maxBuffer: 1024 * 1024
    });

    return {
      name,
      slug,
      family,
      status: 'up',
      responseTimeMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      name,
      slug,
      family,
      status: 'down',
      responseTimeMs: null,
      checkedAt: new Date().toISOString(),
      exitCode: typeof error?.code === 'number' ? error.code : null
    };
  }
}

function buildSummary(checks) {
  const total = checks.length;
  const up = checks.filter((item) => item.status === 'up').length;
  const down = total - up;
  const avgResponseTimeMs = up
    ? Math.round(checks.filter((item) => item.responseTimeMs !== null)
      .reduce((acc, item) => acc + item.responseTimeMs, 0) / up)
    : null;

  return {
    total,
    up,
    down,
    avgResponseTimeMs,
    overallStatus: down === 0 ? 'operational' : 'degraded'
  };
}

function renderHtml(data) {
  const rows = data.checks.map(renderRow).join('');
  const summary = data.summary;

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="robots" content="noindex">
  <title>${escapeHtml(data.title)}</title>
  <style>
    :root {
      --bg: #08111f;
      --panel: rgba(15, 23, 42, 0.92);
      --panel-border: rgba(148, 163, 184, 0.16);
      --text: #e2e8f0;
      --muted: #94a3b8;
      --soft: #cbd5e1;
      --up: #22c55e;
      --down: #ef4444;
      --accent: #60a5fa;
      --shadow: 0 24px 80px rgba(2, 6, 23, 0.45);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at top left, rgba(96, 165, 250, 0.18), transparent 32%),
        radial-gradient(circle at top right, rgba(34, 197, 94, 0.14), transparent 24%),
        linear-gradient(180deg, #0b1220 0%, var(--bg) 100%);
      color: var(--text);
      font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif;
      letter-spacing: 0;
    }
    .wrap {
      max-width: 1100px;
      margin: 0 auto;
      padding: 40px 20px 56px;
    }
    .hero {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 24px;
    }
    .title {
      font-size: 54px;
      line-height: 1.02;
      margin: 0 0 10px;
      letter-spacing: 0;
    }
    .subtitle {
      margin: 0 0 8px;
      color: var(--soft);
      font-size: 16px;
      line-height: 1.6;
      max-width: 72ch;
    }
    .meta {
      color: var(--muted);
      font-size: 13px;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.74);
      border: 1px solid var(--panel-border);
      box-shadow: var(--shadow);
      white-space: nowrap;
      font-weight: 700;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: var(--up);
      box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.12);
    }
    .dot.down {
      background: var(--down);
      box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.12);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin: 24px 0;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--panel-border);
      border-radius: 18px;
      padding: 18px;
      box-shadow: var(--shadow);
    }
    .card-label {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0;
      margin-bottom: 10px;
    }
    .card-value {
      font-size: 30px;
      line-height: 1;
      font-weight: 800;
    }
    .card-value small {
      font-size: 14px;
      color: var(--muted);
      font-weight: 600;
    }
    .panel {
      background: var(--panel);
      border: 1px solid var(--panel-border);
      border-radius: 22px;
      overflow: hidden;
      box-shadow: var(--shadow);
    }
    .table {
      width: 100%;
      border-collapse: collapse;
    }
    .table thead th {
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0;
      color: var(--muted);
      padding: 18px 20px 14px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.12);
    }
    .table tbody td {
      padding: 18px 20px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.08);
      vertical-align: middle;
    }
    .table tbody tr:last-child td { border-bottom: none; }
    .endpoint {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .family {
      color: var(--muted);
      font-size: 13px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 13px;
      border: 1px solid transparent;
    }
    .badge.up {
      color: #b7f7cb;
      background: rgba(34, 197, 94, 0.12);
      border-color: rgba(34, 197, 94, 0.22);
    }
    .badge.down {
      color: #fecaca;
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.22);
    }
    .muted {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }
    .foot {
      margin-top: 18px;
      color: var(--muted);
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    @media (max-width: 840px) {
      .hero { flex-direction: column; }
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .title { font-size: 42px; }
      .table thead { display: none; }
      .table, .table tbody, .table tr, .table td { display: block; width: 100%; }
      .table tbody td { padding: 14px 20px; }
      .table tbody tr { border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
      .table tbody tr:last-child { border-bottom: none; }
      .table tbody td[data-label]::before {
        content: attr(data-label);
        display: block;
        color: var(--muted);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0;
        margin-bottom: 6px;
      }
    }
    @media (max-width: 560px) {
      .grid { grid-template-columns: 1fr; }
      .wrap { padding-inline: 14px; }
      .title { font-size: 32px; }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <section class="hero">
      <div>
        <h1 class="title">${escapeHtml(data.title)}</h1>
        <p class="subtitle">${escapeHtml(data.subtitle)}</p>
        <p class="subtitle" style="max-width: 78ch;">${escapeHtml(data.description)}</p>
        <div class="meta">Generated at ${escapeHtml(formatTime(data.generatedAt))}</div>
      </div>
      <div class="status-pill" aria-label="Overall status">
        <span class="dot ${summary.down > 0 ? 'down' : ''}"></span>
        ${summary.down > 0 ? 'Degraded' : 'Operational'}
      </div>
    </section>

    <section class="grid" aria-label="Summary metrics">
      <div class="card">
        <div class="card-label">Endpoints</div>
        <div class="card-value">${summary.total}</div>
      </div>
      <div class="card">
        <div class="card-label">Up</div>
        <div class="card-value" style="color: var(--up);">${summary.up}</div>
      </div>
      <div class="card">
        <div class="card-label">Down</div>
        <div class="card-value" style="color: ${summary.down > 0 ? 'var(--down)' : 'var(--soft)'};">${summary.down}</div>
      </div>
      <div class="card">
        <div class="card-label">Avg ping</div>
        <div class="card-value">${summary.avgResponseTimeMs ?? '—'} <small>ms</small></div>
      </div>
    </section>

    <section class="panel" aria-label="Endpoint statuses">
      <table class="table">
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Status</th>
            <th>Response</th>
            <th>Checked</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </section>

    <div class="foot">
      <span>Aliases and secret names stay in the repository. Raw IPs live only in GitHub Secrets.</span>
      <span><a href="./status.json" style="color: var(--accent); text-decoration: none;">status.json</a></span>
    </div>
  </main>
</body>
</html>`;
}

function renderRow(item) {
  const statusClass = item.status === 'up' ? 'up' : 'down';
  const statusText = item.status === 'up' ? 'Up' : 'Down';
  const response = item.responseTimeMs === null ? '—' : `${item.responseTimeMs} ms`;
  const checkedAt = formatTime(item.checkedAt);
  const familyLabel = item.family === 6 ? 'IPv6' : 'IPv4';

  return `<tr>
    <td data-label="Endpoint">
      <div class="endpoint">${escapeHtml(item.name)}</div>
      <div class="family">${familyLabel} · IP hidden in GitHub Secrets</div>
    </td>
    <td data-label="Status"><span class="badge ${statusClass}"><span class="dot ${statusClass === 'down' ? 'down' : ''}" style="width: 8px; height: 8px; box-shadow: none;"></span>${statusText}</span></td>
    <td data-label="Response">${escapeHtml(response)}</td>
    <td data-label="Checked">${escapeHtml(checkedAt)}</td>
  </tr>`;
}

async function writeStepSummary(data) {
  if (!process.env.GITHUB_STEP_SUMMARY) {
    return;
  }

  const summary = [
    `# VPS Status`,
    ``,
    `Generated at: ${formatTime(data.generatedAt)}`,
    ``,
    `| Endpoint | Status | Response | Checked |`,
    `| --- | --- | --- | --- |`,
    ...data.checks.map((item) => `| ${item.name} | ${item.status.toUpperCase()} | ${item.responseTimeMs ?? '—'} ms | ${formatTime(item.checkedAt)} |`)
  ].join('\n');

  await writeFile(process.env.GITHUB_STEP_SUMMARY, summary + '\n', 'utf8');
}

function parseSecrets(raw) {
  const parsed = JSON.parse(raw);
  return parsed && typeof parsed === 'object' ? parsed : {};
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatTime(value) {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      dateStyle: 'medium',
      timeStyle: 'medium',
      hour12: false,
      timeZone: 'Asia/Shanghai'
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}
