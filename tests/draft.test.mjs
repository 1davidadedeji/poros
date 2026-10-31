import test from 'node:test'
import assert from 'node:assert/strict'
import { buildDraftInput, draftSchema, parseDraft, quoteInNote, validNote } from '../lib/demo/draft.ts'

const note = 'Failed conservative management including NSAIDs and one corticosteroid injection; completed a 4-week course of physical therapy without resolution. Exam notable for a positive McMurray test.'
const draft = (overrides = {}) => JSON.stringify({
  extracted_facts: ['Completed 4 weeks of physical therapy.'],
  criteria_met: [{ criterion: 'Positive provocative exam', supporting_quote: 'positive McMurray test' }],
  criteria_not_supported: [{ criterion: '6 weeks of conservative management', reason: 'Physical therapy lasted 4 weeks.' }],
  letter_text: 'To the Utilization Review Department, ...',
  ...overrides,
})

test('quotes must appear word for word in the note', () => {
  assert.ok(quoteInNote('positive McMurray test', note))
  assert.ok(quoteInNote('  “Completed a 4-week   course of physical therapy.”', note))
  for (const quote of ['6 weeks of physical therapy', 'McMurray', 'NSAIDs ... physical therapy', 'positive Lachman test']) assert.equal(quoteInNote(quote, note), false)
})

test('drafts keep grounded criteria and demote unquoted ones', () => {
  const ok = parseDraft(draft(), note)
  assert.equal(ok.criteriaMet.length, 1)
  assert.equal(ok.criteriaNotSupported.length, 1)
  assert.deepEqual(ok.warnings, [])
  const invented = parseDraft(draft({ criteria_met: [{ criterion: '6 weeks of therapy', supporting_quote: 'completed 6 weeks of physical therapy' }] }), note)
  assert.equal(invented.criteriaMet.length, 0)
  assert.equal(invented.criteriaNotSupported.length, 2)
  assert.equal(invented.warnings.length, 1)
})

test('malformed drafts are rejected so the template is used', () => {
  for (const text of ['not json', 'null', draft({ letter_text: '' }), draft({ extracted_facts: 'one fact' }), draft({ criteria_met: [{ criterion: 'x' }] }), draft({ criteria_not_supported: Array(21).fill({ criterion: 'x', reason: 'y' }) })]) assert.equal(parseDraft(text, note), null)
})

test('note and input are bounded and labelled', () => {
  assert.ok(validNote(note))
  for (const value of ['', '   ', 'x'.repeat(4001), 42, null]) assert.equal(validNote(value), false)
  const input = buildDraftInput({ date: 'Oct 31, 2026', patientName: 'Maria Torres', patientDob: '1979-03-14', payerName: 'Payer', procedure: '29881', denial: 'CO-50', guidelineSource: 'MP-247', guidelineText: 'Requires 6 weeks.', note })
  assert.match(input, /illustrative, not real payer policy/)
  assert.ok(input.includes(note))
  assert.deepEqual(draftSchema.required, ['extracted_facts', 'criteria_met', 'criteria_not_supported', 'letter_text'])
})
