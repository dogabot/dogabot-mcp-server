/**
 * Resolves how to launch the MCP server entrypoint.
 * Published installs use same-process import of dist (avoids an extra Node under npx).
 * Local checkouts prefer tsx + src via a child process when both exist.
 *
 * @param {{ distEntry: string; srcEntry: string; tsxCli: string }} paths
 * @param {(path: string) => boolean} exists
 * @returns {{ mode: 'import'; modulePath: string } | { mode: 'spawn'; nodeArgs: string[] } | null}
 */
export function resolveDogabotMcpLaunch(paths, exists) {
  if (exists(paths.tsxCli) && exists(paths.srcEntry)) {
    return { mode: 'spawn', nodeArgs: [paths.tsxCli, paths.srcEntry] }
  }
  if (exists(paths.distEntry)) {
    return { mode: 'import', modulePath: paths.distEntry }
  }
  return null
}

/** @deprecated Prefer resolveDogabotMcpLaunch — kept for older tests/callers. */
export function resolveDogabotMcpNodeArgs(paths, exists) {
  const launch = resolveDogabotMcpLaunch(paths, exists)
  if (!launch) return null
  if (launch.mode === 'spawn') return launch.nodeArgs
  return [launch.modulePath]
}

export const BIN_ENTRY_ERROR =
  'dogabot-mcp: missing dist/index.js. Run "npm run build", or "npm install" for local tsx dev.'
