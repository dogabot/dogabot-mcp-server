# Grok custom MCP connector

1. Open [grok.com/connectors](https://grok.com/connectors).
2. **New Connector** → **Custom**.
3. Server URL: `https://mcp.dogabot.com/mcp`
4. Complete OAuth (enable OAuth MCP under dogabot **MCP & API**) or use an API key if your client supports headers.

**Grok Build (curated plugin marketplace):** packaging for install-from-catalog lives in this repo (`.mcp.json`, `.claude-plugin/`). Listing requires a separate PR to [`xai-org/plugin-marketplace`](https://github.com/xai-org/plugin-marketplace) that pins a full commit SHA of `dogabot/dogabot-mcp-server` as a remote source — not done by sync alone. Product page: [dogabot.com/mcp-server](https://dogabot.com/mcp-server).
