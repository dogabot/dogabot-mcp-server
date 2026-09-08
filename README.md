# @dogabot/mcp

Official [MCP](https://modelcontextprotocol.io) for [dogabot](https://dogabot.com) — research markets, manage automations, run backtests, and place terminal orders from Cursor, Claude, and other AI clients.

**Product page:** [dogabot.com/mcp-server](https://dogabot.com/mcp-server)

Prefer the **hosted** endpoint `https://mcp.dogabot.com/mcp`. This npm package is an optional **stdio proxy** for clients that cannot use a URL transport.

## Prerequisites

- **Pro or Institutional** dogabot account
- For **OAuth MCP** (Cursor Needs login): enable **OAuth MCP access** under dogabot **MCP & API**
- For **API key** / stdio: API key from **MCP & API** (`dbk_live_...`)
- For the stdio package only: Node.js 20+

## Features

- **Hosted MCP** — connect with a URL; no Python/`uv` for Cursor
- **OAuth in Cursor** — Needs login without pasting keys into config
- **Automations** — list, create, start, stop, update, delete (scoped writes)
- **Terminal & exchange** — paper/live place & cancel, balances, positions, orders, trades, income
- **Backtests & markets** — enqueue/cancel backtests, candles, tickers, marketplace, correlation
- **Ask AI** — same assistant as the webapp (`write:ask_ai`)
- **Paper first** — prefer paper trading before enabling live write scopes

## Cursor (recommended) — OAuth

No API key in config. Enable OAuth MCP in dogabot **MCP & API**, then:

```json
{
  "mcpServers": {
    "dogabot": {
      "url": "https://mcp.dogabot.com/mcp"
    }
  }
}
```

Choose **Needs login** and approve dogabot. Do **not** paste a Clerk session JWT.

## Cursor — remote URL with API key

```json
{
  "mcpServers": {
    "dogabot": {
      "url": "https://mcp.dogabot.com/mcp",
      "headers": {
        "Authorization": "Bearer dbk_live_REPLACE_ME"
      }
    }
  }
}
```

Use a **dogabot API key**, not a Clerk session JWT.

## VS Code

Create `.vscode/mcp.json` (or user MCP settings) with a remote URL and Bearer header:

```json
{
  "servers": {
    "dogabot": {
      "type": "http",
      "url": "https://mcp.dogabot.com/mcp",
      "headers": {
        "Authorization": "Bearer dbk_live_REPLACE_ME"
      }
    }
  }
}
```

## Stdio package (optional)

Use `@dogabot/mcp` when your client only supports command/stdio MCP. By default it **proxies** to `https://mcp.dogabot.com/mcp` (override with `DOGABOT_MCP_URL`).

**Do not run `npx -y @dogabot/mcp` in a terminal to “install”.** The AI app launches it for you.

```json
{
  "mcpServers": {
    "dogabot": {
      "command": "npx",
      "args": ["-y", "@dogabot/mcp"],
      "env": {
        "DOGABOT_API_KEY": "dbk_live_REPLACE_ME"
      }
    }
  }
}
```

### Troubleshooting (Cursor)

- **Tools show up but every call times out** — toggle **dogabot** off/on under **Settings → Tools & MCP**, or **Developer: Reload Window**.
- **`DOGABOT_API_KEY is required`** — key missing from the `env` block; fix config and toggle again.

## Claude Desktop

Claude Desktop requires **strict JSON** (no comments, no `${env:…}` interpolation).

1. Copy the `dogabot` block from [`examples/claude-desktop-config.json`](examples/claude-desktop-config.json).
2. Paste into Claude Desktop config (macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`).
3. Replace `dbk_live_REPLACE_ME` and restart Claude Desktop.

## Claude Code

```bash
claude mcp add dogabot \
  --env DOGABOT_API_KEY=dbk_live_YOUR_KEY_HERE \
  -- npx -y @dogabot/mcp
```

## Environment variables

| Variable | Required | Default |
|----------|----------|---------|
| `DOGABOT_API_KEY` | Yes (stdio / API-key modes) | — |
| `DOGABOT_MCP_URL` | No | `https://mcp.dogabot.com/mcp` |

## Example prompts

1. Show my open paper terminal positions and buying power context.
2. List my running automations sorted by daily PnL.
3. Get the latest BTC ticker on Hyperliquid and 1h candles for the last day.
4. Place a small paper market buy on Aster for BTC — confirm before live.
5. Create a backtest for my strategy on ETH and tell me when quota is low.
6. Ask AI to summarize my account risk and propose a paper order I must confirm.

## Available tools

Hosted MCP exposes **57 tools** (same catalog as the Go server). Writes need matching scopes on your API key or OAuth profile.

### Account & portfolio

| Tool | Description |
|------|-------------|
| `get_me` | Current user profile, plan tier, and limits |
| `get_user_statistics` | Dashboard statistics and PnL history |
| `get_positions` | Aggregated open positions |
| `get_position` | Open position for one automation |
| `get_pnl_series` | Daily PnL series for an automation |
| `list_orders` | Order history for a follower or bot |
| `list_signals` | Latest signals for an emitter |

### Automations

| Tool | Description |
|------|-------------|
| `list_automations` | Automation summaries |
| `get_automation` | Single automation by type and id |
| `create_automation` | Create bot / follower / emitter / portfolio (`write:automation`) |
| `start_automation` | Start an automation (`write:lifecycle`) |
| `stop_automation` | Stop an automation (`write:lifecycle`) |
| `update_automation` | Update a stopped automation (`write:automation`) |
| `delete_automation` | Delete an automation (`write:automation`) |

### Credentials & tags

| Tool | Description |
|------|-------------|
| `list_credentials` | List exchange credentials (masked) |
| `create_credential` / `update_credential` / `set_default_credential` / `delete_credential` | Credential writes (`write:credentials`) |
| `list_tags` / `create_tag` / `update_tag` / `delete_tag` | Automation tags |

### Terminal

| Tool | Description |
|------|-------------|
| `list_terminal_orders` / `get_terminal_order` / `list_terminal_positions` | Terminal session reads |
| `list_terminal_emitters` | Emitters eligible for Leader broadcast |
| `get_terminal_symbol_rules` / `get_terminal_order_capabilities` | Venue rules and capabilities |
| `place_terminal_order` / `cancel_terminal_order` | Place/cancel (`write:terminal`; prefer paper) |

### Exchange (live venue)

| Tool | Description |
|------|-------------|
| `list_exchange_balances` | Live wallet snapshot |
| `list_exchange_positions` | Live futures/perp positions |
| `get_exchange_margin_summary` | Futures margin summary |
| `list_exchange_orders` / `list_exchange_trades` / `list_exchange_income` | Live venue history |
| `cancel_exchange_order` / `cancel_exchange_orders` | Cancel venue orders (`write:terminal`) |

### Backtests & markets

| Tool | Description |
|------|-------------|
| `get_backtest_quota` / `list_backtests` / `get_backtest` / `get_backtest_signals` | Backtest reads |
| `create_backtest` / `cancel_backtest` | Backtest writes (`write:backtest`) |
| `search_marketplace` / `list_markets` / `list_exchanges` | Discovery |
| `get_ticker` / `get_candles` / `get_symbol_correlation` | Market data |

### Ask AI

| Tool | Description |
|------|-------------|
| `create_ai_chat_conversation` / `ask_ai_chat` / `confirm_ai_chat_tool` | Chat + confirm writes (`write:ask_ai`) |
| `get_ai_chat_conversation` / `list_ai_chat_conversations` / `get_ai_chat_quota` | History and quota |

Full scope ↔ REST mapping: [docs.dogabot.com/mcp](https://docs.dogabot.com/mcp/).

## Security

Every request requires a valid **OAuth grant** or **scoped API key** — there is no anonymous access.

- **Authentication required** — invalid or missing credentials are rejected; failed attempts are rate-limited.
- **Per-key / per-user rate limits** — Pro is capped (e.g. 60 requests/minute per key); Institutional higher.
- **Writes are scoped** — terminal needs `write:terminal` (+ `feat:terminal`); backtests need `write:backtest` (+ institutional `feat:api:write` when required); automation create/update/delete need `write:automation`; start/stop need `write:lifecycle`; Ask AI needs `write:ask_ai`; credentials need `write:credentials`.
- **No exchange secrets over MCP reads** — credential secrets are write-only; connect exchanges in the webapp.
- **Prefer paper** — review every write the model proposes before live.
- **Never commit keys** — keep `DOGABOT_API_KEY` out of git.

## Related

- [MCP product page](https://dogabot.com/mcp-server)
- [API keys & MCP (Learn Center)](https://learn.dogabot.com/help/api-keys-and-mcp)
- [MCP tool catalog](https://docs.dogabot.com/mcp/)
- [GitHub repository](https://github.com/dogabot/dogabot-mcp-server)
