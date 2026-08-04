import { z } from 'zod'

const sortDirSchema = z.enum(['asc', 'desc']).optional()

const automationTypeSchema = z.enum(['follower', 'bot', 'emitter', 'portfolio'])

export const listAutomationsInput = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  sort_by: z.enum(['pnl']).optional(),
  sort_dir: sortDirSchema,
  symbol: z.string().optional(),
  status: z.string().optional(),
  exchange: z.string().optional(),
  trading_mode: z.string().optional(),
  market_type: z.string().optional(),
  category: z.string().optional(),
  name_query: z.string().optional(),
  day_trade_mode: z.boolean().optional(),
  enabled_rule: z
    .string()
    .optional()
    .describe('Filter to automations with this strategy rule enabled (e.g. pricePredict, rsi)'),
  types: z.array(automationTypeSchema).optional(),
})

export const getAutomationInput = z.object({
  type: automationTypeSchema,
  id: z.number().int().positive(),
})

export const getPnlSeriesInput = z.object({
  type: automationTypeSchema,
  id: z.number().int().positive(),
  period: z.enum(['7d', '30d', '90d', 'all']).optional(),
  limit: z.number().int().min(1).max(2000).optional(),
  offset: z.number().int().min(0).optional(),
})

export const getPositionInput = z.object({
  type: automationTypeSchema,
  id: z.number().int().positive(),
})

export const listOrdersInput = z
  .object({
    follower_id: z.number().int().positive().optional(),
    bot_id: z.number().int().positive().optional(),
    limit: z.number().int().min(1).max(100).optional(),
    offset: z.number().int().min(0).optional(),
  })
  .superRefine((val, ctx) => {
    const hasFollower = val.follower_id != null
    const hasBot = val.bot_id != null
    if (hasFollower === hasBot) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide exactly one of follower_id or bot_id',
      })
    }
  })

export const listSignalsInput = z.object({
  emitter_id: z.number().int().positive(),
})

const backtestSortBySchema = z.enum([
  'created_at',
  'name',
  'roi',
  'pnl',
  'status',
  'daily_pnl_std_dev',
  'sharpe',
  'sortino',
])

export const listBacktestsInput = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  sort_by: backtestSortBySchema.optional(),
  sort_dir: sortDirSchema,
  sort_by_2: backtestSortBySchema.optional(),
  sort_dir_2: sortDirSchema,
  status: z.string().optional(),
  symbol: z.string().optional(),
  exchange: z.string().optional(),
  name_query: z.string().optional(),
  batch_id: z.string().optional(),
  day_trade_mode: z.boolean().optional(),
  enabled_rule: z
    .string()
    .optional()
    .describe('Filter to backtests with this strategy rule enabled (e.g. pricePredict, rsi)'),
  min_pnl: z.number().optional().describe('Minimum final PnL in quote currency (e.g. 1000)'),
  max_pnl: z.number().optional().describe('Maximum final PnL in quote currency'),
  min_roi: z.number().optional().describe('Minimum ROI after costs as decimal (0.5 = 50%)'),
  max_roi: z.number().optional().describe('Maximum ROI after costs as decimal'),
  min_sharpe: z.number().optional().describe('Minimum Sharpe ratio'),
  max_sharpe: z.number().optional().describe('Maximum Sharpe ratio'),
})

export const getBacktestInput = z.object({
  job_id: z.string().min(1),
})

export const getBacktestSignalsInput = z.object({
  job_id: z.string().min(1),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
})

export const createBacktestInput = z.object({
  name: z.string().min(1).max(200),
  symbol: z.string().min(1),
  exchange: z.string().min(1),
  candle_timeframe: z.string().min(1),
  execution_interval: z.number().int().positive(),
  start_time: z.number().int(),
  end_time: z.number().int(),
  initial_capital: z.number().min(0).optional(),
  params: z.record(z.string(), z.unknown()).optional(),
  idempotency_key: z.string().min(1).optional(),
})

export const cancelBacktestInput = z.object({
  job_id: z.string().min(1),
  idempotency_key: z.string().min(1).optional(),
})

export const searchMarketplaceInput = z.object({
  q: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional(),
})

export const listMarketsInput = z.object({
  exchange: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

export const listExchangesInput = z.object({
  active_only: z.boolean().optional().default(true),
  is_backtestable: z.boolean().optional(),
})

export const getTickerInput = z.object({
  exchange: z.string().min(1),
  symbol: z.string().min(1),
})

export const getCandlesInput = z.object({
  exchange: z.string().min(1),
  symbol: z.string().min(1),
  resolution: z.string().min(1),
  from: z.number().int().optional(),
  to: z.number().int().optional(),
  countback: z.number().int().min(1).max(2000).optional(),
})

export const listTerminalOrdersInput = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  exchange: z.string().optional(),
  symbol: z.string().optional(),
  trading_mode: z.string().optional(),
  client_order_id: z.string().optional(),
})

export const getTerminalOrderInput = z.object({
  client_order_id: z.string().min(1),
})

