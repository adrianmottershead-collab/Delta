import { useState } from 'react'
import type { Account } from '../data/accounts'
import { HealthBadge, SentimentBadge, DeploymentBadge } from './Badge'
import { StakeholderRadar, UsageTrend, DeploymentBars, ScoreGauges } from './AccountCharts'
import { SiloGraph } from './SiloGraph'
import { SimulationFeed } from './SimulationFeed'
import { PivotPointBanner, PriorityActionsList, FullPlaybook } from './DeltaSynthesis'

const TABS = ['Overview', 'Playbooks', 'Stakeholders', 'Deployments', 'Silo Map', 'Delta Monitor'] as const
type Tab = typeof TABS[number]

function fmt(n: number) {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}K`
}

export function AccountDetail({ account }: { account: Account }) {
  const [tab, setTab] = useState<Tab>('Overview')

  const topAction = account.synthesis.priorityActions[0]

  return (
    <div className="space-y-4">
      {/* Account header */}
      <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-white">{account.name}</h2>
              <HealthBadge status={account.healthStatus} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-2">
              <span>ARR <span className="text-white font-semibold">{fmt(account.arr)}</span></span>
              <span>·</span>
              <span>Renewal in <span className={`font-semibold ${account.renewalDaysOut < 90 ? 'text-red-400' : 'text-white'}`}>{account.renewalDaysOut} days</span></span>
              <span>·</span>
              <span>Open P1 Bugs <span className={`font-semibold ${account.openCriticalBugs > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{account.openCriticalBugs}</span></span>
              <span>·</span>
              <span>Marketing <span className="text-white font-semibold">{account.marketingEngagement}</span></span>
            </div>
          </div>
          {account.opportunities.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Open Pipeline</p>
              <p className="text-2xl font-bold text-blue-400">
                {fmt(account.opportunities.reduce((s, o) => s + o.value, 0))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pivot point + top action always visible */}
      <PivotPointBanner synthesis={account.synthesis} />

      {topAction && (
        <div className="flex items-start gap-3 bg-[#141720] border border-[#1e2235] rounded-xl px-5 py-3">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-0.5 shrink-0">Next Action</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
              topAction.role === 'CCO' ? 'text-amber-300 border-amber-700' :
              topAction.role === 'CSM' ? 'text-blue-300 border-blue-700' : 'text-teal-300 border-teal-700'
            }`}>{topAction.role}</span>
            <span className="text-sm text-white">{topAction.action}</span>
            <span className="text-xs text-slate-500 shrink-0">— {topAction.deadline}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0f1117] rounded-lg p-1 border border-[#1e2235]">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors ${
              tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t === 'Playbooks' ? '⚡ Playbooks' : t}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === 'Overview' && (
        <div className="space-y-4">
          <ScoreGauges account={account} />

          {/* Usage trend with action annotation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <UsageTrend account={account} />
              <UsageTrendInsight account={account} />
            </div>
            <div className="space-y-2">
              <StakeholderRadar account={account} />
              <StakeholderInsight account={account} />
            </div>
          </div>

          <DeploymentBars account={account} />

          {account.opportunities.length > 0 && (
            <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-5">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Open Opportunities</p>
              <div className="space-y-2">
                {account.opportunities.map((o, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#0f1117] rounded-lg border border-[#1e2235]">
                    <div>
                      <p className="text-sm font-medium text-white">{o.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{o.stage}</p>
                    </div>
                    <p className="text-lg font-bold text-blue-400">{fmt(o.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Playbooks ── */}
      {tab === 'Playbooks' && (
        <div className="space-y-4">
          <PriorityActionsList synthesis={account.synthesis} accountId={account.id} />
          <FullPlaybook synthesis={account.synthesis} />
        </div>
      )}

      {/* ── Stakeholders ── */}
      {tab === 'Stakeholders' && (
        <div className="space-y-4">
          <StakeholderRadar account={account} />
          <div className="grid grid-cols-1 gap-3">
            {account.stakeholders.map((s, i) => (
              <div key={i} className="bg-[#141720] border border-[#1e2235] rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-[#1e2235] flex items-center justify-center text-sm font-bold text-slate-300">
                    {s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.role}</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <SentimentBadge sentiment={s.sentiment} />
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-3">{s.notes}</p>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">Influence</p>
                    <div className="h-1.5 rounded-full bg-[#1e2235]">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${s.influence * 10}%` }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 mb-1">Risk</p>
                    <div className="h-1.5 rounded-full bg-[#1e2235]">
                      <div className="h-full rounded-full bg-red-500" style={{ width: `${s.risk * 10}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Deployments ── */}
      {tab === 'Deployments' && (
        <div className="space-y-4">
          <DeploymentBars account={account} />
          {account.deployments.map((d, i) => (
            <div key={i} className="bg-[#141720] border border-[#1e2235] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white">{d.division}</p>
                <DeploymentBadge status={d.status} />
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Usage</span><span>{d.usagePct}%</span>
                </div>
                <div className="h-2 rounded-full bg-[#1e2235]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${d.usagePct}%`,
                      background: { Stable: '#22c55e', Expanding: '#3b82f6', Stalled: '#ef4444', 'At Risk': '#f59e0b' }[d.status],
                    }}
                  />
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{d.notes}</p>
            </div>
          ))}
          <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">FDE Sprint Status</p>
            <p className="text-sm text-slate-300 leading-relaxed">{account.fdeStatus}</p>
          </div>
        </div>
      )}

      {/* ── Silo Map ── */}
      {tab === 'Silo Map' && (
        <div className="space-y-4">
          <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Dependency Risk Graph</p>
            <p className="text-xs text-slate-600 mb-4">Hover a node to trace its upstream and downstream dependencies</p>
            <SiloGraph nodes={account.siloGraph.nodes} edges={account.siloGraph.edges} />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {([
              { type: 'blocker',    label: 'Blocker',    color: 'border-red-800 text-red-400 bg-red-950/40' },
              { type: 'risk',       label: 'Risk',       color: 'border-amber-800 text-amber-400 bg-amber-950/40' },
              { type: 'dependency', label: 'Dependency', color: 'border-indigo-800 text-indigo-400 bg-indigo-950/40' },
              { type: 'outcome',    label: 'Outcome',    color: 'border-emerald-800 text-emerald-400 bg-emerald-950/40' },
            ]).map(l => (
              <div key={l.type} className={`rounded-lg border p-2 text-xs font-semibold text-center ${l.color}`}>{l.label}</div>
            ))}
          </div>
        </div>
      )}

      {/* ── Delta Monitor ── */}
      {tab === 'Delta Monitor' && (
        <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">🛰 Delta Active Monitoring</p>
          <p className="text-xs text-slate-500 mb-4">
            Delta monitors live system signals across Jira, Salesforce, and CSM notes. When a critical threshold is crossed, Delta interjects with a Silo Inversion analysis and a multi-threaded playbook.
          </p>
          <SimulationFeed account={account} />
        </div>
      )}
    </div>
  )
}

