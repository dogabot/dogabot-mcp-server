import { describe, expect, it } from 'vitest'
import { BIN_ENTRY_ERROR, resolveDogabotMcpNodeArgs } from '../bin/bin-entry.mjs'

describe('resolveDogabotMcpNodeArgs', () => {
  const paths = {
    distEntry: '/pkg/dist/index.js',
    srcEntry: '/pkg/src/index.ts',
    tsxCli: '/pkg/node_modules/tsx/dist/cli.mjs',
  }

  it('prefers tsx + src when both exist', () => {
    const exists = (p: string) => p === paths.tsxCli || p === paths.srcEntry
    expect(resolveDogabotMcpNodeArgs(paths, exists)).toEqual([paths.tsxCli, paths.srcEntry])
  })

  it('falls back to dist when tsx or src is missing', () => {
    const exists = (p: string) => p === paths.distEntry
    expect(resolveDogabotMcpNodeArgs(paths, exists)).toEqual([paths.distEntry])
  })

  it('returns null when nothing is available', () => {
    expect(resolveDogabotMcpNodeArgs(paths, () => false)).toBeNull()
  })

  it('exports a stable error message', () => {
    expect(BIN_ENTRY_ERROR).toMatch(/dist\/index\.js/)
  })
})
