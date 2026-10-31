import { ProcedurePicker } from '@/components/demo/estimate/procedure-picker'
import { EstimateResult } from '@/components/demo/estimate/estimate-result'
import { RouteFade } from '@/components/demo/route-fade'

export default function EstimatePage() {
  return (
    <RouteFade className="flex max-w-3xl flex-col gap-6">
      <div>
        <p className="text-[10px] font-semibold tracking-[.2em] text-muted-foreground uppercase">
          Flow A · At Scheduling
        </p>
        <h2 className="mt-1 text-3xl">Cost Estimate</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Give the patient a plain-language estimate of what they&apos;ll owe before they sit in the chair.
        </p>
      </div>
      <ProcedurePicker />
      <EstimateResult />
    </RouteFade>
  )
}
