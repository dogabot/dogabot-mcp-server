#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BIN_ENTRY_ERROR, resolveDogabotMcpNodeArgs } from './bin-entry.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const nodeArgs = resolveDogabotMcpNodeArgs(
  {
    distEntry: join(root, 'dist', 'index.js'),
    srcEntry: join(root, 'src', 'index.ts'),
    tsxCli: join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs'),
  },
  existsSync,
)

if (!nodeArgs) {
  console.error(BIN_ENTRY_ERROR)
  process.exit(1)
}

execFileSync(process.execPath, nodeArgs, { stdio: 'inherit', cwd: root, env: process.env })
