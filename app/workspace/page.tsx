import type { Metadata } from 'next'
import { Workspace } from '@/components/workspace/workspace'
export const metadata: Metadata = { title: 'Your workspace | Poros', description: 'Organize practice tasks, plan estimates, and keep the next step in sight.' }
export default function WorkspacePage() { return <Workspace /> }
