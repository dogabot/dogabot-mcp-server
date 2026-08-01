import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { dogabotServerIcons } from './server-icon.js'

export type ProxyOptions = {
  apiKey: string
  mcpUrl: string
  version: string
}

/**
 * Stdio MCP server that forwards tools/list and tools/call to the remote
 * Streamable HTTP endpoint (api.dogabot.com/mcp). Tool catalogs live on the server.
 */
export function createRemoteProxyServer(opts: ProxyOptions): {
  server: Server
  connectRemote: () => Promise<void>
  close: () => Promise<void>
} {
  const remote = new Client({ name: 'dogabot-mcp-stdio-proxy', version: opts.version })
  let transport: StreamableHTTPClientTransport | undefined

  const server = new Server(
    {
      name: 'dogabot',
      title: 'dogabot',
      version: opts.version,
      websiteUrl: 'https://dogabot.com',
      icons: dogabotServerIcons(),
    },
    { capabilities: { tools: {} } },
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const listed = await remote.listTools()
    return { tools: listed.tools }
  })

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const result = await remote.callTool({
      name: request.params.name,
      arguments: request.params.arguments ?? {},
    })
    return result
  })

  return {
    server,
    async connectRemote() {
      transport = new StreamableHTTPClientTransport(new URL(opts.mcpUrl), {
        requestInit: {
          headers: {
            Authorization: `Bearer ${opts.apiKey}`,
          },
        },
      })
      await remote.connect(transport)
    },
    async close() {
      await remote.close().catch(() => undefined)
      await transport?.close().catch(() => undefined)
    },
  }
}
