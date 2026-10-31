export const taskKinds = ['Estimate', 'Prior authorization', 'Appeal'] as const
export const taskStatuses = ['To do', 'In progress', 'Completed'] as const
export type WorkItem = { id: string; title: string; kind: typeof taskKinds[number]; status: typeof taskStatuses[number]; due: string; createdAt: string }
function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}
export function isWorkItem(value: unknown): value is WorkItem {
  if (!value || typeof value !== 'object') return false
  const item = value as WorkItem
  return typeof item.id === 'string' && item.id.length > 0 && !item.id.includes('/') && typeof item.title === 'string' && item.title.trim().length > 0 && item.title.length <= 120 && taskKinds.includes(item.kind) && taskStatuses.includes(item.status) && typeof item.due === 'string' && isCalendarDate(item.due) && typeof item.createdAt === 'string'
}
export function csvForTasks(items: WorkItem[]) {
  const escape = (value: string) => `"${(/^[=+@\-\t\r]/.test(value) ? "'" : '') + value.replaceAll('"', '""')}"`
  return ['Title,Workflow,Status,Due date', ...items.map(item => [item.title, item.kind, item.status, item.due].map(escape).join(','))].join('\r\n')
}
