import { PriorAuthRequest } from '@/components/demo/prior-auth/prior-auth-request'
import { RouteFade } from '@/components/demo/route-fade'

export default function PriorAuthPage() {
  return (
    <RouteFade className="flex max-w-3xl flex-col gap-6">
      <div>
        <p className="text-[10px] font-semibold tracking-[.2em] text-muted-foreground uppercase">
          Flow B · From Clinical Note
        </p>
        <h2 className="mt-1 text-3xl">Prior Auth Assist</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Poros reads the visit documentation, drafts the request, and keeps the authorization moving.
        </p>
      </div>
      <PriorAuthRequest />
    </RouteFade>
  )
}
