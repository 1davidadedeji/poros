import { SiteHeader } from '@/components/marketing/site-header'
import { SidebarNav } from './sidebar-nav'
import { PatientHeader } from './patient-header'

export function DemoShell({ children }: { children: React.ReactNode }) {
  return <><SiteHeader /><div className="demo-shell">
    <aside className="demo-sidebar"><p className="eyebrow demo-nav-title">THE PATIENT JOURNEY</p><SidebarNav /></aside>
    <div className="demo-body"><PatientHeader /><main id="main-content"><div className="demo-banner"><span>Interactive demo · Sample patient · No requests are sent to payers</span></div>{children}</main></div>
  </div></>
}
