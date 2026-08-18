#!/usr/bin/env node
import { createRequire } from 'node:module'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { DogabotClient } from './client.js'
import { createRemoteProxyServer } from './proxy.js'
import { dogabotServerIcons } from './server-icon.js'
import { READ_TOOLS, WRITE_TOOLS, type ReadToolName, type WriteToolName } from './schemas.js'
import { invokeReadTool, invokeWriteTool, toolDefinitions } from './tools.js'

const require = createRequire(import.meta.url)
const { version: serverVersion } = require('../package.json') as { version: string }

const apiKey = process.env.DOGABOT_API_KEY
if (!apiKey) {
  console.error('DOGABOT_API_KEY is required')
  process.exit(1)
}

// Legacy flag: other institutional writes remain REST-only; terminal place/cancel is always registered.
const enableWriteTools = process.argv.includes('--enable-write-tools')
if (enableWriteTools) {
  console.error(
    'Note: --enable-write-tools is ignored. place_terminal_order and cancel_terminal_order are always available; other writes stay REST-only.',
  )
}

const mcpUrl = (process.env.DOGABOT_MCP_URL || 'https://mcp.dogabot.com/mcp').replace(/\/$/, '')
const useEmbedded = process.env.DOGABOT_MCP_EMBEDDED === '1' || process.env.DOGABOT_MCP_EMBEDDED === 'true'

function createEmbeddedServer(): Server {
  const client = new DogabotClient({ apiKey: apiKey! })
  const toolCtx = { client }
  const server = new Server(
    {
      name: 'dogabot',
      title: 'dogabot',
      version: serverVersion,
      websiteUrl: 'https://dogabot.com',
      icons: dogabotServerIcons(),
    },
    { capabilities: { tools: {} } },
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: toolDefinitions.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name
    try {
      let result: unknown
      if ((READ_TOOLS as readonly string[]).includes(name)) {
        result = await invokeReadTool(toolCtx, name as ReadToolName, request.params.arguments ?? {})
      } else if ((WRITE_TOOLS as readonly string[]).includes(name)) {
        result = await invokeWriteTool(toolCtx, name as WriteToolName, request.params.arguments ?? {})
      } else {
        return {
          isError: true,
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        }
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return {
        isError: true,
        content: [{ type: 'text', text: message }],
      }
    }
  })
  return server
}

async function main() {
  const transport = new StdioServerTransport()

  if (useEmbedded) {
    console.error('dogabot-mcp: embedded REST mode (DOGABOT_MCP_EMBEDDED=1)')
    const server = createEmbeddedServer()
    await server.connect(transport)
    return
  }

  console.error(`dogabot-mcp: proxying to ${mcpUrl}`)
  const { server, connectRemote, close } = createRemoteProxyServer({
    apiKey: apiKey!,
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
