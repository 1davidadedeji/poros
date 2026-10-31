'use client'
import { useEffect, useRef, useState } from 'react'
import { collection, deleteDoc, doc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore'
import { firebaseApp } from '@/lib/firebase/client'
import { useAuth } from '@/lib/firebase/auth-context'
import { isWorkItem, type WorkItem } from './tasks'
const KEY = 'poros-work-items-v1'
export function useWorkItems() {
  const { user, loading: authLoading } = useAuth()
  const saving = useRef(false)
  const [items, setItems] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setItems([]); setLoading(true); setReady(false); setError('')
    if (authLoading) return
    if (user && firebaseApp) {
      return onSnapshot(collection(getFirestore(firebaseApp), 'users', user.uid, 'tasks'), snapshot => {
        setItems(snapshot.docs.map(d => ({ ...d.data(), id: d.id })).filter(isWorkItem)); setLoading(false); setReady(true)
      }, () => { setError('Your workspace could not be loaded. Check your connection and Firebase access, then reload.'); setLoading(false) })
    }
    function read() {
      try {
        const raw = JSON.parse(localStorage.getItem(KEY) || '[]')
        if (!Array.isArray(raw) || !raw.every(isWorkItem)) throw new Error('Invalid saved data')
        setItems(raw); setReady(true)
      } catch { setError('Saved work could not be read. Allow browser storage or use a different browser.'); setReady(false) }
      setLoading(false)
    }
    read()
    const sync = (event: StorageEvent) => { if (event.key === KEY) read() }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [user, authLoading])
  async function save(item: WorkItem, remove = false) {
    if (saving.current || !ready) return false
    if (!isWorkItem(item)) { setError('Check the task reference and due date, then try again.'); return false }
    saving.current = true
    setBusy(true); setError('')
    try {
      if (user && firebaseApp) {
        const ref = doc(getFirestore(firebaseApp), 'users', user.uid, 'tasks', item.id)
        if (remove) await deleteDoc(ref); else await setDoc(ref, item)
      } else {
        const stored: unknown = JSON.parse(localStorage.getItem(KEY) || '[]')
        if (!Array.isArray(stored) || !stored.every(isWorkItem)) throw new Error('Invalid saved data')
        const next = stored.filter(value => value.id !== item.id)
        if (!remove) next.push(item)
        localStorage.setItem(KEY, JSON.stringify(next)); setItems(next)
      }
      return true
    } catch { setError('Changes were not saved. Check your connection or browser storage and try again.'); return false }
    finally { saving.current = false; setBusy(false) }
  }
  return { items, loading, busy, error, ready, save }
}
