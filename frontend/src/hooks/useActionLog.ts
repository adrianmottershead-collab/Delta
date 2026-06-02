import { useState, useCallback } from 'react'

export type ActionStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Escalated'

export interface ActionLogEntry {
  accountId: string
  actionIndex: number
  status: ActionStatus
  notes: string
  pushedAt: string   // ISO timestamp when pushed to CRM
  pushedBy: string
}

// Stable key for an action so we can look it up from any component
export function actionKey(accountId: string, actionIndex: number) {
  return `${accountId}::${actionIndex}`
}

export function useActionLog() {
  const [log, setLog] = useState<Record<string, ActionLogEntry>>({})

  const pushUpdate = useCallback((entry: ActionLogEntry) => {
    setLog(prev => ({
      ...prev,
      [actionKey(entry.accountId, entry.actionIndex)]: entry,
    }))
  }, [])

  const getEntry = useCallback(
    (accountId: string, actionIndex: number) =>
      log[actionKey(accountId, actionIndex)] ?? null,
    [log],
  )

  return { log, pushUpdate, getEntry }
}

export type ActionLog = ReturnType<typeof useActionLog>
