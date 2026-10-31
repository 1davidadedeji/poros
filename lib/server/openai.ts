import { createHash } from 'node:crypto'
import { allowSupportRequest } from '@/lib/support/rate-limit'

// Shared guards for every route that calls the OpenAI Responses API.
export const noStore = { 'Cache-Control': 'no-store' }
export const reply = (error: string, status: number) => Response.json({ error }, { status, headers: noStore })

export const openAiKey = () => process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY
export const sameOrigin = (request: Request) => {
  const origin = request.headers.get('origin')
  return !!origin && origin === new URL(request.url).origin
}
export const isJson = (request: Request) => !!request.headers.get('content-type')?.startsWith('application/json')

// Bound bytes while reading; Content-Length alone can be omitted or forged.
export async function readJson(request: Request, maxBytes: number): Promise<{ ok: true; value: unknown } | { ok: false; status: 400 | 413 }> {
  try {
    const reader = request.body?.getReader()
    if (!reader) return { ok: false, status: 400 }
    const chunks: Uint8Array[] = []; let length = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > maxBytes) { await reader.cancel(); return { ok: false, status: 413 } }
      chunks.push(value)
    }
    return { ok: true, value: JSON.parse(Buffer.concat(chunks).toString('utf8')) }
  } catch { return { ok: false, status: 400 } }
}

// One per-client and global budget covers support and drafting together.
export function allowRequest(request: Request) {
  const client = createHash('sha256').update(request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'shared').digest('hex')
  return allowSupportRequest(client)
}
export const rateLimited = (error: string) => Response.json({ error }, { status: 429, headers: { ...noStore, 'Retry-After': '3600' } })

type ResponsesResult = { status?: string; output?: { type: string; content?: { type: string; text?: string }[] }[] }
export type ResponsesCall = { ok: true; status?: string; text: string } | { ok: false; providerStatus: number }

export async function callResponses(apiKey: string, body: Record<string, unknown>, timeoutMs: number, label: string): Promise<ResponsesCall> {
  const upstream = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST', signal: AbortSignal.timeout(timeoutMs), cache: 'no-store',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, store: false }),
  })
  if (!upstream.ok) {
    // Never log the request, conversation, provider response body, or API key.
    console.warn(`Poros ${label} provider status:`, upstream.status)
    return { ok: false, providerStatus: upstream.status }
  }
  const result = await upstream.json() as ResponsesResult
  const text = result.output?.filter(item => item.type === 'message').flatMap(item => item.content ?? []).filter(item => item.type === 'output_text').map(item => item.text ?? '').join('\n').trim() ?? ''
  return { ok: true, status: result.status, text }
}