export const listTerminalPositionsInput = z.object({
  trading_mode: z.enum(['live', 'paper']).optional().default('paper'),
  exchange: z.string().optional(),
  symbol: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

export const listExchangeBalancesInput = z.object({
  exchange: z.string().min(1),
  include_zero: z.boolean().optional(),
  /** When set, returns only that asset row (including zero balance). */
  asset: z.string().min(1).optional(),
})

export const getTerminalSymbolRulesInput = z.object({
  exchange: z.string().min(1),
  symbol: z.string().min(1),
})

export const placeTerminalOrderInput = z.object({
  exchange: z.string().min(1),
  symbol: z.string().min(1),
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
  price: z.number().min(0).optional().default(0),
  trading_mode: z.enum(['live', 'paper']).default('paper'),
  broadcast_mode: z.enum(['personal', 'leader']).default('personal'),
  emitter_id: z.number().int().positive().optional(),
  idempotency_key: z.string().min(1).optional(),
})

export type ReadToolName =
  | 'get_me'
  | 'list_automations'
  | 'get_automation'
  | 'get_pnl_series'
  | 'get_position'
  | 'get_user_statistics'
  | 'get_positions'
  | 'list_orders'
  | 'list_signals'
  | 'get_backtest_quota'
  | 'list_backtests'
  | 'get_backtest'
  | 'get_backtest_signals'
  | 'search_marketplace'
  | 'list_markets'
  | 'list_exchanges'
  | 'get_ticker'
  | 'get_candles'
  | 'list_terminal_orders'
  | 'get_terminal_order'
  | 'list_terminal_positions'
  | 'list_terminal_emitters'
  | 'list_exchange_balances'
  | 'get_terminal_symbol_rules'

export type WriteToolName = 'place_terminal_order' | 'create_backtest' | 'cancel_backtest'

export type ToolName = ReadToolName | WriteToolName

export const READ_TOOLS: ReadToolName[] = [
  'get_me',
  'list_automations',
  'get_automation',
  'get_pnl_series',
  'get_position',
  'get_user_statistics',
  'get_positions',
  'list_orders',
  'list_signals',
  'get_backtest_quota',
  'list_backtests',
  'get_backtest',
  'get_backtest_signals',
  'search_marketplace',
  'list_markets',
  'list_exchanges',
  'get_ticker',
  'get_candles',
  'list_terminal_orders',
  'get_terminal_order',
  'list_terminal_positions',
  'list_terminal_emitters',
  'list_exchange_balances',
  'get_terminal_symbol_rules',
]

export const WRITE_TOOLS: WriteToolName[] = ['place_terminal_order', 'create_backtest', 'cancel_backtest']

/** Maps MCP tool names to REST endpoints. */
export const toolRouteMap: Record<ToolName, { method: string; path: string; note?: string }> = {
  get_me: { method: 'GET', path: '/me' },
  list_automations: { method: 'POST', path: '/automations/summary' },
  get_automation: { method: 'GET', path: '/:type/:id', note: 'resolved at runtime' },
  get_pnl_series: { method: 'GET', path: '/:type/:id/pnl-series', note: 'resolved at runtime' },
  get_position: { method: 'GET', path: '/:type/:id/position', note: 'resolved at runtime; portfolios use /positions' },
  get_user_statistics: { method: 'GET', path: '/me/statistics' },
  get_positions: { method: 'GET', path: '/me/positions' },
  list_orders: { method: 'GET', path: '/orders' },
  list_signals: { method: 'GET', path: '/signals' },
  get_backtest_quota: { method: 'GET', path: '/backtest/quota' },
  list_backtests: { method: 'GET', path: '/backtests' },
  get_backtest: { method: 'GET', path: '/backtest/:job_id', note: 'resolved at runtime' },
  get_backtest_signals: {
    method: 'GET',
    path: '/backtest/:job_id/signals',
    note: 'paginated; retention metadata on response',
  },
  create_backtest: {
    method: 'POST',
    path: '/backtest',
    note: 'requires write:backtest + Idempotency-Key; max 10 in-flight',
  },
  cancel_backtest: {
    method: 'POST',
    path: '/backtest/:job_id/cancel',
    note: 'requires write:backtest + Idempotency-Key',
  },
  search_marketplace: { method: 'GET', path: '/marketplace/search' },
  list_markets: { method: 'GET', path: '/markets' },
  list_exchanges: { method: 'GET', path: '/exchanges', note: 'default active_only=true' },
  get_ticker: { method: 'GET', path: '/ticker' },
  get_candles: { method: 'GET', path: '/datafeed/history' },
  list_terminal_orders: { method: 'GET', path: '/terminal/orders' },
  get_terminal_order: {
    method: 'GET',
    path: '/terminal/orders/by-client-order-id/:client_order_id',
    note: 'poll after place_terminal_order until 200 or timeout',
  },
  list_terminal_positions: { method: 'GET', path: '/terminal/positions', note: 'default paper; MCP may filter/cap' },
  list_terminal_emitters: {
    method: 'GET',
    path: '/me/emitters',
    note: 'Traders-category emitters for Leader broadcast',
  },
  list_exchange_balances: {
    method: 'GET',
    path: '/terminal/exchange-balances',
    note: 'live venue wallet; not stored; optional asset filter; not terminal/automation positions',
  },
  get_terminal_symbol_rules: { method: 'GET', path: '/terminal/symbol-rules' },
  place_terminal_order: {
    method: 'POST',
    path: '/terminal/place-order',
    note: 'personal or leader; leader needs Traders emitter_id from list_terminal_emitters',
  },
}