// ── Chart insight callouts ────────────────────────────────────────────────────

function UsageTrendInsight({ account }: { account: Account }) {
  const trend = account.monthlyUsageTrend
  const first = trend[0].usage
  const last = trend[trend.length - 1].usage
  const delta = last - first
  const lastBenchmark = trend[trend.length - 1].benchmark
  const gap = last - lastBenchmark

  const isDecline = delta < -5
  const isBelowBenchmark = gap < -5

  if (!isDecline && !isBelowBenchmark) {
    return (
      <div className="flex items-start gap-2 px-3 py-2 bg-emerald-950/30 border border-emerald-900/50 rounded-lg">
        <span className="text-emerald-400 text-xs mt-0.5">↑</span>
        <p className="text-xs text-emerald-300">Usage trending above benchmark — strong expansion signal. Prioritise reference activity and case study production.</p>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 px-3 py-2 bg-red-950/30 border border-red-900/50 rounded-lg">
      <span className="text-red-400 text-xs mt-0.5">↓</span>
      <p className="text-xs text-red-300">
        {isDecline ? `Usage has declined ${Math.abs(delta)}pts since Jan` : ''}
        {isDecline && isBelowBenchmark ? ' and is ' : ''}
        {isBelowBenchmark ? `${Math.abs(gap)}pts below portfolio benchmark` : ''}.
        {' '}Delta action required — see Playbooks tab.
      </p>
    </div>
  )
}

function StakeholderInsight({ account }: { account: Account }) {
  const blocked = account.stakeholders.filter(s => s.sentiment === 'Blocked' || s.sentiment === 'Negative')
  const highRisk = account.stakeholders.filter(s => s.risk >= 8)

  if (blocked.length === 0 && highRisk.length === 0) {
    return (
      <div className="flex items-start gap-2 px-3 py-2 bg-emerald-950/30 border border-emerald-900/50 rounded-lg">
        <span className="text-emerald-400 text-xs mt-0.5">✓</span>
        <p className="text-xs text-emerald-300">All stakeholders aligned. No blocked or negative sentiment detected. Focus on deepening champion relationships.</p>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 px-3 py-2 bg-amber-950/30 border border-amber-900/50 rounded-lg">
      <span className="text-amber-400 text-xs mt-0.5">⚠</span>
      <p className="text-xs text-amber-300">
        {blocked.length > 0 && `${blocked.map(s => s.name.split(' ').slice(-1)[0]).join(', ')} ${blocked.length === 1 ? 'is' : 'are'} blocked or negative`}
        {blocked.length > 0 && highRisk.length > 0 && '. '}
        {highRisk.length > 0 && `${highRisk.length} stakeholder${highRisk.length > 1 ? 's' : ''} at high risk score`}.
        {' '}See Playbooks for role-specific plays.
      </p>
    </div>
  )
}
