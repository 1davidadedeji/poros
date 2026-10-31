'use client'

import { mockProcedures } from '@/lib/data/mock-procedures'
import { useDemoState } from '@/lib/demo/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ProcedurePicker() {
  const { selectedCptCode, selectProcedure, generateEstimate } = useDemoState()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule a procedure</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold tracking-[.14em] text-muted-foreground uppercase">
            CPT / Procedure code
          </span>
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedCptCode ?? ''}
            onChange={(event) => selectProcedure(event.target.value)}
          >
            <option value="" disabled>
              Select a procedure…
            </option>
            {mockProcedures.map((procedure) => (
              <option key={procedure.code} value={procedure.code}>
                {procedure.code} — {procedure.description}
              </option>
            ))}
          </select>
        </label>

        {selectedCptCode && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {mockProcedures.find((p) => p.code === selectedCptCode)?.requiresPriorAuth ? (
              <Badge variant="warning">Requires prior auth</Badge>
            ) : (
              <Badge variant="success">Auto-approved</Badge>
            )}
          </div>
        )}

        <Button type="button" disabled={!selectedCptCode} onClick={generateEstimate} className="w-fit">
          Generate Estimate
        </Button>
      </CardContent>
    </Card>
  )
}
