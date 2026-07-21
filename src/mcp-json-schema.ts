import { zodToJsonSchema } from 'zod-to-json-schema'
import type { ZodTypeAny } from 'zod'

/** JSON Schema for MCP tools/list — derived from Zod so validation and advertised params stay in sync. */
export function zodMcpInputSchema(schema: ZodTypeAny): Record<string, unknown> {
  const json = zodToJsonSchema(schema, { $refStrategy: 'none', target: 'openApi3' })
  const { $schema: _schema, ...rest } = json as Record<string, unknown>
  return rest
}
