# @dogabot/mcp

MCP (Model Context Protocol) server for [dogabot](https://dogabot.com). Exposes **read-only** tools that call the dogabot REST API using a scoped API key.

## Prerequisites

- **Pro or Institutional** dogabot account
- API key from **Settings → API Keys** (`dbk_live_...`)
- Node.js 20+ (Cursor/Claude will use it when they launch the server)

## Setup (no terminal install)

There is **no** `npm install` or `npx` step for you to run by hand.

1. Create an API key in dogabot (**Settings → API Keys**).
2. Copy the client config below into your AI app’s MCP settings file.
3. Put your key in the config (replace the placeholder).
4. Enable the **dogabot** server in the app UI (Cursor: Settings → Tools & MCP).

**Do not run `npx -y @dogabot/mcp` (or `dogabot-mcp`) in a terminal.** That command is what the AI app executes for you. Running it alone always fails with `DOGABOT_API_KEY is required` unless you also exported the key in that shell — and even then it only sits waiting for MCP protocol traffic. Use the UI toggle instead.

## Cursor (recommended)

1. Copy [`examples/cursor-mcp.json`](examples/cursor-mcp.json) into `.cursor/mcp.json` (merge with existing `mcpServers` if needed).
2. Replace `dbk_live_REPLACE_ME` with your API key (or set `DOGABOT_API_KEY` in your OS environment and use `"${env:DOGABOT_API_KEY}"` instead of the literal key).
3. Reload Cursor.
4. Open **Settings → Tools & MCP** and enable **dogabot**.

Example (after replacing the key):

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

Cursor downloads and starts `@dogabot/mcp` automatically when the server is enabled. You only toggle it on/off in the UI.

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
- **Never commit keys** — keep `DOGABOT_API_KEY` out of git; prefer OS env / secret manager, or a private local `.cursor/mcp.json` that is not committed.

Institutional write access is via the REST API only (with `Idempotency-Key`), not through MCP in v1. See the [Learn Center](https://learn.dogabot.com/help/api-keys-and-mcp) for key creation and best practices.

## Related

- [API keys & MCP (Learn Center)](https://learn.dogabot.com/help/api-keys-and-mcp)
- [GitHub repository](https://github.com/dogabot/dogabot-mcp-server)
