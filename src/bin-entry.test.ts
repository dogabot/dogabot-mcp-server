import { describe, expect, it } from 'vitest'
import {
  BIN_ENTRY_ERROR,
  resolveDogabotMcpLaunch,
  resolveDogabotMcpNodeArgs,
} from '../bin/bin-entry.mjs'

describe('resolveDogabotMcpLaunch', () => {
  const paths = {
    distEntry: '/pkg/dist/index.js',
    srcEntry: '/pkg/src/index.ts',
    tsxCli: '/pkg/node_modules/tsx/dist/cli.mjs',
  }

  it('prefers tsx + src spawn when both exist', () => {
    const exists = (p: string) => p === paths.tsxCli || p === paths.srcEntry
    expect(resolveDogabotMcpLaunch(paths, exists)).toEqual({
      mode: 'spawn',
      nodeArgs: [paths.tsxCli, paths.srcEntry],
    })
  })

  it('uses same-process import for dist (published / built)', () => {
    const exists = (p: string) => p === paths.distEntry
    expect(resolveDogabotMcpLaunch(paths, exists)).toEqual({
      mode: 'import',
      modulePath: paths.distEntry,
    })
  })

  it('returns null when nothing is available', () => {
    expect(resolveDogabotMcpLaunch(paths, () => false)).toBeNull()
  })

  it('resolveDogabotMcpNodeArgs stays compatible', () => {
    const exists = (p: string) => p === paths.distEntry
    expect(resolveDogabotMcpNodeArgs(paths, exists)).toEqual([paths.distEntry])
    expect(resolveDogabotMcpNodeArgs(paths, () => false)).toBeNull()
  })

  it('exports a stable error message', () => {
    expect(BIN_ENTRY_ERROR).toMatch(/dist\/index\.js/)
  })
})
