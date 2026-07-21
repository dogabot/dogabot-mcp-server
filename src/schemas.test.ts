import { describe, expect, it } from 'vitest'
import {
  getPnlSeriesInput,
  getPositionInput,
  listAutomationsInput,
  listBacktestsInput,
  listOrdersInput,
  listSignalsInput,
  READ_TOOLS,
  toolRouteMap,
} from './schemas.js'
import { toolDefinitions } from './tools.js'

describe('read tool manifest', () => {
  it('maps every read tool to a REST route', () => {
    for (const tool of READ_TOOLS) {
      expect(toolRouteMap[tool]).toBeDefined()
      expect(toolRouteMap[tool].method).toMatch(/GET|POST/)
    }
  })

  it('registers the same tools in the MCP manifest', () => {
    expect(toolDefinitions.map((t) => t.name).sort()).toEqual([...READ_TOOLS].sort())
  })

  it('accepts list_backtests sort params', () => {
    const parsed = listBacktestsInput.parse({
      sort_by: 'roi',
      sort_dir: 'desc',
      sort_by_2: 'daily_pnl_std_dev',
      sort_dir_2: 'asc',
      status: 'completed',
      min_pnl: 1000,
      min_sharpe: 2,
    })
    expect(parsed.sort_by).toBe('roi')
    expect(parsed.min_pnl).toBe(1000)
  })

  it('rejects invalid list_backtests sort_by', () => {
    expect(() => listBacktestsInput.parse({ sort_by: 'max_drawdown' })).toThrow()
  })

  it('accepts list_automations sort and filter params', () => {
    const parsed = listAutomationsInput.parse({
      sort_by: 'pnl',
      sort_dir: 'asc',
      types: ['bot'],
    })
    expect(parsed.sort_by).toBe('pnl')
    expect(parsed.types).toEqual(['bot'])
  })

  it('advertises list_backtests metric filters in MCP tool schema', () => {
    const tool = toolDefinitions.find((t) => t.name === 'list_backtests')
    expect(tool).toBeDefined()
    const props = (tool!.inputSchema as { properties?: Record<string, unknown> }).properties
    expect(props).toHaveProperty('min_pnl')
    expect(props).toHaveProperty('sort_by_2')
  })

  it('accepts get_pnl_series input with period', () => {
    const parsed = getPnlSeriesInput.parse({ type: 'emitter', id: 13720, period: '30d' })
    expect(parsed.period).toBe('30d')
  })

  it('accepts get_position input', () => {
    const parsed = getPositionInput.parse({ type: 'bot', id: 1 })
    expect(parsed.type).toBe('bot')
  })

  it('requires emitter_id for list_signals', () => {
    expect(() => listSignalsInput.parse({})).toThrow()
    expect(listSignalsInput.parse({ emitter_id: 13720 }).emitter_id).toBe(13720)
  })

  it('requires exactly one of follower_id or bot_id for list_orders', () => {
    expect(() => listOrdersInput.parse({})).toThrow(/follower_id or bot_id/)
    expect(() => listOrdersInput.parse({ follower_id: 1, bot_id: 2 })).toThrow(/follower_id or bot_id/)
    expect(listOrdersInput.parse({ follower_id: 9 }).follower_id).toBe(9)
    expect(listOrdersInput.parse({ bot_id: 3 }).bot_id).toBe(3)
  })
})
