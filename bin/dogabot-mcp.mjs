#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { BIN_ENTRY_ERROR, resolveDogabotMcpLaunch } from './bin-entry.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const launch = resolveDogabotMcpLaunch(
  {
    distEntry: join(root, 'dist', 'index.js'),
    srcEntry: join(root, 'src', 'index.ts'),
    tsxCli: join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs'),
  },
  existsSync,
)

if (!launch) {
  console.error(BIN_ENTRY_ERROR)
  process.exit(1)
}

if (launch.mode === 'import') {
  // Same process as the bin — fewer nested PIDs under `npx` / Cursor mcp-process.
  await import(pathToFileURL(launch.modulePath).href)
} else {
  const child = spawn(process.execPath, launch.nodeArgs, {
    stdio: 'inherit',
    cwd: root,
    env: process.env,
  })
  const forward = (signal) => {
    if (!child.killed) child.kill(signal)
  }
  process.on('SIGINT', () => forward('SIGINT'))
  process.on('SIGTERM', () => forward('SIGTERM'))
  const code = await new Promise((resolve) => {
    child.on('error', (err) => {
      console.error(err)
      resolve(1)
    })
    child.on('exit', (exitCode, signal) => {
      if (signal) resolve(1)
      else resolve(exitCode ?? 1)
    })
  })
  process.exit(code)
}
