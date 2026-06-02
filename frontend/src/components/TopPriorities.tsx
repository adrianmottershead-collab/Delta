import { useState } from 'react'
import type { Account, PriorityAction, Urgency } from '../data/accounts'
import { HealthBadge } from './Badge'
import { CrmUpdateForm } from './CrmUpdateForm'
import { useActionLogContext } from '../context/ActionLogContext'

type RoleFilter = 'All' | 'CCO' | 'CSM' | 'FDE'
type UrgencyFilter = 'All' | 'Critical' | 'High' | 'Medium'

const URGENCY_ORDER: Record<Urgency, number> = { Critical: 0, High: 1, Medium: 2 }

const URGENCY_STYLE: Record<Urgency, string> = {
  Critical: 'bg-red-950 text-red-400 border border-red-800',
  High:     'bg-amber-950 text-amber-400 border border-amber-800',
  Medium:   'bg-indigo-950 text-indigo-400 border border-indigo-800',
}

const ROLE_STYLE = {
  CCO: { border: 'border-amber-700/60', label: 'text-amber-300', bg: 'bg-amber-950/10', tag: 'border-amber-700 text-amber-300' },
  CSM: { border: 'border-blue-700/60',  label: 'text-blue-300',  bg: 'bg-blue-950/10',  tag: 'border-blue-700 text-blue-300'   },
  FDE: { border: 'border-teal-700/60',  label: 'text-teal-300',  bg: 'bg-teal-950/10',  tag: 'border-teal-700 text-teal-300'   },
}

interface FlatAction {
  account: Account
  action: PriorityAction
  actionIndex: number
}

function fmt(n: number) {
  return `$${(n / 1_000_000).toFixed(1)}M`
}

interface Props {
  accounts: Account[]
  onSelectAccount: (id: string) => void
}

export function TopPriorities({ accounts, onSelectAccount }: Props) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All')
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyFilter>('All')
  const [hideCompleted, setHideCompleted] = useState(true)
  const { getEntry } = useActionLogContext()

  // Flatten all priority actions across all accounts
  const flat: FlatAction[] = accounts.flatMap(account =>
    account.synthesis.priorityActions.map((action, actionIndex) => ({
      account,
      action,
      actionIndex,
    }))
  )

  // Sort: urgency first, then churn risk descending
  const sorted = [...flat].sort((a, b) => {
    const urgencyDiff = URGENCY_ORDER[a.action.urgency] - URGENCY_ORDER[b.action.urgency]
    if (urgencyDiff !== 0) return urgencyDiff
    return b.account.churnRisk - a.account.churnRisk
  })

  // Filter
  const filtered = sorted.filter(({ account, action, actionIndex }) => {
    if (roleFilter !== 'All' && action.role !== roleFilter) return false
    if (urgencyFilter !== 'All' && action.urgency !== urgencyFilter) return false
    if (hideCompleted && getEntry(account.id, actionIndex)?.status === 'Completed') return false
    return true
  })

  // Counts for badge
  const criticalCount = flat.filter(f => f.action.urgency === 'Critical' && getEntry(f.account.id, f.actionIndex)?.status !== 'Completed').length
  const completedCount = flat.filter(f => getEntry(f.account.id, f.actionIndex)?.status === 'Completed').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Top Priorities</h1>
          <p className="text-sm text-slate-500">
            Cross-account action board · {flat.length} total actions ·{' '}
            <span className="text-red-400 font-medium">{criticalCount} critical open</span>
            {completedCount > 0 && <> · <span className="text-emerald-400">{completedCount} completed</span></>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-[#0f1117] rounded-lg p-1 border border-[#1e2235]">
          {(['All', 'CCO', 'CSM', 'FDE'] as RoleFilter[]).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                roleFilter === r ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-[#0f1117] rounded-lg p-1 border border-[#1e2235]">
          {(['All', 'Critical', 'High', 'Medium'] as UrgencyFilter[]).map(u => (
            <button
              key={u}
              onClick={() => setUrgencyFilter(u)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                urgencyFilter === u ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {u}
            </button>
          ))}
        </div>

        <button
          onClick={() => setHideCompleted(v => !v)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            hideCompleted
              ? 'border-slate-700 text-slate-400 hover:text-white'
              : 'border-emerald-700 text-emerald-400 bg-emerald-950/20'
          }`}
        >
          {hideCompleted ? 'Show completed' : 'Hide completed'}
        </button>

        <span className="text-xs text-slate-600 ml-auto">{filtered.length} shown</span>
      </div>

      {/* Action list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <p className="text-lg mb-1">All clear</p>
          <p className="text-sm">No actions match the current filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ account, action, actionIndex }) => {
            const rs = ROLE_STYLE[action.role]
            const logged = getEntry(account.id, actionIndex)
            return (
              <div
                key={`${account.id}-${actionIndex}`}
                className={`rounded-xl border p-4 ${rs.border} ${rs.bg} ${logged?.status === 'Completed' ? 'opacity-50' : ''}`}
              >
                {/* Account + urgency row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <button
                    onClick={() => onSelectAccount(account.id)}
                    className="text-xs font-semibold text-white hover:text-indigo-300 transition-colors"
                  >
                    {account.name}
                  </button>
                  <HealthBadge status={account.healthStatus} />
                  <span className="text-xs text-slate-600">{fmt(account.arr)} ARR</span>
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-slate-600">{account.renewalDaysOut}d to renewal</span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${rs.tag}`}>{action.role}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${URGENCY_STYLE[action.urgency]}`}>{action.urgency}</span>
                    <span className="text-xs text-slate-500">Due: {action.deadline}</span>
                  </div>
                </div>

                {/* Action text */}
                <p className={`text-sm font-medium leading-snug mb-1 ${logged?.status === 'Completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                  {action.action}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed mb-2">{action.rationale}</p>

                {/* CRM form */}
                <CrmUpdateForm accountId={account.id} actionIndex={actionIndex} action={action} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
