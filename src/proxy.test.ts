import { describe, expect, it } from 'vitest'
import { createRemoteProxyServer } from './proxy.js'

describe('createRemoteProxyServer', () => {
  it('builds a server with tools capability', () => {
    const { server } = createRemoteProxyServer({
      apiKey: 'dbk_live_test',
      mcpUrl: 'https://api.dogabot.com/mcp',
      version: '0.2.0',
    })
    expect(server).toBeTruthy()
  })
})
