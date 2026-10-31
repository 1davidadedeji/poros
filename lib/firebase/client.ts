import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const PLACEHOLDER_VALUES = new Set(['', undefined, 'your-api-key', 'your-project-id'])

export const isFirebaseConfigured = [firebaseConfig.apiKey, firebaseConfig.authDomain, firebaseConfig.projectId, firebaseConfig.appId].every(
  (value) => !PLACEHOLDER_VALUES.has(value) && !value?.startsWith('your-'),
)

let firebaseApp: FirebaseApp | null = null
let auth: Auth | null = null

if (isFirebaseConfigured) {
  firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  auth = getAuth(firebaseApp)
}

export { firebaseApp, auth }
