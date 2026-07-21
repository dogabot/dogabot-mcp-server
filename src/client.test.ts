import { afterEach, describe, expect, it, vi } from 'vitest'
import { automationDetailPath, DogabotClient } from './client.js'

describe('DogabotClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.DOGABOT_API_BASE_URL
  })

  it('rejects API keys that do not start with dbk_', () => {
    expect(() => new DogabotClient({ apiKey: 'sk_live_bad' })).toThrow(/dbk_/)
  })

  it('accepts dbk_live and dbk_test keys', () => {
    expect(() => new DogabotClient({ apiKey: 'dbk_live_abc' })).not.toThrow()
    expect(() => new DogabotClient({ apiKey: 'dbk_test_abc' })).not.toThrow()
  })

  it('defaults baseUrl from env and strips trailing slash', async () => {
    process.env.DOGABOT_API_BASE_URL = 'https://api.example.com/api/v1/'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ data: { id: 1 } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const client = new DogabotClient({ apiKey: 'dbk_live_x' })
    await client.request('GET', '/me')

    const calledUrl = String(fetchMock.mock.calls[0][0])
    expect(calledUrl).toBe('https://api.example.com/api/v1/me')
  })

  it('builds query strings and omits empty values', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ items: [] }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const client = new DogabotClient({
      apiKey: 'dbk_live_x',
      baseUrl: 'https://api.dogabot.com/api/v1',
    })
    await client.request('GET', '/backtests', {
      query: { limit: 10, offset: 0, symbol: '', status: 'completed' },
    })

    const calledUrl = String(fetchMock.mock.calls[0][0])
    expect(calledUrl).toContain('limit=10')
    expect(calledUrl).toContain('offset=0')
    expect(calledUrl).toContain('status=completed')
    expect(calledUrl).not.toContain('symbol=')
  })

  it('unwraps { data } envelopes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({ data: { email: 'a@b.c' } }),
      }),
    )
    const client = new DogabotClient({ apiKey: 'dbk_live_x' })
    const me = await client.request<{ email: string }>('GET', '/me')
    expect(me.email).toBe('a@b.c')
  })

  it('returns list envelopes with items as-is', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({ items: [{ id: 1 }], total: 1 }),
      }),
    )
    const client = new DogabotClient({ apiKey: 'dbk_live_x' })
    const list = await client.request<{ items: { id: number }[]; total: number }>('GET', '/orders')
    expect(list.items).toHaveLength(1)
    expect(list.total).toBe(1)
  })

  it('throws API error message on non-OK responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => JSON.stringify({ error: 'forbidden' }),
      }),
    )
    const client = new DogabotClient({ apiKey: 'dbk_live_x' })
    await expect(client.request('GET', '/me')).rejects.toThrow('forbidden')
  })
})

describe('automationDetailPath', () => {
  it('maps portfolio to portfolios', () => {
    expect(automationDetailPath('portfolio', 42)).toBe('/portfolios/42')
  })

  it('maps bot to bots', () => {
    expect(automationDetailPath('bot', 7)).toBe('/bots/7')
  })
})
