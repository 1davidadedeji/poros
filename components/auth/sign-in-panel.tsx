'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Eye, EyeOff, Mail, CheckCircle2 } from 'lucide-react'
import { useAuth, authErrorMessage } from '@/lib/firebase/auth-context'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/marketing/site-header'

type Mode = 'signin' | 'register' | 'reset'
export function SignInPanel() {
  const auth = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  function changeMode(next: Mode) { setMode(next); setPassword(''); setError(''); setNotice('') }
  async function run(action: () => Promise<void>, next?: () => void) {
    if (busy) return
    setBusy(true); setError(''); setNotice('')
    try { await action(); next?.() } catch (e) { setError(authErrorMessage(e)) } finally { setBusy(false) }
  }
  return <><SiteHeader /><main className="auth-page">
    <section className="auth-story"><p className="eyebrow">MORE ROOM FOR WHAT MATTERS</p><h1>Your practice.<br /><em>Your workspace.</em></h1><p>Pick up where you left off. Keep estimates, authorizations, and appeals moving in one place.</p><div className="auth-photo" role="img" aria-label="A clinician and practice manager working together" /></section>
    <section className="auth-panel" aria-labelledby="auth-title">
      {auth.loading ? <p role="status">Checking your account…</p> : auth.user ? <>
        <CheckCircle2 className="auth-icon" size={28} /><h2 id="auth-title">You’re signed in.</h2><p>{auth.user.email}</p>
        <Link className="button button-dark" href="/workspace">Continue to workspace <ArrowUpRight size={16} /></Link>
        {!auth.user.emailVerified && <div className="verification-note"><p>Verify your email to confirm this address belongs to you.</p><Button disabled={busy} variant="outline" onClick={() => run(auth.sendVerification, () => setNotice('Verification email sent. Follow the link in your inbox, then sign in again.'))}>Send verification email</Button></div>}
        <Button disabled={busy} variant="ghost" onClick={() => run(auth.signOutUser)}>Sign out</Button>
      </> : <>
        <p className="eyebrow">WELCOME TO POROS</p><h2 id="auth-title">{mode === 'register' ? 'Make space for better work.' : mode === 'reset' ? 'Let’s get you back in.' : 'Good to see you.'}</h2>
        <p>{mode === 'reset' ? 'Enter your email to request a password reset link.' : mode === 'register' ? 'Create your personal practice workspace.' : 'Sign in to your cloud workspace.'}</p>
        {mode !== 'reset' && <><Button className="google-signin" variant="outline" disabled={busy || !auth.isFirebaseConfigured} onClick={() => run(auth.signInWithGoogle, () => router.replace('/workspace'))}>Continue with Google <ArrowUpRight size={16} /></Button><div className="auth-divider"><span>or use your email</span></div></>}
        <form onSubmit={e => { e.preventDefault(); run(async () => {
          if (mode === 'reset') { await auth.resetPassword(email.trim()); setNotice('If this address has an account, a reset link is on its way. Check your inbox and spam folder.'); return }
          if (mode === 'register') { await auth.createAccount(email.trim(), password); setPassword(''); return }
          await auth.signInWithEmail(email.trim(), password); router.replace('/workspace')
        }) }}>
          <label>Email address<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourpractice.com" disabled={busy} /></label>
          {mode !== 'reset' && <label>Password<div className="password-field"><input type={visible ? 'text' : 'password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required minLength={mode === 'register' ? 6 : undefined} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} /><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>}
          <Button type="submit" disabled={busy || !auth.isFirebaseConfigured} className="auth-submit">{busy ? 'Please wait…' : mode === 'reset' ? 'Send reset link' : mode === 'register' ? 'Create account' : 'Sign in with email'}{mode === 'reset' ? <Mail size={16} /> : <ArrowUpRight size={16} />}</Button>
        </form>
        {mode === 'signin' && <button className="auth-text-button" disabled={busy} onClick={() => changeMode('reset')}>Forgot your password?</button>}
        <p className="auth-switch">{mode === 'signin' ? 'New to Poros? ' : mode === 'register' ? 'Already have an account? ' : ''}<button disabled={busy} onClick={() => changeMode(mode === 'signin' ? 'register' : 'signin')}>{mode === 'signin' ? 'Create an account' : 'Back to sign in'}</button></p>
        {!auth.isFirebaseConfigured && <p role="status">Cloud sign-in is not available yet. You can still use the local workspace.</p>}
      </>}
      {error && <p className="auth-error" role="alert">{error}</p>}{notice && <p className="auth-notice" role="status">{notice}</p>}
      <div className="auth-local"><Link href="/workspace">Continue with local workspace <ArrowUpRight size={14} /></Link><p>Local tasks stay on this device. Signing in opens your separate cloud workspace.</p></div>
    </section>
  </main></>
}
