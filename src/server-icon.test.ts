import { describe, expect, it } from 'vitest'
import { dogabotServerIcons } from './server-icon.js'

describe('dogabotServerIcons', () => {
  it('returns a public HTTPS PNG for MCP serverInfo', () => {
    const icons = dogabotServerIcons()
    expect(icons).toHaveLength(1)
    expect(icons[0].mimeType).toBe('image/png')
    expect(icons[0].src).toBe('https://www.dogabot.com/dogabot-logo-email.png')
    expect(icons[0].sizes).toBeUndefined()
  })
})
