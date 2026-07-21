import { describe, expect, it } from 'vitest'
import { listBacktestsInput } from './schemas.js'
import { zodMcpInputSchema } from './mcp-json-schema.js'

describe('zodMcpInputSchema', () => {
  it('emits properties without $schema for list_backtests', () => {
    const schema = zodMcpInputSchema(listBacktestsInput)
    expect(schema).not.toHaveProperty('$schema')
    expect(schema).toHaveProperty('properties')
    const props = schema.properties as Record<string, unknown>
    expect(props).toHaveProperty('sort_by')
    expect(props).toHaveProperty('min_pnl')
    expect(props).toHaveProperty('min_sharpe')
  })
})
