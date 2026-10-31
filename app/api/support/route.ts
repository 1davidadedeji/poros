import { createHash } from 'node:crypto'
import { supportInstructions, validMessages } from '@/lib/support/knowledge'
import { allowSupportRequest } from '@/lib/support/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 30
const headers = { 'Cache-Control': 'no-store' }
const reply = (error: string, status: number) => Response.json({ error }, { status, headers })

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin || origin !== new URL(request.url).origin) return reply('Open support from the Poros website.', 403)
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply('Send a text question.', 415)
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_API_KEY
  if (!apiKey) return reply('AI support is temporarily unavailable. You can still explore the demo and workspace.', 503)
  let body: unknown
  try {
    // Bound bytes while reading; Content-Length alone can be omitted or forged.
    const reader = request.body?.getReader()
    if (!reader) return reply('Enter a question to get started.', 400)
    const chunks: Uint8Array[] = []; let length = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > 20000) { await reader.cancel(); return reply('That conversation is too long. Please start a new chat.', 413) }
      chunks.push(value)
    }
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch { return reply('Your message could not be read. Please try again.', 400) }
  const { messages, page } = (body ?? {}) as { messages?: unknown; page?: unknown }
  if (!validMessages(messages)) return reply('Please enter a shorter question, or start a new chat.', 400)
  const client = createHash('sha256').update(request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'shared').digest('hex')
  if (!allowSupportRequest(client)) return Response.json({ error: 'Support has reached its message limit. Please try again in an hour.' }, { status: 429, headers: { ...headers, 'Retry-After': '3600' } })
  const allowedPages = ['/', '/workspace', '/sign-in', '/demo', '/demo/estimate', '/demo/prior-auth', '/demo/appeal']
  try {
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', signal: AbortSignal.timeout(20000), cache: 'no-store',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_SUPPORT_MODEL || 'gpt-4.1-mini',
        instructions: `${supportInstructions}\nCurrent page: ${typeof page === 'string' && allowedPages.includes(page) ? page : '/'}`,
        input: messages, max_output_tokens: 450, store: false,
      }),
    })
    if (!upstream.ok) {
      // Never log the request, conversation, provider response body, or API key.
      console.warn('Poros support provider status:', upstream.status)
      return reply(upstream.status === 429 ? 'AI support is busy right now. Please try again shortly.' : 'AI support is temporarily unavailable. Please try again later.', 503)
    }
    const result = await upstream.json() as { status?: string; output?: { type: string; content?: { type: string; text?: string }[] }[] }
    const text = result.output?.filter(item => item.type === 'message').flatMap(item => item.content ?? []).filter(item => item.type === 'output_text').map(item => item.text ?? '').join('\n').trim()
    if (!text || result.status !== 'completed') return reply('I couldn’t finish that answer. Please try a shorter question.', 502)
    return Response.json({ message: text }, { headers })
  } catch { return reply('Support took too long to respond. Please try again.', 504) }
}
