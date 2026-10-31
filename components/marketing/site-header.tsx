'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { useAuth } from '@/lib/firebase/auth-context'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export function SiteHeader({ workspace = false }: { workspace?: boolean }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  return <header className="site-header">
    <Link className="brand" href="/" aria-label="Poros home"><span className="brand-mark">P</span><span>Poros</span></Link>
    <nav className="desktop-nav" aria-label="Primary navigation">
      <Link href="/#platform">Platform</Link><Link href="/#practice">For your practice</Link><Link href="/demo" aria-current={pathname.startsWith('/demo') ? 'page' : undefined}>Explore the demo</Link>
    </nav>
    <div className="header-actions"><Link className="header-account" href="/sign-in">{user ? 'Account' : 'Sign in'}</Link><ThemeToggle /><Link className="button button-dark" href={workspace ? '/demo' : '/workspace'}>{workspace ? 'View demo' : 'Open workspace'}<ArrowUpRight size={15} /></Link>
      <button className="mobile-menu theme-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-navigation">{open ? <X size={18} /> : <Menu size={18} />}</button>
    </div>
    {open && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation" onClick={() => setOpen(false)}><Link href="/#platform">Platform</Link><Link href="/#practice">For your practice</Link><Link href="/demo" aria-current={pathname.startsWith('/demo') ? 'page' : undefined}>Explore the demo</Link><Link href="/workspace">Open workspace</Link><Link href="/sign-in">{user ? 'Account' : 'Sign in'}</Link></nav>}
  </header>
}
