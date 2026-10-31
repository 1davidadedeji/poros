'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail,
  sendEmailVerification, validatePassword, type User,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './client'

function configuredAuth() {
  if (!auth) throw new Error('Authentication is not configured.')
  return auth
}
const actions = {
  async signInWithGoogle() { await signInWithPopup(configuredAuth(), new GoogleAuthProvider()) },
  async signOutUser() { await signOut(configuredAuth()) },
  async signInWithEmail(email: string, password: string) { await signInWithEmailAndPassword(configuredAuth(), email, password) },
  async createAccount(email: string, password: string) {
    const currentAuth = configuredAuth()
    const policy = await validatePassword(currentAuth, password)
    if (!policy.isValid) {
      const needs = [
        !policy.meetsMinPasswordLength && `at least ${policy.passwordPolicy.customStrengthOptions.minPasswordLength ?? 6} characters`,
        policy.containsLowercaseLetter === false && 'a lowercase letter',
        policy.containsUppercaseLetter === false && 'an uppercase letter',
        policy.containsNumericCharacter === false && 'a number',
        policy.containsNonAlphanumericCharacter === false && 'a symbol',
      ].filter(Boolean)
      throw new Error(`Your password needs ${needs.join(', ') || 'to meet the account password policy'}.`)
    }
    await createUserWithEmailAndPassword(currentAuth, email, password)
  },
  async resetPassword(email: string) {
    try { await sendPasswordResetEmail(configuredAuth(), email) }
    catch (error) { if ((error as { code?: string }).code !== 'auth/user-not-found') throw error }
  },
  async sendVerification() {
    const user = configuredAuth().currentUser
    if (!user) throw new Error('Sign in to verify your email.')
    await sendEmailVerification(user)
  },
}

type AuthState = typeof actions & { user: User | null; loading: boolean; isFirebaseConfigured: boolean }
const AuthContext = createContext<AuthState>({ user: null, loading: isFirebaseConfigured, isFirebaseConfigured, ...actions })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, nextUser => { setUser(nextUser); setLoading(false) })
  }, [])
  return <AuthContext.Provider value={{ user, loading, isFirebaseConfigured, ...actions }}>{children}</AuthContext.Provider>
}
export function useAuth() { return useContext(AuthContext) }

export function authErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'The email or password is incorrect. Try again or reset your password.',
    'auth/wrong-password': 'The email or password is incorrect. Try again or reset your password.',
    'auth/user-not-found': 'The email or password is incorrect. Try again or reset your password.',
    'auth/email-already-in-use': 'This email already has an account. Sign in or reset your password.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Choose a stronger password with at least six characters.',
    'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled. You can try again.',
    'auth/cancelled-popup-request': 'Another sign-in window is already open.',
    'auth/popup-blocked': 'Allow popups for this site, or sign in with email and password.',
    'auth/network-request-failed': 'Check your connection and try again.',
    'auth/unauthorized-domain': 'Sign-in is not enabled for this website address yet.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled yet. Try another method.',
    'auth/account-exists-with-different-credential': 'Use the sign-in method you originally used for this email.',
    'auth/user-disabled': 'This account has been disabled.',
  }
  if (code) return messages[code] ?? 'We could not complete that request. Please try again.'
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
