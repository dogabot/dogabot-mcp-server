import { DogabotClient, automationDetailPath } from './client.js'
import { zodMcpInputSchema } from './mcp-json-schema.js'
import {
  getAutomationInput,
  getBacktestInput,
  getCandlesInput,
  getTickerInput,
  listAutomationsInput,
  listBacktestsInput,
  listMarketsInput,
  listOrdersInput,
  listSignalsInput,
  searchMarketplaceInput,
  type ReadToolName,
} from './schemas.js'

export type ToolContext = {
  client: DogabotClient
}

export async function invokeReadTool(ctx: ToolContext, name: ReadToolName, args: unknown): Promise<unknown> {
  const { client } = ctx
  switch (name) {
    case 'get_me':
      return client.request('GET', '/me')
    case 'list_automations': {
      const input = listAutomationsInput.parse(args ?? {})
      return client.request('POST', '/automations/summary', {
        body: {
          limit: input.limit ?? 50,
          offset: input.offset ?? 0,
          sortBy: input.sort_by,
          sortDir: input.sort_dir,
          symbol: input.symbol,
          status: input.status,
          exchange: input.exchange,
          tradingMode: input.trading_mode,
          marketType: input.market_type,
          category: input.category,
          nameQuery: input.name_query,
          day_trade_mode: input.day_trade_mode,
          types: input.types,
        },
      })
    }
    case 'get_automation': {
      const input = getAutomationInput.parse(args)
      return client.request('GET', automationDetailPath(input.type, input.id))
    }
    case 'get_user_statistics':
      return client.request('GET', '/me/statistics')
    case 'get_positions':
      return client.request('GET', '/me/positions')
    case 'list_orders': {
      const input = listOrdersInput.parse(args ?? {})
      return client.request('GET', '/orders', {
        query: {
          limit: input.limit ?? 50,
          offset: input.offset ?? 0,
          exchange: input.exchange,
          symbol: input.symbol,
        },
      })
    }
    case 'list_signals': {
      const input = listSignalsInput.parse(args ?? {})
      return client.request('GET', '/signals', {
        query: {
          limit: input.limit ?? 50,
          offset: input.offset ?? 0,
          exchange: input.exchange,
          symbol: input.symbol,
        },
      })
    }
    case 'get_backtest_quota':
      return client.request('GET', '/backtest/quota')
    case 'list_backtests': {
      const input = listBacktestsInput.parse(args ?? {})
      return client.request('GET', '/backtests', {
        query: {
          limit: input.limit ?? 50,
          offset: input.offset ?? 0,
          sortBy: input.sort_by,
          sortDir: input.sort_dir,
          sortBy2: input.sort_by_2,
          sortDir2: input.sort_dir_2,
          status: input.status,
          symbol: input.symbol,
          exchange: input.exchange,
          nameQuery: input.name_query,
          batch_id: input.batch_id,
          day_trade_mode: input.day_trade_mode ? 'true' : undefined,
          minPnl: input.min_pnl,
          maxPnl: input.max_pnl,
          minRoi: input.min_roi,
          maxRoi: input.max_roi,
          minSharpe: input.min_sharpe,
          maxSharpe: input.max_sharpe,
        },
      })
    }
    case 'get_backtest': {
      const input = getBacktestInput.parse(args)
      return client.request('GET', `/backtest/${encodeURIComponent(input.job_id)}`)
    }
    case 'search_marketplace': {
      const input = searchMarketplaceInput.parse(args ?? {})
      return client.request('GET', '/marketplace/search', {
        query: { q: input.q, limit: input.limit ?? 20 },
      })
    }
    case 'list_markets': {
      const input = listMarketsInput.parse(args ?? {})
      return client.request('GET', '/markets', {
        query: { exchange: input.exchange, limit: input.limit ?? 50 },
      })
    }
    case 'get_ticker': {
      const input = getTickerInput.parse(args)
      return client.request('GET', '/ticker', {
        query: { exchange: input.exchange, symbol: input.symbol },
      })
    }
    case 'get_candles': {
      const input = getCandlesInput.parse(args)
      return client.request('GET', '/datafeed/history', {
        query: {
          exchange: input.exchange,
          symbol: input.symbol,
          resolution: input.resolution,
          from: input.from,
          to: input.to,
          countback: input.countback ?? 100,
        },
      })
    }
    default:
      throw new Error(`Unknown tool: ${name satisfies never}`)
  }
}

