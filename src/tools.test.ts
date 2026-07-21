import { describe, expect, it, vi } from 'vitest'
import type { DogabotClient } from './client.js'
import { invokeReadTool } from './tools.js'

const ctx = {
  client: { request: vi.fn() } as unknown as DogabotClient,
}

describe('invokeReadTool get_candles', () => {
  it('calls datafeed/history with exchange, symbol, resolution, and countback', async () => {
    const request = vi.fn().mockResolvedValue({ s: 'ok', t: [1], o: [2], h: [3], l: [1], c: [2], v: [10] })
    const client = { request } as unknown as DogabotClient

    await invokeReadTool({ ...ctx, client }, 'get_candles', {
      exchange: 'binance_usdm',
      symbol: 'BTC/USDT:USDT',
      resolution: '1h',
      countback: 50,
    })

    expect(request).toHaveBeenCalledWith('GET', '/datafeed/history', {
      query: {
        exchange: 'binance_usdm',
        symbol: 'BTC/USDT:USDT',
        resolution: '1h',
        from: undefined,
        to: undefined,
        countback: 50,
      },
    })
  })

  it('defaults countback to 100 when omitted', async () => {
    const request = vi.fn().mockResolvedValue({ s: 'no_data' })
    const client = { request } as unknown as DogabotClient

    await invokeReadTool({ ...ctx, client }, 'get_candles', {
      exchange: 'binance_spot',
      symbol: 'BTCUSDT',
      resolution: '60',
    })

    expect(request).toHaveBeenCalledWith('GET', '/datafeed/history', {
      query: expect.objectContaining({ countback: 100 }),
    })
  })
})

describe('invokeReadTool list_backtests', () => {
  it('maps sort and filter params to REST query string', async () => {
    const request = vi.fn().mockResolvedValue({ items: [], total: 0 })
    const client = { request } as unknown as DogabotClient

    await invokeReadTool({ ...ctx, client }, 'list_backtests', {
      limit: 10,
      offset: 20,
      sort_by: 'roi',
      sort_dir: 'desc',
      sort_by_2: 'daily_pnl_std_dev',
      sort_dir_2: 'asc',
      status: 'completed',
      symbol: 'BTCUSDT',
      exchange: 'binance_usdm',
      name_query: 'grid',
      batch_id: 'batch-abc',
      day_trade_mode: true,
      min_pnl: 1000,
      min_sharpe: 2,
    })

    expect(request).toHaveBeenCalledWith('GET', '/backtests', {
      query: {
        limit: 10,
        offset: 20,
        sortBy: 'roi',
        sortDir: 'desc',
        sortBy2: 'daily_pnl_std_dev',
        sortDir2: 'asc',
        status: 'completed',
        symbol: 'BTCUSDT',
        exchange: 'binance_usdm',
        nameQuery: 'grid',
        batch_id: 'batch-abc',
        day_trade_mode: 'true',
        minPnl: 1000,
        maxPnl: undefined,
        minRoi: undefined,
        maxRoi: undefined,
        minSharpe: 2,
        maxSharpe: undefined,
      },
    })
  })
})

describe('invokeReadTool list_automations', () => {
  it('maps sort and filter params to POST body', async () => {
    const request = vi.fn().mockResolvedValue({ items: [], total: 0 })
    const client = { request } as unknown as DogabotClient

    await invokeReadTool({ ...ctx, client }, 'list_automations', {
      limit: 25,
      offset: 5,
      sort_by: 'pnl',
      sort_dir: 'asc',
      status: 'running',
      trading_mode: 'live',
      types: ['follower', 'emitter'],
    })

    expect(request).toHaveBeenCalledWith('POST', '/automations/summary', {
      body: {
        limit: 25,
        offset: 5,
        sortBy: 'pnl',
        sortDir: 'asc',
        symbol: undefined,
        status: 'running',
        exchange: undefined,
        tradingMode: 'live',
        marketType: undefined,
        category: undefined,
        nameQuery: undefined,
        day_trade_mode: undefined,
        types: ['follower', 'emitter'],
      },
    })
  })
})
