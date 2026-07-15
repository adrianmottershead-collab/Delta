
import type { Account } from '../data/accounts'
import { compareToPortfolio, topLeverPerMetric } from '../ebr/metricImpact'

const METRIC_META: Record<string, { title: string; format: (a: Account) => string }> = {
  churnRisk: { title: 'Churn Risk', format: a => `${a.churnRisk}/100` },
  expansionScore: { title: 'Expansion Score', format: a => `${a.expansionScore}/100` },
  npsScore: { title: 'NPS', format: a => `${a.npsScore > 0 ? '+' : ''}${a.npsScore}` },
}

// "If you only do one thing to move this number, this is it." One card per
// metric, each pointing at the single highest-leverage upcoming action —
// makes the through-line from action to outcome explicit rather than
// implied.
export function MetricsLevers({ account }: { account: Account }) {
  const levers = topLeverPerMetric(account)

  return (
    <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-5">
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">What Moves These Numbers</p>
      <p className="text-xs text-slate-600 mb-4">The single highest-leverage upcoming action per metric</p>
      <div className="grid grid-cols-3 gap-4">
        {(Object.keys(METRIC_META) as (keyof typeof METRIC_META)[]).map(key => {
          const metricKey = key as 'churnRisk' | 'expansionScore' | 'npsScore'
          const lever = levers[metricKey]
          const meta = METRIC_META[key]
          const comparison = compareToPortfolio(metricKey, account)
          return (
            <div key={key} className="bg-[#0f1117] border border-[#1e2235] rounded-lg p-4">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-xs text-slate-500 uppercase tracking-widest">{meta.title}</p>
                <p className="text-lg font-bold text-white">{meta.format(account)}</p>
              </div>
              <p className={`text-xs mb-3 ${comparison.isBetterThanAverage ? 'text-emerald-400' : 'text-amber-400'}`}>
                {comparison.label}
              </p>
              {lever ? (
                <p className="text-xs text-slate-300 leading-relaxed">{lever.action.action}</p>
              ) : (
                <p className="text-xs text-slate-600">No upcoming action currently targets this metric.</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
