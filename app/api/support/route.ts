import { supportInstructions, validMessages } from '@/lib/support/knowledge'
import { allowRequest, callResponses, isJson, noStore, openAiKey, rateLimited, readJson, reply, sameOrigin } from '@/lib/server/openai'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply('Open support from the Poros website.', 403)
  if (!isJson(request)) return reply('Send a text question.', 415)
  const apiKey = openAiKey()
  if (!apiKey) return reply('AI support is temporarily unavailable. You can still explore the demo and workspace.', 503)
  const body = await readJson(request, 20000)
  if (!body.ok) return body.status === 413 ? reply('That conversation is too long. Please start a new chat.', 413) : reply('Your message could not be read. Please try again.', 400)
  const { messages, page } = (body.value ?? {}) as { messages?: unknown; page?: unknown }
  if (!validMessages(messages)) return reply('Please enter a shorter question, or start a new chat.', 400)
  if (!allowRequest(request)) return rateLimited('Support has reached its message limit. Please try again in an hour.')
  const allowedPages = ['/', '/workspace', '/sign-in', '/demo', '/demo/estimate', '/demo/prior-auth', '/demo/appeal']
  try {
    const result = await callResponses(apiKey, {
      model: process.env.OPENAI_SUPPORT_MODEL || 'gpt-4.1-mini',
      instructions: `${supportInstructions}\nCurrent page: ${typeof page === 'string' && allowedPages.includes(page) ? page : '/'}`,
      input: messages, max_output_tokens: 450,
    }, 20000, 'support')
    if (!result.ok) return reply(result.providerStatus === 429 ? 'AI support is busy right now. Please try again shortly.' : 'AI support is temporarily unavailable. Please try again later.', 503)
    if (!result.text || result.status !== 'completed') return reply('I couldn’t finish that answer. Please try a shorter question.', 502)
    return Response.json({ message: result.text }, { headers: noStore })
  } catch { return reply('Support took too long to respond. Please try again.', 504) }
}
