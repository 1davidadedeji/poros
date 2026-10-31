'use client'

import { useEffect, useState } from 'react'

import { useAuth } from '@/lib/firebase/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PREVIEW_KEY = 'poros-preview-unlocked'

export function SignInGate({ children }: { children: React.ReactNode }) {
  const { user, loading, isFirebaseConfigured, signInWithGoogle } = useAuth()
  const [previewUnlocked, setPreviewUnlocked] = useState(false)

  useEffect(() => {
    setPreviewUnlocked(window.sessionStorage.getItem(PREVIEW_KEY) === '1')
  }, [])

  function unlockPreview() {
    window.sessionStorage.setItem(PREVIEW_KEY, '1')
    setPreviewUnlocked(true)
  }

  if (user || previewUnlocked) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, textTransform: 'none', letterSpacing: 'normal', fontWeight: 400 }}>
            Poros
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isFirebaseConfigured ? (
            <>
              <p className="text-sm text-muted-foreground">
                Sign in with your practice&apos;s Google account to open the patient demo.
              </p>
              <Button type="button" onClick={signInWithGoogle}>
                Sign in with Google
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Firebase not connected yet. Add your Firebase project config to{' '}
                <code className="rounded-sm bg-muted px-1 py-0.5 text-[11px]">.env.local</code> to enable Google
                Sign-In here.
              </p>
              <Button type="button" variant="outline" onClick={unlockPreview}>
                Continue without signing in (preview)
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
