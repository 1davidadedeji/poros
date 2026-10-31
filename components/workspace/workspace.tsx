'use client'
import { useMemo, useState } from 'react'
import { ArrowUpRight, Check, Download, Plus, Search, Trash2, ClipboardList, Cloud, HardDrive, Pencil, Clock3 } from 'lucide-react'
import { SiteHeader } from '@/components/marketing/site-header'
import { Button } from '@/components/ui/button'
import { WorkflowChart } from './workflow-chart'
import { EstimateCalculator } from './estimate-calculator'
import { useAuth } from '@/lib/firebase/auth-context'
import { useWorkItems } from '@/lib/workspace/use-work-items'
import { csvForTasks, taskKinds, taskStatuses, type WorkItem } from '@/lib/workspace/tasks'

export function Workspace() {
  const { user } = useAuth()
  return <WorkspaceContent key={user?.uid ?? 'local'} />
}

function WorkspaceContent() {
  const { user, loading: authLoading, isFirebaseConfigured, signOutUser } = useAuth()
  const { items, loading, busy, error, ready, save } = useWorkItems()
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All tasks')
  const [showForm, setShowForm] = useState(false)
  const [notice, setNotice] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<WorkItem['kind']>('Estimate')
  const [due, setDue] = useState('')
  const [editing, setEditing] = useState<WorkItem | null>(null)
  const [dueFilter, setDueFilter] = useState(false)
  const today = new Date().toLocaleDateString('en-CA')
  const overdue = items.filter(item => item.status !== 'Completed' && item.due < today).length
  function openForm(item?: WorkItem) {
    setEditing(item ?? null); setTitle(item?.title ?? ''); setKind(item?.kind ?? 'Estimate'); setDue(item?.due ?? ''); setShowForm(true)
  }
  const filtered = useMemo(() => items.filter(item => (!dueFilter || (item.status !== 'Completed' && item.due < today)) && (filter === 'All tasks' || item.status === filter) && `${item.title} ${item.kind}`.toLowerCase().includes(query.toLowerCase())).sort((a,b) => a.due.localeCompare(b.due)), [items, filter, query, dueFilter, today])
  const completed = items.filter(item => item.status === 'Completed').length
  async function authenticate() {
    setAuthError(''); setAuthBusy(true)
    try { await signOutUser() }
    catch { setAuthError('Sign-in could not be completed. Allow the sign-in popup and try again. Your existing tasks are unchanged.') }
    finally { setAuthBusy(false) }
  }
  function exportTasks() {
    const url = URL.createObjectURL(new Blob([csvForTasks(filtered)], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a'); a.href = url; a.download = 'poros-tasks.csv'; a.click(); URL.revokeObjectURL(url)
    setNotice('Task export downloaded.')
  }
  return <><SiteHeader workspace /><main className="workspace-page">
    <div className="workspace-intro"><div><p className="eyebrow">YOUR PRACTICE, IN FOCUS</p><h1>A little less admin.<br /><em>A clearer next step.</em></h1><p>Organize your work. Plan the cost. Keep care moving.</p></div>
      <div className="account-panel"><span className="storage-label">{user ? <Cloud size={16} /> : <HardDrive size={16} />}{user ? 'Personal cloud workspace' : 'Local workspace'}</span><p>{user ? `Signed in as ${user.displayName || user.email}` : 'Tasks are saved in this browser. Use task references, without patient details.'}</p>{isFirebaseConfigured && !user ? <a href="/sign-in" className="button button-outline">Sign in or create account <ArrowUpRight size={14} /></a> : isFirebaseConfigured ? <Button variant="outline" disabled={authLoading || authBusy || busy} onClick={authenticate}>{authBusy ? 'Please wait…' : user ? 'Sign out' : 'Sign in with Google'}</Button> : <a className="text-link" href="/demo">Explore the patient walkthrough <ArrowUpRight size={14} /></a>}{isFirebaseConfigured && !user && <small>Signing in opens a separate cloud workspace. Local tasks stay on this device.</small>}</div>
    </div>
    {(error || authError) && <p className="workspace-alert" role="alert">{error || authError}</p>}
    <div className="workspace-stats"><div><span>Open tasks</span><strong>{items.length - completed}</strong></div><div><span>In progress</span><strong>{items.filter(item => item.status === 'In progress').length}</strong></div><div><span>Completed</span><strong>{completed}</strong></div><div className="completion-stat"><span>Workflow completion</span><div className="completion-ring" style={{ background: `conic-gradient(var(--teal) ${items.length ? completed / items.length * 360 : 0}deg, var(--soft) 0deg)` }}><b>{items.length ? Math.round(completed / items.length * 100) : 0}%</b></div></div></div>
    <div className="worklist-tabs"><button type="button" aria-pressed={!dueFilter} onClick={() => setDueFilter(false)}>All work <span>{items.length}</span></button><button type="button" aria-pressed={dueFilter} onClick={() => setDueFilter(true)}><Clock3 size={14} />Overdue <span>{overdue}</span></button></div>
    <div className="workspace-grid"><section className="task-panel" aria-labelledby="task-heading"><div className="task-heading"><div><h2 id="task-heading">Your worklist</h2><p>The next step, all in one place.</p></div><Button onClick={() => showForm ? setShowForm(false) : openForm()} disabled={!ready} aria-expanded={showForm}><Plus size={16} />New task</Button></div>
      {showForm && <form className="task-form" onSubmit={async e => { e.preventDefault(); if (!title.trim()) return; const saved = await save({ id: editing?.id ?? crypto.randomUUID(), title: title.trim(), kind, status: editing?.status ?? 'To do', due, createdAt: editing?.createdAt ?? new Date().toISOString() }); if (saved) { setTitle(''); setDue(''); setShowForm(false); setNotice(editing ? 'Task updated and saved.' : 'Task created and saved.'); setEditing(null) } }}><h3 className="task-form-title">{editing ? 'Edit task' : 'New task'}</h3><label>Task reference<input autoFocus required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Review estimate #1042" /></label><div className="task-form-row"><label>Workflow<select value={kind} onChange={e => setKind(e.target.value as WorkItem['kind'])}>{taskKinds.map(value => <option key={value}>{value}</option>)}</select></label><label>Due date<input required type="date" min="2000-01-01" max="2100-12-31" value={due} onChange={e => setDue(e.target.value)} /></label></div><div className="task-form-actions"><Button disabled={busy || !title.trim()} type="submit">{busy ? 'Saving…' : editing ? 'Save changes' : 'Save task'}</Button><Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button></div></form>}
      <div className="task-toolbar"><label className="task-search"><Search size={16} /><input aria-label="Search tasks" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your tasks" /></label><select aria-label="Filter task status" value={filter} onChange={e => setFilter(e.target.value)}>{['All tasks', ...taskStatuses].map(value => <option key={value}>{value}</option>)}</select><Button variant="ghost" size="icon" disabled={!filtered.length} onClick={exportTasks} aria-label="Export filtered tasks"><Download size={17} /></Button></div>
      <p className="save-notice" role="status">{notice}</p>
      {loading ? <p className="empty-worklist">Loading your workspace…</p> : filtered.length === 0 ? <div className="empty-worklist"><ClipboardList size={32} /><h3>{items.length ? 'No matching tasks' : 'Make room for the work that matters.'}</h3><p>{items.length ? 'Try another search or status filter.' : 'Add your first estimate, authorization, or appeal task.'}</p>{!items.length && <Button variant="outline" disabled={!ready} onClick={() => openForm()}>Create your first task <Plus size={15} /></Button>}</div> : <ul className="task-list">{filtered.map(item => <li key={item.id} className={item.status !== 'Completed' && item.due < today ? 'task-overdue' : undefined}><div className="task-icon"><ClipboardList size={18} /></div><div className="task-detail"><strong>{item.title}</strong><span>{item.kind} · {item.status !== 'Completed' && item.due < today ? 'Overdue' : 'Due'} {new Date(`${item.due}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div><select aria-label={`Status for ${item.title}`} disabled={busy} value={item.status} onChange={async e => { if (await save({ ...item, status: e.target.value as WorkItem['status'] })) setNotice('Task status saved.') }}>{taskStatuses.map(status => <option key={status}>{status}</option>)}</select><Button variant="ghost" size="icon" aria-label={`Edit ${item.title}`} disabled={busy} onClick={() => openForm(item)}><Pencil size={15} /></Button>{deleting === item.id ? <div className="delete-confirm"><Button size="sm" variant="destructive" disabled={busy} onClick={async () => { if (await save(item, true)) { setDeleting(null); setNotice('Task deleted.') } }}>Delete</Button><Button size="sm" variant="ghost" onClick={() => setDeleting(null)}>Cancel</Button></div> : <Button variant="ghost" size="icon" aria-label={`Delete ${item.title}`} disabled={busy} onClick={() => setDeleting(item.id)}><Trash2 size={16} /></Button>}</li>)}</ul>}
      <div className="task-panel-footer"><Check size={14} /><span>{user ? 'Changes save to your account.' : 'Changes save on this device.'} No payer submissions are made here.</span></div>
    </section><aside className="workspace-aside"><WorkflowChart items={items} /><EstimateCalculator disabled={!ready || busy} onSaveTask={async summary => {
        const saved = await save({ id: crypto.randomUUID(), title: `Review estimate · ${summary}`, kind: 'Estimate', status: 'To do', due: today, createdAt: new Date().toISOString() })
        if (saved) { setNotice('Estimate follow-up added to your worklist.'); setDueFilter(false); setFilter('All tasks'); setQuery('') }
        return saved
      }} /><a className="demo-invitation" href="/demo"><span>Take a guided look <ArrowUpRight size={18} /></span><h3>One patient.<br />The whole journey.</h3><p>Try estimates, authorizations, and appeals with a sample patient.</p></a></aside></div>
  </main></>
}
