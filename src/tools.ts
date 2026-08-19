import { DogabotClient, automationDetailPath, automationPositionPath } from './client.js'
import { zodMcpInputSchema } from './mcp-json-schema.js'
import {
  getAutomationInput,
  getBacktestInput,
  getBacktestSignalsInput,
  getCandlesInput,
  getPnlSeriesInput,
  getPositionInput,
  dashboardAggFiltersInput,
  getTickerInput,
  getTerminalOrderInput,
  getTerminalSymbolRulesInput,
  listAutomationsInput,
  listBacktestsInput,
  listExchangesInput,
  listMarketsInput,
  listOrdersInput,
  listSignalsInput,
  listTerminalOrdersInput,
  listTerminalPositionsInput,
  listExchangeBalancesInput,
  listExchangePositionsInput,
  listExchangeOrdersInput,
  listExchangeTradesInput,
  cancelBacktestInput,
  cancelTerminalOrderInput,
  createBacktestInput,
  placeTerminalOrderInput,
  searchMarketplaceInput,
  type ReadToolName,
  type WriteToolName,
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
          enabled_rule: input.enabled_rule,
          types: input.types,
        },
      })
    }
    case 'get_automation': {
      const input = getAutomationInput.parse(args)
      return client.request('GET', automationDetailPath(input.type, input.id))
    }
    case 'get_pnl_series': {
      const input = getPnlSeriesInput.parse(args)
      return client.request('GET', `${automationDetailPath(input.type, input.id)}/pnl-series`, {
        query: {
          period: input.period,
          limit: input.limit,
          offset: input.offset,
        },
      })
    }
    case 'get_position': {
      const input = getPositionInput.parse(args)
      return client.request('GET', automationPositionPath(input.type, input.id))
    }
    case 'get_user_statistics': {
      const input = dashboardAggFiltersInput.parse(args ?? {})
      return client.request('GET', '/me/statistics', {
        query: {
          trading_mode: input.trading_mode,
          automation_type: input.automation_type,
        },
      })
    }
    case 'get_positions': {
      const input = dashboardAggFiltersInput.parse(args ?? {})
      return client.request('GET', '/me/positions', {
        query: {
          trading_mode: input.trading_mode,
          automation_type: input.automation_type,
        },
      })
    }
    case 'list_orders': {
      const input = listOrdersInput.parse(args ?? {})
      return client.request('GET', '/orders', {
        query: {
          follower_id: input.follower_id,
          bot_id: input.bot_id,
          limit: input.limit ?? 50,
          offset: input.offset ?? 0,
        },
      })
    }
    case 'list_signals': {
      const input = listSignalsInput.parse(args ?? {})
      return client.request('GET', '/signals', {
        query: { emitter_id: input.emitter_id },
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
          enabled_rule: input.enabled_rule,
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
    case 'get_backtest_signals': {
      const input = getBacktestSignalsInput.parse(args)
      return client.request('GET', `/backtest/${encodeURIComponent(input.job_id)}/signals`, {
        query: {
          limit: input.limit ?? 50,
          offset: input.offset ?? 0,
        },
      })
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
    case 'list_exchanges': {
      const input = listExchangesInput.parse(args ?? {})
      return client.request('GET', '/exchanges', {
        query: {
          active_only: input.is_backtestable ? undefined : input.active_only !== false ? 'true' : 'false',
          is_backtestable: input.is_backtestable ? 'true' : undefined,
        },
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
    case 'list_terminal_orders': {
      const input = listTerminalOrdersInput.parse(args ?? {})
      return client.request('GET', '/terminal/orders', {
        query: {
          limit: input.limit ?? 50,
          offset: input.offset ?? 0,
          exchange: input.exchange,
          symbol: input.symbol,
          trading_mode: input.trading_mode,
          client_order_id: input.client_order_id,
        },
      })
    }
    case 'get_terminal_order': {
      const input = getTerminalOrderInput.parse(args ?? {})
      return client.request(
        'GET',
        `/terminal/orders/by-client-order-id/${encodeURIComponent(input.client_order_id)}`,
      )
    }
    case 'list_terminal_positions': {
      const input = listTerminalPositionsInput.parse(args ?? {})
      return client.request('GET', '/terminal/positions', {
        query: {
          trading_mode: input.trading_mode ?? 'paper',
          // exchange/symbol/limit filtered client-side by hosted MCP; embedded passes trading_mode only
        },
      })
    }
    case 'list_terminal_emitters':
      return client.request('GET', '/me/emitters')
    case 'list_exchange_balances': {
      const input = listExchangeBalancesInput.parse(args)
      return client.request('GET', '/terminal/exchange-balances', {
        query: {
          exchange: input.exchange,
          ...(input.include_zero ? { include_zero: '1' } : {}),
          ...(input.asset ? { asset: input.asset } : {}),
        },
      })
    }
    case 'list_exchange_positions': {
      const input = listExchangePositionsInput.parse(args)
      return client.request('GET', '/terminal/exchange-positions', {
        query: {
          exchange: input.exchange,
          ...(input.symbol ? { symbol: input.symbol } : {}),
        },
      })
    }
    case 'list_exchange_orders': {
      const input = listExchangeOrdersInput.parse(args)
      return client.request('GET', '/terminal/exchange-orders', {
        query: {
          exchange: input.exchange,
          ...(input.symbol ? { symbol: input.symbol } : {}),
        },
      })
    }
    case 'list_exchange_trades': {
      const input = listExchangeTradesInput.parse(args)
      return client.request('GET', '/terminal/exchange-trades', {
        query: {
          exchange: input.exchange,
          ...(input.symbol ? { symbol: input.symbol } : {}),
          ...(input.cursor ? { cursor: input.cursor } : {}),
          ...(input.limit != null ? { limit: String(input.limit) } : {}),
        },
      })
    }
    case 'get_terminal_symbol_rules': {
      const input = getTerminalSymbolRulesInput.parse(args)
      return client.request('GET', '/terminal/symbol-rules', {
        query: { exchange: input.exchange, symbol: input.symbol },
      })
    }
    default:
      throw new Error(`Unknown tool: ${name satisfies never}`)
  }
}

export async function invokeWriteTool(ctx: ToolContext, name: WriteToolName, args: unknown): Promise<unknown> {
  const { client } = ctx
  switch (name) {
    case 'place_terminal_order': {
      const input = placeTerminalOrderInput.parse(args)
      const idempotencyKey =
        input.idempotency_key?.trim() ||
        `mcp-term-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      return client.request('POST', '/terminal/place-order', {
        headers: { 'Idempotency-Key': idempotencyKey },
        body: {
          exchange: input.exchange,
          symbol: input.symbol,
          side: input.side,
          quantity: input.quantity,
          price: input.price ?? 0,
          trading_mode: input.trading_mode,
          broadcast_mode: input.broadcast_mode,
          emitter_id: input.emitter_id,
        },
      })
    }
    case 'cancel_terminal_order': {
      const input = cancelTerminalOrderInput.parse(args)
      const idempotencyKey =
        input.idempotency_key?.trim() ||
        `mcp-term-cancel-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      return client.request('POST', '/terminal/cancel-order', {
        headers: { 'Idempotency-Key': idempotencyKey },
        body: {
          client_order_id: input.client_order_id,
          order_id: input.order_id,
          exchange: input.exchange,
          symbol: input.symbol,
          trading_mode: input.trading_mode,
        },
      })
    }
    case 'create_backtest': {
      const input = createBacktestInput.parse(args)
      const idempotencyKey =
        input.idempotency_key?.trim() ||
        `mcp-bt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      return client.request('POST', '/backtest', {
        headers: { 'Idempotency-Key': idempotencyKey },
        body: {
          name: input.name,
          symbol: input.symbol,
          exchange: input.exchange,
          candle_timeframe: input.candle_timeframe,
          execution_interval: input.execution_interval,
          start_time: input.start_time,
          end_time: input.end_time,
          initial_capital: input.initial_capital,
          params: input.params ?? {},
        },
      })
    }
    case 'cancel_backtest': {
      const input = cancelBacktestInput.parse(args)
      const idempotencyKey =
        input.idempotency_key?.trim() ||
        `mcp-bt-cancel-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      return client.request('POST', `/backtest/${encodeURIComponent(input.job_id)}/cancel`, {
        headers: { 'Idempotency-Key': idempotencyKey },
      })
    }
    default:
      throw new Error(`Unknown write tool: ${name satisfies never}`)
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
      'List automation summaries (bots, followers, emitters, portfolios). Read-only. Default sort is PnL descending; pass sort_by=pnl and sort_dir to override. Optional enabled_rule filters to strategies with that rule enabled (e.g. pricePredict); list rows may include enabled_rules.',
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
        enabled_rule: {
          type: 'string',
          description: 'Filter to automations with this strategy rule enabled (e.g. pricePredict, rsi)',
        },
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
    description:
      'Get a single automation by type and id (config/params). For daily PnL or open position, use get_pnl_series / get_position. Read-only.',
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
    name: 'get_pnl_series',
    description:
      'Daily PnL series for an automation. Use period=7d|30d|90d|all for windowed sparklines (same as UI Last 30 days); omit period for paginated full series. Companion to get_automation / get_backtest for live-vs-sim compares. Read-only.',
    inputSchema: zodMcpInputSchema(getPnlSeriesInput),
  },
  {
    name: 'get_position',
    description:
      'Open position for one automation (quantity, side, avg entry). Portfolios return aggregated positions. Companion to get_automation for live-vs-sim compares. Read-only.',
    inputSchema: zodMcpInputSchema(getPositionInput),
  },
  {
    name: 'get_user_statistics',
    description:
      'Dashboard-level user statistics (running count, capital, volume). Optional trading_mode (live|paper, default live) and automation_type (followers|emitters|bots|portfolios|terminal|all, default all). Use automation_type=terminal for personal terminal-only stats. Read-only.',
    inputSchema: zodMcpInputSchema(dashboardAggFiltersInput),
  },
  {
    name: 'get_positions',
    description:
      'Aggregated open positions by symbol and exchange. Optional trading_mode (live|paper, default live) and automation_type (followers|emitters|bots|portfolios|terminal|all, default all). Use automation_type=terminal for personal terminal sessions only. Read-only.',
    inputSchema: zodMcpInputSchema(dashboardAggFiltersInput),
  },
  {
    name: 'list_orders',
    description:
      'Paginated order history for a follower or bot. Requires exactly one of follower_id or bot_id. Read-only.',
    inputSchema: zodMcpInputSchema(listOrdersInput),
  },
  {
    name: 'list_signals',
    description: 'Latest signals for an emitter (requires emitter_id). Read-only.',
    inputSchema: zodMcpInputSchema(listSignalsInput),
  },
  {
    name: 'get_backtest_quota',
    description: 'Remaining backtest quota for the billing period. Read-only.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_backtests',
    description:
      'List backtest jobs. Read-only. Combine sort_by, status, enabled_rule, and metric filters (min_pnl, max_pnl, min_sharpe, min_roi, etc.). Example: completed backtests with enabled_rule=pricePredict sorted by sharpe desc. ROI filters use decimal (1.0 = 100%). When sorting/filtering result metrics, set status=completed. List rows may include enabled_rules.',
    inputSchema: zodMcpInputSchema(listBacktestsInput),
  },
  {
    name: 'get_backtest',
    description:
      'Get a backtest job by id (includes pnl_series and statistics). Compare live automations with get_pnl_series / get_position. Read-only.',
    inputSchema: {
      type: 'object',
      required: ['job_id'],
      properties: { job_id: { type: 'string' } },
    },
  },
  {
    name: 'get_backtest_signals',
    description:
      'Paginated backtest trade signals (limit default 50, max 100). Full history is kept for 24 hours after create; afterward only the latest 20 trades remain. Response includes retention_notice. Read-only.',
    inputSchema: zodMcpInputSchema(getBacktestSignalsInput),
  },
  {
    name: 'create_backtest',
    description:
      'Enqueue a single backtest. Requires write:backtest. Check get_backtest_quota first. Max 10 enqueued/running per user (429 if exceeded). Prefer cancel_backtest over blasting creates. Sends Idempotency-Key automatically.',
    inputSchema: zodMcpInputSchema(createBacktestInput),
  },
  {
    name: 'cancel_backtest',
    description:
      'Cancel an enqueued or running backtest you own. Requires write:backtest. Sends Idempotency-Key automatically.',
    inputSchema: zodMcpInputSchema(cancelBacktestInput),
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
    name: 'list_exchanges',
    description: 'List exchanges (default active_only=true). Cap 100. Read-only.',
    inputSchema: zodMcpInputSchema(listExchangesInput),
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
  {
    name: 'list_terminal_orders',
    description:
      'List personal terminal order history for the authenticated user (terminal.orders). Optional exchange/symbol/trading_mode/client_order_id filters. Requires read:orders.',
    inputSchema: zodMcpInputSchema(listTerminalOrdersInput),
  },
  {
    name: 'get_terminal_order',
    description:
      'Fetch one personal terminal order by client_order_id from place_terminal_order. Returns 404 until order-executor persists the row — poll until 200 or timeout. Requires read:orders.',
    inputSchema: zodMcpInputSchema(getTerminalOrderInput),
  },
  {
    name: 'list_terminal_positions',
    description:
      'List open terminal positions (default paper). Optional exchange/symbol filters; limit default 50 max 100. Requires read:orders.',
    inputSchema: zodMcpInputSchema(listTerminalPositionsInput),
  },
  {
    name: 'list_terminal_emitters',
    description:
      'List owned Traders-category emitters eligible for terminal Leader broadcast (running/stopped). Use emitter id with place_terminal_order broadcast_mode=leader. Requires read:automations.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_exchange_balances',
    description:
      'Live exchange wallet balances (free/locked) for one exchange — not stored in dogabot; not terminal session positions and not automation (bot/emitter) positions. Example: a running Bot BTC position on Binance will not appear here; Bitget USDT free balance will. Optional asset (e.g. USDT) returns only that row including zero. Requires live credentials and read:orders.',
    inputSchema: zodMcpInputSchema(listExchangeBalancesInput),
  },
  {
    name: 'list_exchange_positions',
    description:
      'Live venue open futures/perp positions for one exchange — not stored in dogabot; not terminal session books and not automation positions. Spot product ids return an empty list. Optional symbol filter. Requires live credentials and read:orders.',
    inputSchema: zodMcpInputSchema(listExchangePositionsInput),
  },
  {
    name: 'list_exchange_orders',
    description:
      'Live venue open orders plus recent filled/canceled history for one exchange — not stored in dogabot; not terminal session or automation order history. Optional symbol filter (also used as a pair hint on Binance/Aster history). Requires live credentials and read:orders.',
    inputSchema: zodMcpInputSchema(listExchangeOrdersInput),
  },
  {
    name: 'list_exchange_trades',
    description:
      'Live venue trade/fill history for one exchange — not stored in dogabot; not order history and not terminal session trades. Paginated via cursor (omit for the newest page; pass next_cursor for older fills). Optional symbol filter; Binance/Aster require a pair. Optional limit 1–100 default 50. Requires live credentials and read:orders.',
    inputSchema: zodMcpInputSchema(listExchangeTradesInput),
  },
  {
    name: 'get_terminal_symbol_rules',
    description: 'Lot size / min notional / quantity rules for an exchange symbol. Requires read:markets.',
    inputSchema: zodMcpInputSchema(getTerminalSymbolRulesInput),
  },
  {
    name: 'place_terminal_order',
    description:
      'Place a terminal market order. Personal: paper/live on your session (poll get_terminal_order). Leader: broadcast_mode=leader requires emitter_id from list_terminal_emitters (Traders category); fans out to followers — prefer paper. Requires write:terminal, feat:terminal; Idempotency-Key sent automatically.',
    inputSchema: zodMcpInputSchema(placeTerminalOrderInput),
  },
  {
    name: 'cancel_terminal_order',
    description:
      'Cancel a resting personal terminal GTC limit. Pass client_order_id from place_terminal_order (hydrates exchange/symbol/trading_mode) or order_id plus exchange and symbol. Requires write:terminal; Idempotency-Key sent automatically.',
    inputSchema: zodMcpInputSchema(cancelTerminalOrderInput),
  },
] as const
