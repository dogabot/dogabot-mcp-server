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
  types: z.array(automationTypeSchema).optional(),
})

export const getAutomationInput = z.object({
  type: z.enum(['follower', 'bot', 'emitter', 'portfolio']),
  id: z.number().int().positive(),
})

export const listOrdersInput = z.object({
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  exchange: z.string().optional(),
  symbol: z.string().optional(),
})

export const listSignalsInput = listOrdersInput

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

export const searchMarketplaceInput = z.object({
  q: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional(),
})

export const listMarketsInput = z.object({
  exchange: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
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

export type ReadToolName =
  | 'get_me'
  | 'list_automations'
  | 'get_automation'
  | 'get_user_statistics'
  | 'get_positions'
  | 'list_orders'
  | 'list_signals'
  | 'get_backtest_quota'
  | 'list_backtests'
  | 'get_backtest'
  | 'search_marketplace'
  | 'list_markets'
  | 'get_ticker'
  | 'get_candles'

export const READ_TOOLS: ReadToolName[] = [
  'get_me',
  'list_automations',
  'get_automation',
  'get_user_statistics',
  'get_positions',
  'list_orders',
  'list_signals',
  'get_backtest_quota',
  'list_backtests',
  'get_backtest',
  'search_marketplace',
  'list_markets',
  'get_ticker',
  'get_candles',
]

/** Maps MCP tool names to REST endpoints (read-only v1). */
export const toolRouteMap: Record<ReadToolName, { method: string; path: string; note?: string }> = {
  get_me: { method: 'GET', path: '/me' },
  list_automations: { method: 'POST', path: '/automations/summary' },
  get_automation: { method: 'GET', path: '/:type/:id', note: 'resolved at runtime' },
  get_user_statistics: { method: 'GET', path: '/me/statistics' },
  get_positions: { method: 'GET', path: '/me/positions' },
  list_orders: { method: 'GET', path: '/orders' },
  list_signals: { method: 'GET', path: '/signals' },
  get_backtest_quota: { method: 'GET', path: '/backtest/quota' },
  list_backtests: { method: 'GET', path: '/backtests' },
  get_backtest: { method: 'GET', path: '/backtest/:job_id', note: 'resolved at runtime' },
  search_marketplace: { method: 'GET', path: '/marketplace/search' },
  list_markets: { method: 'GET', path: '/markets' },
  get_ticker: { method: 'GET', path: '/ticker' },
  get_candles: { method: 'GET', path: '/datafeed/history' },
}
