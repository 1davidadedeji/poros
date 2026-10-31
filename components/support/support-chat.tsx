'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, X, Send, RotateCcw, ArrowUpRight } from 'lucide-react'
import type { SupportMessage } from '@/lib/support/knowledge'

export function SupportChat() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState<SupportMessage[] | null>(null)
  const panel = useRef<HTMLDialogElement>(null)
  const launcher = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)
  const bottom = useRef<HTMLDivElement>(null)
  const request = useRef<AbortController | null>(null)
  const pending = useRef(false)
  useEffect(() => () => request.current?.abort(), [])
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }) }, [messages, busy, error])
  function show() { setOpen(true); panel.current?.showModal(); setTimeout(() => input.current?.focus(), 0) }
  function close() { panel.current?.close(); setOpen(false); launcher.current?.focus() }
  function reset() { request.current?.abort(); request.current = null; pending.current = false; setBusy(false); setMessages([]); setError(''); setRetry(null); setDraft(''); input.current?.focus() }
  async function send(history?: SupportMessage[]) {
    if (pending.current || (!history && !draft.trim())) return
    const next: SupportMessage[] = history ?? [...messages, { role: 'user', content: draft.trim() }]
    // Preserve complete user/assistant pairs within the bounded context window.
    const context = next.slice(-11)
    const controller = new AbortController(); request.current = controller
    pending.current = true; setBusy(true); setError(''); setRetry(null); setMessages(next); setDraft('')
    try {
      const response = await fetch('/api/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: context, page: pathname }), signal: controller.signal })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Support could not respond. Please try again.')
      if (!controller.signal.aborted) setMessages([...next, { role: 'assistant', content: data.message }])
    } catch (e) {
      if (!controller.signal.aborted) { setError(e instanceof Error ? e.message : 'Please check your connection and try again.'); setRetry(next) }
    } finally {
      if (request.current === controller) { pending.current = false; setBusy(false); input.current?.focus() }
    }
  }
  const starters = pathname === '/workspace' ? ['How do I save an estimate follow-up?', 'Where are my tasks saved?', 'How do overdue tasks work?'] : ['What can I do with Poros?', 'How do I get started?', 'Can I try the demo?']
  return <>
    <button ref={launcher} type="button" className="support-launcher" aria-haspopup="dialog" aria-expanded={open} aria-controls="poros-support" onClick={show}><MessageSquare size={18} /><span>Ask Poros</span></button>
    <dialog ref={panel} id="poros-support" className="support-dialog" aria-labelledby="support-title" onCancel={e => { e.preventDefault(); close() }} onClose={() => setOpen(false)} onClick={e => { if (e.target === panel.current) { const r = panel.current.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close() } }}>
      <div className="support-heading"><div><span className="eyebrow">A LITTLE HELP, RIGHT HERE</span><h2 id="support-title">Poros support</h2><p>AI assistant · Product guidance</p></div><div><button type="button" aria-label="Start a new chat" onClick={reset}><RotateCcw size={17} /></button><button type="button" aria-label="Close support" onClick={close}><X size={20} /></button></div></div>
      <div className="support-messages" role="log" aria-label="Support conversation" aria-live="polite" aria-relevant="additions text">
        {messages.length === 0 && <div className="support-welcome"><MessageSquare size={26} /><h3>A clearer next step.</h3><p>I can help you find your way around Poros, from your first task to your next estimate.</p><div className="support-starters">{starters.map(question => <button type="button" key={question} onClick={() => send([{ role: 'user', content: question }])}>{question}<ArrowUpRight size={14} /></button>)}</div></div>}
        {messages.map((message, i) => <div className={`support-message support-${message.role}`} key={i}><span>{message.role === 'user' ? 'You' : 'Poros AI'}</span><p>{message.content}</p></div>)}
        {busy && <p className="support-thinking" role="status">Thinking through your question…</p>}
        {error && <div className="support-error" role="alert"><p>{error}</p><button type="button" onClick={() => retry && send(retry)}>Try again</button><button type="button" onClick={reset}>New chat</button></div>}
        <div ref={bottom} />
      </div>
      <div className="support-links"><Link href="/workspace" onClick={close}>Workspace <ArrowUpRight size={12} /></Link><Link href="/demo" onClick={close}>Demo <ArrowUpRight size={12} /></Link><Link href="/sign-in" onClick={close}>Account <ArrowUpRight size={12} /></Link></div>
      <form className="support-composer" onSubmit={e => { e.preventDefault(); send() }}><label className="sr-only" htmlFor="support-question">Your question</label><textarea ref={input} id="support-question" rows={2} maxLength={2000} placeholder="How can I help?" value={draft} disabled={busy || !!retry} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send() } }} /><button type="submit" aria-label="Send question" disabled={busy || !draft.trim() || !!retry}><Send size={18} /></button></form>
      <p className="support-privacy">AI can make mistakes. Messages are sent to OpenAI. Please leave out patient details and passwords.</p>
    </dialog>
  </>
}
