import type { Synthesis, Urgency } from '../data/accounts'
import { CrmUpdateForm } from './CrmUpdateForm'
import { RunPlaybookButton } from './RunPlaybookButton'
import { useActionLogContext } from '../context/ActionLogContext'

const URGENCY_STYLE: Record<Urgency, string> = {
  Critical: 'bg-red-950 text-red-400 border border-red-800',
  High:     'bg-amber-950 text-amber-400 border border-amber-800',
  Medium:   'bg-indigo-950 text-indigo-400 border border-indigo-800',
}

const ROLE_STYLE = {
  CCO: { border: 'border-amber-700', label: 'text-amber-300', bg: 'bg-amber-950/20' },
  CSM: { border: 'border-blue-700',  label: 'text-blue-300',  bg: 'bg-blue-950/20'  },
  FDE: { border: 'border-teal-700',  label: 'text-teal-300',  bg: 'bg-teal-950/20'  },
}

interface Props {
  synthesis: Synthesis
  accountId: string
}

export function PivotPointBanner({ synthesis }: Omit<Props, 'accountId'>) {
  return (
    <div className="bg-indigo-950/30 border border-indigo-700/50 rounded-xl px-5 py-4 flex gap-3 items-start">
      <span className="text-indigo-400 mt-0.5 shrink-0">⚡</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">Delta — Single Pivot Point</p>
        <p className="text-sm text-indigo-100 leading-relaxed">{synthesis.pivotPoint}</p>
      </div>
    </div>
  )
}

export function PriorityActionsList({ synthesis, accountId }: Props) {
  const { getEntry } = useActionLogContext()

  return (
    <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-5">
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Priority Actions — Ordered by Impact</p>
      <div className="space-y-3">
        {synthesis.priorityActions.map((a, i) => {
          const rs = ROLE_STYLE[a.role]
          const logged = getEntry(accountId, i)
          return (
            <div
              key={i}
              className={`rounded-lg border p-4 transition-opacity ${rs.border} ${rs.bg} ${logged?.status === 'Completed' ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded ${rs.label} border ${rs.border}`}>{a.role}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${URGENCY_STYLE[a.urgency]}`}>{a.urgency}</span>
                  <span className="text-xs text-slate-500">Due: {a.deadline}</span>
                </div>
                <span className="text-slate-600 text-sm font-mono shrink-0">#{i + 1}</span>
              </div>
              <p className={`text-sm font-medium leading-snug mb-1.5 ${logged?.status === 'Completed' ? 'line-through text-slate-500' : 'text-white'}`}>
                {a.action}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{a.rationale}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <RunPlaybookButton accountId={accountId} accountName="" actionIndex={i} action={a} size="sm" />
                <CrmUpdateForm accountId={accountId} actionIndex={i} action={a} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function FullPlaybook({ synthesis }: Omit<Props, 'accountId'>) {
  return (
    <div className="space-y-4">
      <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-5">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Stakeholder Risk Heatmap</p>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{synthesis.stakeholderRiskHeatmap}</p>
      </div>

      <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-5">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Deployment Silo Analysis</p>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{synthesis.deploymentSiloAnalysis}</p>
      </div>

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 px-1">Multi-Threaded Executive Playbook</p>
        <div className="grid grid-cols-3 gap-4">
          {([
            { title: 'CCO',            steps: synthesis.playbook.cco, s: ROLE_STYLE.CCO },
            { title: 'Enterprise CSM', steps: synthesis.playbook.csm, s: ROLE_STYLE.CSM },
            { title: 'FDE Lead',       steps: synthesis.playbook.fde, s: ROLE_STYLE.FDE },
          ]).map(({ title, steps, s }) => (
            <div key={title} className={`bg-[#141720] rounded-xl border p-4 ${s.border}`}>
              <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${s.label}`}>{title}</p>
              <ol className="space-y-3 list-decimal list-inside">
                {steps.map((step, i) => (
                  <li key={i} className="text-sm text-slate-300 leading-relaxed marker:text-slate-600">{step}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
