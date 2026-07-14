import { useLearningLoopContext } from '../../context/LearningLoopContext'
import type { AutonomyTier } from '../../types/learningLoop'

const TIER_COLOR: Record<AutonomyTier, string> = {
  draft_only: 'bg-slate-800 text-slate-300 border-slate-700',
  approve_to_send: 'bg-blue-950 text-blue-300 border-blue-800',
  auto_send_notify: 'bg-amber-950 text-amber-300 border-amber-800',
  autonomous: 'bg-emerald-950 text-emerald-300 border-emerald-800',
}

export function ConfidencePanel() {
  const { confidence } = useLearningLoopContext()
  const rows = Object.values(confidence)

  if (rows.length === 0) {
    return <p className="text-sm text-slate-600">No data yet — submit some reviews first.</p>
  }

  return (
    <div className="space-y-3">
      {rows.map(c => (
        <div key={c.patternTag} className="bg-[#141720] border border-[#1e2235] rounded-xl p-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">{c.patternTag}</p>
            <p className="text-xs text-slate-500">
              n={c.totalFieldsReviewed} · accept {(c.acceptanceRate * 100).toFixed(0)}% · senior endorsed:{' '}
              {c.seniorEndorsed ? 'yes' : 'no'}
            </p>
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${TIER_COLOR[c.autonomyTier]}`}>
            {c.autonomyTier.replace(/_/g, ' ')}
          </span>
        </div>
      ))}
      <p className="text-xs text-slate-600 pt-2">
        Autonomy tiers: draft only → approve to send → auto send + notify → autonomous. Each step up requires more
        reps, a higher acceptance rate, and — from auto send + notify upward — at least one senior-endorsed
        canonical rule for that pattern.
      </p>
    </div>
  )
}
