import { useLearningLoopContext } from '../../context/LearningLoopContext'

const ACTION_COLOR: Record<string, string> = {
  accept: 'text-emerald-400',
  edit: 'text-amber-400',
  reject: 'text-red-400',
}

export function AuditLogPanel() {
  const { reviews } = useLearningLoopContext()
  const rows = reviews.flatMap(r =>
    r.fieldFeedback.map(fb => ({
      reviewId: r.reviewId,
      timestamp: r.timestamp,
      reviewer: r.reviewer,
      tier: r.reviewerTier,
      field: fb.field,
      action: fb.action,
      reasonTag: fb.reasonTag,
      patternTag: fb.patternTag,
    })),
  )

  if (rows.length === 0) {
    return <p className="text-sm text-slate-600">No reviews logged yet.</p>
  }

  return (
    <div className="bg-[#141720] border border-[#1e2235] rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#0f1117] text-xs text-slate-500 uppercase tracking-widest">
            <th className="text-left px-4 py-2">Review</th>
            <th className="text-left px-4 py-2">Reviewer</th>
            <th className="text-left px-4 py-2">Field</th>
            <th className="text-left px-4 py-2">Action</th>
            <th className="text-left px-4 py-2">Reason</th>
            <th className="text-left px-4 py-2">Pattern</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-[#1e2235]">
              <td className="px-4 py-2 font-mono text-xs text-slate-500">{row.reviewId}</td>
              <td className="px-4 py-2 text-slate-300">{row.reviewer} <span className="text-slate-600">({row.tier})</span></td>
              <td className="px-4 py-2 font-mono text-xs text-slate-400">{row.field}</td>
              <td className={`px-4 py-2 font-semibold ${ACTION_COLOR[row.action]}`}>{row.action}</td>
              <td className="px-4 py-2 text-slate-500">{row.reasonTag ?? '—'}</td>
              <td className="px-4 py-2 text-slate-500">{row.patternTag}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
