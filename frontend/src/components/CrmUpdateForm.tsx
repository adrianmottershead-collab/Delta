import { useState } from 'react'
import type { ActionStatus } from '../hooks/useActionLog'
import { useActionLogContext } from '../context/ActionLogContext'
import type { PriorityAction } from '../data/accounts'

const STATUS_OPTIONS: ActionStatus[] = ['Not Started', 'In Progress', 'Completed', 'Escalated']

const STATUS_STYLE: Record<ActionStatus, string> = {
  'Not Started':  'text-slate-400 bg-slate-800 border-slate-700',
  'In Progress':  'text-blue-300  bg-blue-950  border-blue-800',
  'Completed':    'text-emerald-300 bg-emerald-950 border-emerald-800',
  'Escalated':    'text-red-300   bg-red-950   border-red-800',
}

interface Props {
  accountId: string
  actionIndex: number
  action: PriorityAction
}

export function CrmUpdateForm({ accountId, actionIndex, action }: Props) {
  const { pushUpdate, getEntry } = useActionLogContext()
  const existing = getEntry(accountId, actionIndex)

  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<ActionStatus>(existing?.status ?? 'Not Started')
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [pushed, setPushed] = useState(false)

  function handlePush() {
    pushUpdate({
      accountId,
      actionIndex,
      status,
      notes,
      pushedAt: new Date().toISOString(),
      pushedBy: 'You',
    })
    setPushed(true)
    setTimeout(() => {
      setPushed(false)
      setOpen(false)
    }, 1800)
  }

  if (existing && !open) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[existing.status]}`}>
          {existing.status}
        </span>
        <span className="text-xs text-slate-500">
          Pushed {new Date(existing.pushedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          {existing.notes && ` · "${existing.notes.slice(0, 40)}${existing.notes.length > 40 ? '…' : ''}"`}
        </span>
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-slate-600 hover:text-slate-300 transition-colors ml-auto"
        >
          Update
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-xs text-slate-500 hover:text-slate-300 border border-dashed border-slate-700 hover:border-slate-500 rounded px-2 py-1 transition-colors"
      >
        + Log CRM update
      </button>
    )
  }

  return (
    <div className="mt-3 bg-[#0f1117] border border-[#2d3148] rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Log CRM Update</p>
        <button onClick={() => setOpen(false)} className="text-slate-600 hover:text-slate-300 text-xs">✕</button>
      </div>

      {/* Status picker */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
              status === s ? STATUS_STYLE[s] : 'text-slate-500 border-slate-700 hover:border-slate-500'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Notes */}
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Add a note for Salesforce..."
        rows={2}
        className="w-full bg-[#141720] border border-[#2d3148] rounded text-xs text-slate-300 placeholder-slate-600 p-2 resize-none focus:outline-none focus:border-indigo-600"
      />

      {/* Push button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePush}
          disabled={pushed}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
            pushed
              ? 'bg-emerald-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {pushed ? '✓ Pushed to Salesforce' : '↑ Push to Salesforce'}
        </button>
        <span className="text-xs text-slate-600">
          {action.role} · {action.deadline}
        </span>
      </div>
    </div>
  )
}
