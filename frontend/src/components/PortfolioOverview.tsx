import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Account, HealthStatus, Urgency } from '../data/accounts'
import { HealthBadge } from './Badge'
import { RunPlaybookButton } from './RunPlaybookButton'
import { useActionLogContext } from '../context/ActionLogContext'

const COLOR: Record<HealthStatus, string> = {
  Healthy:   '#22c55e',
  Expanding: '#3b82f6',
  'At Risk': '#f59e0b',
  Churning:  '#ef4444',
}

const URGENCY_STYLE: Record<Urgency, string> = {
  Critical: 'bg-red-950 text-red-400 border border-red-800',
  High:     'bg-amber-950 text-amber-400 border border-amber-800',
  Medium:   'bg-indigo-950 text-indigo-400 border border-indigo-800',
}

const ROLE_TAG: Record<string, string> = {
  CCO: 'text-amber-300 border-amber-700',
  CSM: 'text-blue-300 border-blue-700',
  FDE: 'text-teal-300 border-teal-700',
}

interface Props {
  accounts: Account[]
  selectedId: string
  onSelect: (id: string) => void
}

function fmt(n: number) {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}K`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as Account
  return (
    <div className="bg-[#1a1d2e] border border-[#2d3148] rounded-lg p-3 text-sm shadow-xl">
      <p className="font-semibold text-white mb-1">{d.name}</p>
      <p className="text-slate-400">ARR: <span className="text-white">{fmt(d.arr)}</span></p>
      <p className="text-slate-400">Churn Risk: <span className="text-white">{d.churnRisk}%</span></p>
      <p className="text-slate-400">Expansion: <span className="text-white">{d.expansionScore}%</span></p>
    </div>
  )
}

export function PortfolioOverview({ accounts, selectedId, onSelect }: Props) {
  const { getEntry } = useActionLogContext()

  const totalArr = accounts.reduce((s, a) => s + a.arr, 0)
  const atRisk = accounts.filter(a => a.churnRisk > 60).reduce((s, a) => s + a.arr, 0)
  const pipeline = accounts.reduce((s, a) => s + a.opportunities.reduce((os, o) => os + o.value, 0), 0)

  // Top critical/high plays across portfolio, not yet completed, max 4
  const livePlays = accounts
    .flatMap(a =>
      a.synthesis.priorityActions.map((action, idx) => ({ account: a, action, idx }))
    )
    .filter(({ action, account, idx }) =>
      (action.urgency === 'Critical' || action.urgency === 'High') &&
      getEntry(account.id, idx)?.status !== 'Completed'
    )
    .sort((a, b) => {
      const urgOrd = { Critical: 0, High: 1, Medium: 2 }
      const diff = urgOrd[a.action.urgency] - urgOrd[b.action.urgency]
      return diff !== 0 ? diff : b.account.churnRisk - a.account.churnRisk
    })
    .slice(0, 4)

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Portfolio ARR',  value: fmt(totalArr),  sub: `${accounts.length} accounts` },
          { label: 'ARR at Churn Risk',    value: fmt(atRisk),    sub: 'churn risk >60%',     accent: 'text-red-400'     },
          { label: 'Expansion Pipeline',   value: fmt(pipeline),  sub: 'open opportunities',  accent: 'text-blue-400'    },
          { label: 'Avg NPS',              value: Math.round(accounts.reduce((s,a) => s+a.npsScore,0)/accounts.length).toString(), sub: 'portfolio average', accent: 'text-emerald-400' },
        ].map(k => (
          <div key={k.label} className="bg-[#141720] border border-[#1e2235] rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.accent ?? 'text-white'}`}>{k.value}</p>
            <p className="text-xs text-slate-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Live Plays ── */}
      <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">⚡ Delta — Live Plays</p>
            <p className="text-xs text-slate-600 mt-0.5">Critical and high-priority actions across portfolio — run to auto-route</p>
          </div>
          <span className="text-xs text-slate-600">{livePlays.length} active</span>
        </div>

        {livePlays.length === 0 ? (
          <p className="text-sm text-slate-600 py-4 text-center">No critical plays active — portfolio is clear.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {livePlays.map(({ account, action, idx }) => {
              const roleStyle = ROLE_TAG[action.role] ?? 'text-slate-400 border-slate-700'
              return (
                <div key={`${account.id}-${idx}`} className="bg-[#0f1117] border border-[#1e2235] rounded-lg p-4 flex flex-col gap-3">
                  {/* Header */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => onSelect(account.id)}
                      className="text-xs font-semibold text-white hover:text-indigo-300 transition-colors"
                    >
                      {account.name}
                    </button>
                    <HealthBadge status={account.healthStatus} />
                    <span className={`ml-auto text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${roleStyle}`}>
                      {action.role}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${URGENCY_STYLE[action.urgency]}`}>
                      {action.urgency}
                    </span>
                  </div>

                  {/* Action */}
                  <p className="text-sm text-white leading-snug">{action.action}</p>
                  <p className="text-xs text-slate-500">Due: {action.deadline}</p>

                  {/* Run button */}
                  <RunPlaybookButton
                    accountId={account.id}
                    accountName={account.name}
                    actionIndex={idx}
                    action={action}
                    size="sm"
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Scatter + account list */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-[#141720] border border-[#1e2235] rounded-xl p-5">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Portfolio Risk Map — ARR vs Churn Risk</p>
          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid stroke="#1e2235" strokeDasharray="3 3" />
              <XAxis dataKey="churnRisk" name="Churn Risk" unit="%" tick={{ fill: '#6b7280', fontSize: 11 }} label={{ value: 'Churn Risk %', position: 'insideBottom', offset: -10, fill: '#6b7280', fontSize: 11 }} />
              <YAxis dataKey="arr" name="ARR" tickFormatter={v => `$${(v/1_000_000).toFixed(1)}M`} tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#2d3148' }} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Scatter data={accounts} onClick={(d: any) => onSelect(d.id)} shape={(props: any) => {
                const { cx, cy, payload } = props
                const a = payload as Account
                const isSelected = a.id === selectedId
                return (
                  <circle
                    cx={cx} cy={cy}
                    r={isSelected ? 11 : 8}
                    fill={COLOR[a.healthStatus]}
                    opacity={isSelected ? 1 : 0.65}
                    stroke={isSelected ? '#fff' : 'none'}
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                  />
                )
              }}>
                {accounts.map(a => <Cell key={a.id} fill={COLOR[a.healthStatus]} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            {(['Healthy','Expanding','At Risk','Churning'] as HealthStatus[]).map(s => (
              <span key={s} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLOR[s] }} />
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="col-span-2 bg-[#141720] border border-[#1e2235] rounded-xl p-5 flex flex-col gap-2">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Accounts</p>
          {accounts.map(a => (
            <button
              key={a.id}
              onClick={() => onSelect(a.id)}
              className={`w-full text-left rounded-lg p-3 transition-all border ${
                selectedId === a.id
                  ? 'bg-[#1e2235] border-indigo-500/50'
                  : 'bg-[#0f1117] border-[#1e2235] hover:border-[#2d3148]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white truncate pr-2">{a.name}</span>
                <HealthBadge status={a.healthStatus} />
              </div>
              <div className="flex gap-3 text-xs text-slate-500">
                <span>{fmt(a.arr)} ARR</span>
                <span>·</span>
                <span>{a.renewalDaysOut}d to renewal</span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-[#1e2235] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${a.churnRisk}%`, background: COLOR[a.healthStatus] }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
