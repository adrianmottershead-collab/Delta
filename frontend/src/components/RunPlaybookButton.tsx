import { useState } from 'react'
import type { PriorityAction } from '../data/accounts'
import { useActionLogContext } from '../context/ActionLogContext'

// Role-specific routing receipts — makes the automation feel real and specific
const ROUTING_RECEIPT: Record<PriorityAction['role'], string> = {
  CCO: 'Executive calendar placeholder sent to CCO · Salesforce task created · Slack alert routed to CCO channel',
  CSM: 'Salesforce task created and assigned to Enterprise CSM · QBR agenda updated · Account health flag raised',
  FDE: 'P1 mitigation ticket pushed to FDE Jira sprint backlog · Engineering lead notified · SLA clock started',
}

interface Props {
  accountId: string
  accountName: string
  actionIndex: number
  action: PriorityAction
  size?: 'sm' | 'md'
}

export function RunPlaybookButton({ accountId, accountName, actionIndex, action, size = 'md' }: Props) {
  const { pushUpdate, getEntry } = useActionLogContext()
  const existing = getEntry(accountId, actionIndex)
  const [state, setState] = useState<'idle' | 'running' | 'done'>('idle')

  // Already completed — show receipt inline
  if (existing?.status === 'Completed' || state === 'done') {
    return (
      <div className="mt-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 font-mono text-xs text-emerald-400 space-y-1">
        <p className="font-bold not-italic">✓ Delta: Execution order received for {accountName}</p>
        <p className="text-emerald-500">{ROUTING_RECEIPT[action.role]}</p>
      </div>
    )
  }

  function handleRun() {
    setState('running')
    setTimeout(() => {
      pushUpdate({
        accountId,
        actionIndex,
        status: 'In Progress',
        notes: 'Playbook routed via Delta',
        pushedAt: new Date().toISOString(),
        pushedBy: 'Delta',
      })
      setState('done')
    }, 1200)
  }

  return (
    <button
      onClick={handleRun}
      disabled={state === 'running'}
      className={`flex items-center gap-2 rounded-lg font-semibold transition-all ${
        size === 'sm'
          ? 'px-3 py-1.5 text-xs'
          : 'px-4 py-2 text-sm'
      } ${
        state === 'running'
          ? 'bg-indigo-800 text-indigo-300 cursor-wait'
          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
      }`}
    >
      {state === 'running' ? (
        <><span className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />Routing…</>
      ) : (
        <>▶ Run Playbook</>
      )}
    </button>
  )
}
