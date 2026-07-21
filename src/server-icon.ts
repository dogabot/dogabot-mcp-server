export type McpIcon = {
  src: string
  mimeType?: string
  sizes?: string[]
  theme?: 'light' | 'dark'
}

/** Public 56×56 PNG (same asset as webapp/email logo). */
export const DOGABOT_MCP_ICON_URL = 'https://www.dogabot.com/dogabot-logo-email.png'

let cachedIcons: McpIcon[] | undefined

/** MCP protocol icons for serverInfo (shown in clients that support Implementation.icons). */
export function dogabotServerIcons(): McpIcon[] {
  if (cachedIcons) return cachedIcons

  // HTTPS URL per MCP spec examples; omit `sizes` for older clients that mishandle arrays.
  cachedIcons = [
    {
      src: process.env.DOGABOT_MCP_ICON_URL ?? DOGABOT_MCP_ICON_URL,
      mimeType: 'image/png',
    },
  ]
  return cachedIcons
}
