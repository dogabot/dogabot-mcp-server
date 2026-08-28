#!/usr/bin/env node
import { createRequire } from 'node:module'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createRemoteProxyServer } from './proxy.js'

const require = createRequire(import.meta.url)
const { version: serverVersion } = require('../package.json') as { version: string }

const apiKeyEnv = process.env.DOGABOT_API_KEY
if (!apiKeyEnv) {
  console.error('DOGABOT_API_KEY is required')
  process.exit(1)
}
const apiKey: string = apiKeyEnv

const mcpUrl = (process.env.DOGABOT_MCP_URL || 'https://mcp.dogabot.com/mcp').replace(/\/$/, '')

async function main() {
  const transport = new StdioServerTransport()

  console.error(`dogabot-mcp: proxying to ${mcpUrl}`)
  const { server, connectRemote, close } = createRemoteProxyServer({
    apiKey,
    mcpUrl,
    version: serverVersion,
  })
  await connectRemote()
  const shutdown = async () => {
    await close()
  }
  process.on('SIGINT', () => {
    void shutdown().finally(() => process.exit(0))
  })
  process.on('SIGTERM', () => {
    void shutdown().finally(() => process.exit(0))
  })
  await server.connect(transport)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
