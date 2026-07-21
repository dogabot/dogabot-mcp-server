/**
 * Resolves node arguments to launch the MCP server entrypoint.
 * @param {{ distEntry: string; srcEntry: string; tsxCli: string }} paths
 * @param {(path: string) => boolean} exists
 * @returns {string[] | null}
 */
export function resolveDogabotMcpNodeArgs(paths, exists) {
  if (exists(paths.tsxCli) && exists(paths.srcEntry)) {
    return [paths.tsxCli, paths.srcEntry]
  }
  if (exists(paths.distEntry)) {
    return [paths.distEntry]
  }
  return null
}

export const BIN_ENTRY_ERROR =
  'dogabot-mcp: missing dist/index.js. Run "npm run build", or "npm install" for local tsx dev.'
