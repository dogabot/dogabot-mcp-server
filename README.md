# @dogabot/mcp

MCP (Model Context Protocol) for [dogabot](https://dogabot.com). Prefer the **hosted** endpoint; this npm package is an optional stdio proxy for clients that cannot use a URL transport.

## Prerequisites

- **Pro or Institutional** dogabot account
- API key from **Settings → API Keys** (`dbk_live_...`)
- For the stdio package only: Node.js 20+

## Cursor (recommended) — remote URL

No Node process required. Create an API key, then:

```json
{
  "mcpServers": {
    "dogabot": {
      "url": "https://api.dogabot.com/mcp",
      "headers": {
        "Authorization": "Bearer dbk_live_REPLACE_ME"
      }
    }
  }
}
```

Use a **dogabot API key**, not a Clerk session JWT. Enable the server under **Settings → Tools & MCP**.

## Stdio package (optional)

Use `@dogabot/mcp` when your client only supports command/stdio MCP. By default it **proxies** to `https://api.dogabot.com/mcp` (override with `DOGABOT_MCP_URL`).

**Do not run `npx -y @dogabot/mcp` in a terminal to “install”.** The AI app launches it for you.

1. Copy [`examples/cursor-mcp.json`](examples/cursor-mcp.json) into `.cursor/mcp.json` (merge with existing `mcpServers` if needed).
2. Replace `dbk_live_REPLACE_ME` with your API key.
3. Reload Cursor and enable **dogabot**.

Example:

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

- **Tools show up but every call times out** — Cursor sometimes keeps a stale “connected” session after sleep or a long day. Open **Settings → Tools & MCP**, turn **dogabot** off, wait a few seconds, turn it on again (or use **Developer: Reload Window**).
- **`DOGABOT_API_KEY is required` in the MCP log** — the key is missing from the `env` block (or `envFile`). Fix the config and toggle the server again.

## Claude Desktop

Claude Desktop requires **strict JSON** (no comments, no `${env:…}` interpolation).

1. Copy the `dogabot` block from [`examples/claude-desktop-config.json`](examples/claude-desktop-config.json).
2. Paste into your Claude Desktop config:
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
3. Replace `dbk_live_REPLACE_ME` with your API key.
4. Restart Claude Desktop.

## Claude Code

```bash
claude mcp add dogabot \
  --env DOGABOT_API_KEY=dbk_live_YOUR_KEY_HERE \
  -- npx -y @dogabot/mcp
```

That registers the server with Claude Code (it launches `npx` for you). You still should not run `npx -y @dogabot/mcp` yourself to “test install”.

## Environment variables

| Variable | Required | Default |
|----------|----------|---------|
| `DOGABOT_API_KEY` | Yes | — |
| `DOGABOT_MCP_URL` | No | `https://api.dogabot.com/mcp` |
| `DOGABOT_MCP_EMBEDDED` | No | unset (proxy mode). Set `1` for legacy in-process REST bridge. |

## Tools (v1 — read only)

| Tool | Description |
|------|-------------|
| `get_me` | Current user profile |
| `list_automations` | Automations summary (sort/filter; optional `enabled_rule`) |
| `get_automation` | Single automation detail (config) |
| `get_pnl_series` | Daily PnL series (`period` 7d/30d/90d/all) |
| `get_position` | Open position for one automation |
| `get_user_statistics` | Account statistics |
| `get_positions` | Open positions |
| `list_orders` | Order history (`follower_id` or `bot_id`) |
| `list_signals` | Emitter signal history (`emitter_id`) |
| `get_backtest_quota` | Backtest quota |
| `list_backtests` | Backtest results (sort/filter; optional `enabled_rule`) |
| `get_backtest` | Single backtest detail |
| `search_marketplace` | Marketplace search |
| `list_markets` | Markets list |
| `get_ticker` | Ticker snapshot |
| `get_candles` | OHLCV history |

Write tools are **not** registered in v1.

## Security

Every request requires a valid **scoped API key** — there is no anonymous access. dogabot enforces this on the server, not only in the MCP client.

- **Authentication required** — invalid or missing keys are rejected; failed attempts are rate-limited.
- **Per-key rate limits** — Pro keys are capped (60 requests/minute per key); institutional keys have higher limits.
- **Read-only on Pro** — MCP v1 exposes read tools only; agents cannot start, stop, or change automations via MCP.
- **Scoped keys** — each key is limited to explicit read permissions (account, automations, orders, markets, etc.).
- **No exchange credentials** — API keys cannot access exchange API secrets; connect exchanges only in the webapp.
- **Use a dedicated key** — create a separate key for MCP (e.g. “Cursor MCP”) and revoke it when you stop using it.
- **Never commit keys** — keep `DOGABOT_API_KEY` out of git; prefer OS env / secret manager, or a private local `.cursor/mcp.json` that is not committed.

Institutional write access for automation lifecycle is via the REST API only (with `Idempotency-Key`). MCP includes **`place_terminal_order`** (async ack + `client_order_id`), **`get_terminal_order`**, and **`list_terminal_orders`** for personal terminal trading (requires `write:terminal` / `read:orders` on the API key).

## Related

- [API keys & MCP (Learn Center)](https://learn.dogabot.com/help/api-keys-and-mcp)
- [GitHub repository](https://github.com/dogabot/dogabot-mcp-server)