export const toolDefinitions = [
  {
    name: 'get_me',
    description: 'Get current user profile, plan tier, and limits. Read-only; does not place orders.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_automations',
    description:
      'List automation summaries (bots, followers, emitters, portfolios). Read-only. Default sort is PnL descending; pass sort_by=pnl and sort_dir to override.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100 },
        offset: { type: 'integer', minimum: 0 },
        sort_by: { type: 'string', enum: ['pnl'], description: 'Sort merged list by PnL (default: pnl desc)' },
        sort_dir: { type: 'string', enum: ['asc', 'desc'] },
        symbol: { type: 'string' },
        status: { type: 'string', description: 'e.g. running, stopped' },
        exchange: { type: 'string' },
        trading_mode: { type: 'string', description: 'e.g. live, paper' },
        market_type: { type: 'string' },
        category: { type: 'string' },
        name_query: { type: 'string', description: 'Filter by name substring' },
        day_trade_mode: { type: 'boolean' },
        types: {
          type: 'array',
          items: { type: 'string', enum: ['follower', 'bot', 'emitter', 'portfolio'] },
          description: 'Limit to automation types',
        },
      },
    },
  },
  {
    name: 'get_automation',
    description: 'Get a single automation by type and id. Read-only.',
    inputSchema: {
      type: 'object',
      required: ['type', 'id'],
      properties: {
        type: { type: 'string', enum: ['follower', 'bot', 'emitter', 'portfolio'] },
        id: { type: 'integer', minimum: 1 },
      },
    },
  },
  {
    name: 'get_user_statistics',
    description: 'Dashboard-level user statistics. Read-only.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_positions',
    description: 'Aggregated open positions. Read-only.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_orders',
    description: 'Paginated order history. Read-only.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer' },
        offset: { type: 'integer' },
        exchange: { type: 'string' },
        symbol: { type: 'string' },
      },
    },
  },
  {
    name: 'list_signals',
    description: 'Paginated signal history. Read-only.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer' },
        offset: { type: 'integer' },
        exchange: { type: 'string' },
        symbol: { type: 'string' },
      },
    },
  },
  {
    name: 'get_backtest_quota',
    description: 'Remaining backtest quota for the billing period. Read-only.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_backtests',
    description:
      'List backtest jobs. Read-only. Combine sort_by, status, and metric filters (min_pnl, max_pnl, min_sharpe, min_roi, etc.). Example: completed backtests with pnl >= 1000 sorted by sharpe desc. ROI filters use decimal (1.0 = 100%). When sorting/filtering result metrics, set status=completed.',
    inputSchema: zodMcpInputSchema(listBacktestsInput),
  },
  {
    name: 'get_backtest',
    description: 'Get a backtest job by id. Read-only.',
    inputSchema: {
      type: 'object',
      required: ['job_id'],
      properties: { job_id: { type: 'string' } },
    },
  },
  {
    name: 'search_marketplace',
    description: 'Search marketplace emitter listings. Read-only.',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string' },
        limit: { type: 'integer' },
      },
    },
  },
  {
    name: 'list_markets',
    description: 'List tradable markets. Read-only.',
    inputSchema: {
      type: 'object',
      properties: {
        exchange: { type: 'string' },
        limit: { type: 'integer' },
      },
    },
  },
  {
    name: 'get_ticker',
    description: 'Get current ticker for an exchange/symbol pair. Read-only.',
    inputSchema: {
      type: 'object',
      required: ['exchange', 'symbol'],
      properties: {
        exchange: { type: 'string' },
        symbol: { type: 'string' },
      },
    },
  },
  {
    name: 'get_candles',
    description:
      'Get OHLCV candle history (TradingView datafeed format: s/t/o/h/l/c/v arrays). Read-only. resolution accepts CCXT intervals (1h, 1d) or TV ids (60, 1D). Defaults to last 100 bars when countback omitted.',
    inputSchema: {
      type: 'object',
      required: ['exchange', 'symbol', 'resolution'],
      properties: {
        exchange: { type: 'string', description: 'e.g. binance_usdm, binance_spot' },
        symbol: { type: 'string', description: 'e.g. BTC/USDT:USDT or BTCUSDT' },
        resolution: { type: 'string', description: 'e.g. 1h, 60, 1D' },
        from: { type: 'integer', description: 'Range start (Unix seconds, optional)' },
        to: { type: 'integer', description: 'Range end (Unix seconds, optional; defaults to now)' },
        countback: { type: 'integer', minimum: 1, maximum: 2000, description: 'Max bars (default 100)' },
      },
    },
  },
] as const
