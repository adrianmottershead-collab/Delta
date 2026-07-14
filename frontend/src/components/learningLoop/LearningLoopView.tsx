import { useState } from 'react'
import type { Account } from '../../data/accounts'
import { useLearningLoop } from '../../hooks/useLearningLoop'
import { LearningLoopContext } from '../../context/LearningLoopContext'
import { ReviewDraftPanel } from './ReviewDraftPanel'
import { PlaybookPanel } from './PlaybookPanel'
import { AuditLogPanel } from './AuditLogPanel'
import { ConfidencePanel } from './ConfidencePanel'

const TABS = ['Review a Draft', 'Playbook', 'Audit Log', 'Confidence & Autonomy'] as const
type Tab = typeof TABS[number]

export function LearningLoopView({ accounts }: { accounts: Account[] }) {
  const loop = useLearningLoop()
  const [tab, setTab] = useState<Tab>('Review a Draft')

  return (
    <LearningLoopContext.Provider value={loop}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">🔁 Delta Learning Loop</h1>
        <p className="text-sm text-slate-500">
          Draft → structured feedback → trust-gated playbook → confidence-gated autonomy. Everything here is
          in-memory for this session, the same way the rest of this prototype works — no backend required to see
          the loop function end to end.
        </p>
      </div>

      <div className="flex gap-1 bg-[#0f1117] rounded-lg p-1 border border-[#1e2235] mb-4">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors ${
              tab === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Review a Draft' && <ReviewDraftPanel accounts={accounts} />}
      {tab === 'Playbook' && <PlaybookPanel />}
      {tab === 'Audit Log' && <AuditLogPanel />}
      {tab === 'Confidence & Autonomy' && <ConfidencePanel />}
    </LearningLoopContext.Provider>
  )
}
