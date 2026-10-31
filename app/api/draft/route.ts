import { getDenialByCode, getProcedureByCode, mockPatient } from '@/lib/data'
import { buildDraftInput, draftInstructions, draftSchema, parseDraft, validNote } from '@/lib/demo/draft'
import { allowRequest, callResponses, isJson, noStore, openAiKey, rateLimited, readJson, reply, sameOrigin } from '@/lib/server/openai'

export const runtime = 'nodejs'
export const maxDuration = 30

// Drafts the sample appeal from the editable note. The client falls back to the fixed template on any error.
export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply('Open drafting from the Poros demo.', 403)
  if (!isJson(request)) return reply('Send the draft request as JSON.', 415)
  const apiKey = openAiKey()
  if (!apiKey) return reply('AI drafting is not configured.', 503)
  const body = await readJson(request, 12000)
  if (!body.ok) return body.status === 413 ? reply('The clinical note is too long.', 413) : reply('The draft request could not be read.', 400)
  const { denialCode, procedureCode, note } = (body.value ?? {}) as { denialCode?: unknown; procedureCode?: unknown; note?: unknown }
  // Guideline text is looked up server-side, never accepted from the client.
  const denial = typeof denialCode === 'string' ? getDenialByCode(denialCode) : undefined
  const procedure = typeof procedureCode === 'string' ? getProcedureByCode(procedureCode) : undefined
  if (!denial || !procedure) return reply('Unknown denial or procedure.', 400)
  if (!validNote(note)) return reply('Enter a clinical note of up to 4,000 characters.', 400)
  if (!allowRequest(request)) return rateLimited('AI drafting has reached its hourly limit.')
  try {
    const result = await callResponses(apiKey, {
      model: process.env.OPENAI_DRAFT_MODEL || process.env.OPENAI_SUPPORT_MODEL || 'gpt-4.1-mini',
      instructions: draftInstructions,
      input: buildDraftInput({
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        patientName: mockPatient.name, patientDob: mockPatient.dob, payerName: mockPatient.plan.payerName,
        procedure: `${procedure.code} — ${procedure.description}`, denial: `${denial.code} — ${denial.label}`,
        guidelineSource: denial.guideline.source, guidelineText: denial.guideline.text, note,
      }),
      text: { format: { type: 'json_schema', name: 'appeal_draft', strict: true, schema: draftSchema } },
      max_output_tokens: 1800, temperature: 0.2,
    }, 25000, 'draft')
    if (!result.ok) return reply(result.providerStatus === 429 ? 'AI drafting is busy right now.' : 'AI drafting is temporarily unavailable.', 503)
    const draft = result.status === 'completed' ? parseDraft(result.text, note) : null
    if (!draft) return reply('The AI draft was incomplete.', 502)
    return Response.json({ draft }, { headers: noStore })
  } catch { return reply('AI drafting took too long.', 504) }
}
