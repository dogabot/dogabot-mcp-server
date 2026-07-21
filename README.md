# @dogabot/mcp

MCP (Model Context Protocol) server for [dogabot](https://dogabot.com). Exposes **read-only** tools that call the dogabot REST API using a scoped API key.

## Prerequisites

- **Pro or Institutional** dogabot account
- API key from **Settings → API Keys** (`dbk_live_...`)
- Node.js 20+

## Install (underlying server)

All setup paths run the same npm package:

```bash
npx -y @dogabot/mcp
```

Or install globally: `npm install -g @dogabot/mcp` and use `"command": "dogabot-mcp"`.

## Cursor (recommended)

Copy [`examples/cursor-mcp.json`](examples/cursor-mcp.json) into `.cursor/mcp.json` (merge with existing `mcpServers` if needed). Set `DOGABOT_API_KEY` in your environment, then reload Cursor.

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

## Environment variables

Only `DOGABOT_API_KEY` is required. The server uses the production dogabot REST API by default.

## Tools (v1 — read only)

| Tool | Description |
|------|-------------|
| `get_me` | Current user profile |
| `list_automations` | Automations summary (sort/filter) |
| `get_automation` | Single automation detail (config) |
| `get_pnl_series` | Daily PnL series (`period` 7d/30d/90d/all) |
| `get_position` | Open position for one automation |
| `get_user_statistics` | Account statistics |
| `get_positions` | Open positions |
| `list_orders` | Order history (`follower_id` or `bot_id`) |
| `list_signals` | Emitter signal history (`emitter_id`) |
| `get_backtest_quota` | Backtest quota |
| `list_backtests` | Backtest results (sort/filter) |
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
- **Never commit keys** — keep `DOGABOT_API_KEY` in environment variables or a secret manager, not in git or shared config files.

Institutional write access is via the REST API only (with `Idempotency-Key`), not through MCP in v1. See the [Learn Center](https://learn.dogabot.com/help/api-keys-and-mcp) for key creation and best practices.

## Related

- [API keys & MCP (Learn Center)](https://learn.dogabot.com/help/api-keys-and-mcp)
- [GitHub repository](https://github.com/dogabot/dogabot-mcp-server)
