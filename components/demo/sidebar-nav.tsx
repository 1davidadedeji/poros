'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { useDemoState } from '@/lib/demo/context'

const links = [
  { href: '/demo', label: 'Overview' },
  { href: '/demo/estimate', label: 'Cost Estimate' },
  { href: '/demo/prior-auth', label: 'Prior Auth Assist' },
  { href: '/demo/appeal', label: 'Appeal Assist' },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { resetDemo } = useDemoState()

  return (
    <nav className="flex flex-wrap gap-1 p-2 md:h-full md:flex-1 md:flex-col md:flex-nowrap md:p-4" aria-label="Demo flows">
      {links.map((link) => {
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'rounded-md px-2.5 py-2 text-[10px] font-semibold tracking-[.12em] whitespace-nowrap uppercase transition-colors md:px-3 md:py-2.5 md:text-[11px] md:tracking-[.14em]',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
            aria-current={active ? 'page' : undefined}
          >
            {link.label}
          </Link>
        )
      })}
      <Link href="/workspace" className="mt-4 px-3 py-2 text-sm text-primary">Your workspace ↗</Link>
      <div className="ml-auto shrink-0 md:mt-auto md:ml-0 md:pt-4">
        <button
          type="button"
          onClick={resetDemo}
          className="w-full rounded-md px-2.5 py-2 text-left text-[10px] whitespace-nowrap md:px-3 md:py-2.5 font-semibold tracking-[.14em] text-muted-foreground uppercase hover:text-foreground"
        >
          Reset Demo
        </button>
      </div>
    </nav>
  )
}
