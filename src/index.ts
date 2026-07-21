#!/usr/bin/env node
import { createRequire } from 'node:module'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { DogabotClient } from './client.js'
import { dogabotServerIcons } from './server-icon.js'
import { READ_TOOLS, type ReadToolName } from './schemas.js'
import { invokeReadTool, toolDefinitions } from './tools.js'

const require = createRequire(import.meta.url)
const { version: serverVersion } = require('../package.json') as { version: string }

const apiKey = process.env.DOGABOT_API_KEY
if (!apiKey) {
  console.error('DOGABOT_API_KEY is required')
  process.exit(1)
}

const enableWriteTools = process.argv.includes('--enable-write-tools')
if (enableWriteTools) {
  console.error('Write tools are not available in v1. Use REST with Idempotency-Key for institutional writes.')
  process.exit(1)
}

const client = new DogabotClient({ apiKey })
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
  const name = request.params.name as ReadToolName
  if (!READ_TOOLS.includes(name)) {
    return {
      content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      isError: true,
    }
  }

  try {
    const result = await invokeReadTool(toolCtx, name, request.params.arguments ?? {})
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      content: [{ type: 'text', text: message }],
      isError: true,
    }
  }
})

async function main() {
  console.error(`dogabot-mcp v${serverVersion} (stdio)`)
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
