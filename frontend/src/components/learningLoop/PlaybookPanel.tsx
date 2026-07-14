import { useLearningLoopContext } from '../../context/LearningLoopContext'

export function PlaybookPanel() {
  const { canonical, candidates, promoteRule } = useLearningLoopContext()

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
          Canonical rules — actively shaping every draft
        </p>
        {canonical.length === 0 ? (
          <p className="text-sm text-slate-600">No canonical rules yet — submit a review in the Review a Draft tab.</p>
        ) : (
          <div className="space-y-3">
            {canonical.map(r => (
              <div key={r.ruleId} className="bg-[#141720] border border-[#1e2235] rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-slate-500">{r.ruleId}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {r.patternTag} · {r.role}
                  </span>
                </div>
                <p className="text-sm text-white leading-relaxed mb-2">{r.guidance}</p>
                <p className="text-xs text-slate-500">
                  created by {r.createdBy} · promoted by {r.promotedBy ?? '—'} · reinforced by{' '}
                  {r.reinforcedByReviewIds.length} review(s)
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
          Candidate rules — awaiting reinforcement or senior sign-off
        </p>
        {candidates.length === 0 ? (
          <p className="text-sm text-slate-600">No pending candidates.</p>
        ) : (
          <div className="space-y-3">
            {candidates.map(r => (
              <div key={r.ruleId} className="bg-[#141720] border border-amber-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-slate-500">{r.ruleId}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                    {r.patternTag} · {r.role}
                  </span>
                </div>
                <p className="text-sm text-white leading-relaxed mb-2">{r.guidance}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    created by {r.createdBy} · reinforced by {r.reinforcedByReviewIds.length} review(s)
                  </p>
                  <button
                    onClick={() => promoteRule(r.ruleId, 'manual override (Delta UI)')}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#1e2235] text-slate-300 hover:text-white"
                  >
                    Manually promote
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
