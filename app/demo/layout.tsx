import type { Metadata } from 'next'

import { DemoProvider } from '@/lib/demo/context'
import { DemoShell } from '@/components/demo/demo-shell'

export const metadata: Metadata = {
  title: 'Poros Demo | Maria Torres',
  description: 'Interactive walkthrough of the Poros cost estimate, prior auth, and appeal flows for one patient.',
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoProvider><DemoShell>{children}</DemoShell></DemoProvider>
}
