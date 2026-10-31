import type { Metadata } from 'next'
import { SignInPanel } from '@/components/auth/sign-in-panel'
export const metadata: Metadata = { title: 'Sign in | Poros', description: 'Sign in or create your Poros workspace with Google or email.' }
export default function SignInPage() { return <SignInPanel /> }
