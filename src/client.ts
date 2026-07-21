export type DogabotClientConfig = {
  apiKey: string
  baseUrl?: string
}

type ApiEnvelope<T = unknown> = {
  data?: T
  items?: unknown[]
  total?: number
  limit?: number
  offset?: number
  error?: string
  message?: string
}

export class DogabotClient {
  private readonly apiKey: string
  private readonly baseUrl: string

  constructor(config: DogabotClientConfig) {
    if (!config.apiKey?.startsWith('dbk_')) {
      throw new Error('DOGABOT_API_KEY must be a dogabot API key (dbk_live_... or dbk_test_...)')
    }
    this.apiKey = config.apiKey
    this.baseUrl = (config.baseUrl ?? process.env.DOGABOT_API_BASE_URL ?? 'https://api.dogabot.com/api/v1').replace(/\/$/, '')
  }

  async request<T = unknown>(
    method: string,
    path: string,
    options?: { query?: Record<string, string | number | undefined>; body?: unknown },
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`)
    if (options?.query) {
      for (const [k, v] of Object.entries(options.query)) {
        if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
      }
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    })

    const text = await res.text()
    let parsed: ApiEnvelope<T> = {}
    if (text) {
      try {
        parsed = JSON.parse(text) as ApiEnvelope<T>
      } catch {
        throw new Error(`Invalid JSON response (${res.status}): ${text.slice(0, 200)}`)
      }
    }

    if (!res.ok) {
      throw new Error(parsed.error ?? `HTTP ${res.status}`)
    }

    if (parsed.data !== undefined) return parsed.data as T
    if (parsed.items !== undefined) return parsed as unknown as T
    return parsed as unknown as T
  }
}

export function automationDetailPath(type: string, id: number): string {
  const plural = type === 'portfolio' ? 'portfolios' : `${type}s`
  return `/${plural}/${id}`
}
