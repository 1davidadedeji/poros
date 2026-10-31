'use client'

import { useState } from 'react'
import { Download, ArrowUpRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EstimateCalculator({ compact = false, disabled = false, onSaveTask }: { compact?: boolean; disabled?: boolean; onSaveTask?: (summary: string) => Promise<boolean> }) {
  const [saved, setSaved] = useState(false)
  const [allowed, setAllowed] = useState(450)
  const [deductible, setDeductible] = useState(150)
  const [rate, setRate] = useState(20)
  const applied = Math.min(allowed, deductible)
  const patient = Math.round((applied + (allowed - applied) * rate / 100) * 100) / 100
  const insurer = Math.round((allowed - patient) * 100) / 100
  const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  function download() {
    const blob = new Blob([`Poros · Planning estimate\nAllowed amount: ${money(allowed)}\nRemaining deductible: ${money(deductible)}\nCoinsurance: ${rate}%\nPatient estimate: ${money(patient)}\nPlan estimate: ${money(insurer)}\n\nPlanning only. Verify benefits, coverage, copays and out-of-pocket limits with the payer. This is not a coverage guarantee.\n`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a'); link.href = url; link.download = 'poros-estimate.txt'; link.click(); URL.revokeObjectURL(url)
  }
  return <div className="estimate-tool">
    <div className="tool-heading"><span>Cost clarity</span><ArrowUpRight size={18} /></div>
    <h3>A clearer number.<br />Before the visit.</h3>
    <div className="estimate-inputs">
      <label>Allowed amount ($)<input type="number" min="0" max="1000000" step="0.01" value={allowed} onChange={e => setAllowed(Math.max(0, Math.min(1000000, Number(e.target.value) || 0)))} /></label>
      <label>Deductible remaining ($)<input type="number" min="0" max="1000000" step="0.01" value={deductible} onChange={e => setDeductible(Math.max(0, Math.min(1000000, Number(e.target.value) || 0)))} /></label>
    </div>
    <label className="range-label">Coinsurance <strong>{rate}%</strong><input aria-label="Coinsurance percentage" type="range" min="0" max="100" step="1" value={rate} onChange={e => setRate(Number(e.target.value))} /></label>
    <div className="estimate-figure" aria-live="polite"><div><span>Patient estimate</span><strong>{money(patient)}</strong></div><div><span>Plan estimate</span><b>{money(insurer)}</b></div></div>
    <div className="cost-distribution" role="img" aria-label={`Patient ${money(patient)}, plan ${money(insurer)}`}><span style={{ width: `${allowed ? patient / allowed * 100 : 0}%` }} /></div>
    <p className="tool-note">Planning estimate using your inputs. Excludes copays and out-of-pocket limits; verify coverage with the payer.</p>
    {!compact && <div className="estimate-actions"><Button variant="outline" onClick={download}><Download size={15} />Export estimate</Button>{onSaveTask && <Button disabled={disabled} onClick={async () => { setSaved(false); if (await onSaveTask(`${money(patient)} patient / ${money(allowed)} allowed`)) setSaved(true) }}><Plus size={15} />Add follow-up</Button>}</div>}
    {saved && <p role="status" className="tool-note">Follow-up saved to your worklist.</p>}
  </div>
}
