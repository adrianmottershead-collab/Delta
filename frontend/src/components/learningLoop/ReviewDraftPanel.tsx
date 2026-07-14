import { useMemo, useState } from 'react'
import type { Account } from '../../data/accounts'
import { generateDraft, type LoopDraft } from '../../learningLoop/generateDraft'
import { draftToFields } from './reviewFields'
import { useLearningLoopContext } from '../../context/LearningLoopContext'
import { REASON_TAGS, type FieldAction, type ReasonTag } from '../../types/learningLoop'
import type { FieldDecision } from '../../hooks/useLearningLoop'

const ROLE_COLOR: Record<string, string> = {
  cco: 'border-amber-700 text-amber-300',
  csm: 'border-blue-700 text-blue-300',
  fde: 'border-teal-700 text-teal-300',
  synthesis: 'border-indigo-700 text-indigo-300',
}

interface Props {
  accounts: Account[]
}

export function ReviewDraftPanel({ accounts }: Props) {
  const { canonical, reviewers, addReviewer, submitReview } = useLearningLoopContext()
  const [accountId, setAccountId] = useState(accounts[0].id)
  const [reviewerName, setReviewerName] = useState(reviewers[0]?.name ?? '')
  const [newReviewerName, setNewReviewerName] = useState('')
  const [newReviewerTier, setNewReviewerTier] = useState<'junior' | 'senior'>('junior')
  const [draft, setDraft] = useState<LoopDraft | null>(null)
  const [decisions, setDecisions] = useState<Record<string, FieldDecision>>({})
  const [status, setStatus] = useState<string | null>(null)

  const account = accounts.find(a => a.id === accountId)!
  const fields = useMemo(() => (draft ? draftToFields(draft) : []), [draft])
  const reviewerTier = reviewers.find(r => r.name === reviewerName)?.tier ?? 'junior'

  function handleGenerate() {
    const d = generateDraft(account, canonical)
    setDraft(d)
    setStatus(null)
    const initial: Record<string, FieldDecision> = {}
    draftToFields(d).forEach(f => {
      initial[f.field] = {
        field: f.field,
        action: 'accept',
        original: f.text,
        edited: f.text,
        patternTag: d.patternTags[0] ?? 'untagged',
        role: f.role,
      }
    })
    setDecisions(initial)
  }

  function updateDecision(field: string, patch: Partial<FieldDecision>) {
    setDecisions(prev => ({ ...prev, [field]: { ...prev[field], ...patch } }))
  }

  function handleAddReviewer() {
    if (!newReviewerName.trim()) return
    addReviewer(newReviewerName.trim(), newReviewerTier)
    setReviewerName(newReviewerName.trim())
    setNewReviewerName('')
  }

  function handleSubmit() {
    if (!draft) return
    const result = submitReview({
      accountId,
      reviewer: reviewerName,
      reviewerTier,
      patternTags: draft.patternTags,
      decisions: Object.values(decisions),
    })
    setStatus(
      result.promotedRuleIds.length > 0
        ? `Logged as ${result.reviewId}. ${result.promotedRuleIds.length} rule(s) promoted to canonical — regenerate the draft to see them applied.`
        : `Logged as ${result.reviewId}. No rule promoted yet — corrections from a junior reviewer need one more independent match first.`,
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-5 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-slate-500 uppercase tracking-widest mb-1">Account</label>
          <select
            value={accountId}
            onChange={e => { setAccountId(e.target.value); setDraft(null) }}
            className="bg-[#0f1117] border border-[#1e2235] rounded-lg px-3 py-2 text-sm text-white"
          >
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 uppercase tracking-widest mb-1">Reviewer</label>
          <select
            value={reviewerName}
            onChange={e => setReviewerName(e.target.value)}
            className="bg-[#0f1117] border border-[#1e2235] rounded-lg px-3 py-2 text-sm text-white"
          >
            {reviewers.map(r => <option key={r.name} value={r.name}>{r.name} — {r.tier}</option>)}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <div>
            <label className="block text-xs text-slate-500 uppercase tracking-widest mb-1">Add reviewer</label>
            <input
              value={newReviewerName}
              onChange={e => setNewReviewerName(e.target.value)}
              placeholder="Name"
              className="bg-[#0f1117] border border-[#1e2235] rounded-lg px-3 py-2 text-sm text-white w-40"
            />
          </div>
          <select
            value={newReviewerTier}
            onChange={e => setNewReviewerTier(e.target.value as 'junior' | 'senior')}
            className="bg-[#0f1117] border border-[#1e2235] rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="junior">junior</option>
            <option value="senior">senior</option>
          </select>
          <button
            onClick={handleAddReviewer}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#1e2235] text-slate-300 hover:text-white"
          >
            Add
          </button>
        </div>

        <button
          onClick={handleGenerate}
          className="ml-auto px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          🧠 Generate draft
        </button>
      </div>

      {draft && (
        <>
          <div className="bg-indigo-950/30 border border-indigo-700/50 rounded-xl px-5 py-3 text-xs text-indigo-200">
            Patterns detected: <span className="font-mono">{draft.patternTags.join(', ') || 'none'}</span>
            {' · '}
            Canonical rules applied: <span className="font-mono">{draft.appliedRuleIds.join(', ') || 'none yet'}</span>
          </div>

          <div className="space-y-3">
            {fields.map(f => {
              const d = decisions[f.field]
              if (!d) return null
              return (
                <div key={f.field} className={`bg-[#141720] border rounded-xl p-4 ${ROLE_COLOR[f.role].split(' ')[0]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase tracking-widest ${ROLE_COLOR[f.role].split(' ')[1]}`}>{f.label}</span>
                    <div className="flex gap-1">
                      {(['accept', 'edit', 'reject'] as FieldAction[]).map(a => (
                        <button
                          key={a}
                          onClick={() => updateDecision(f.field, { action: a, edited: a === 'accept' ? f.text : d.edited })}
                          className={`px-2.5 py-1 rounded text-xs font-semibold capitalize ${
                            d.action === a
                              ? a === 'accept' ? 'bg-emerald-700 text-white' : a === 'edit' ? 'bg-amber-700 text-white' : 'bg-red-700 text-white'
                              : 'bg-[#0f1117] text-slate-400 hover:text-white'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed mb-2">{f.text}</p>

                  {d.action !== 'accept' && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Corrected text</label>
                        <textarea
                          value={d.edited}
                          onChange={e => updateDecision(f.field, { edited: e.target.value })}
                          className="w-full bg-[#0f1117] border border-[#1e2235] rounded-lg px-3 py-2 text-sm text-white"
                          rows={2}
                        />
                        <label className="block text-xs text-slate-500 mb-1 mt-2">Reason</label>
                        <select
                          value={d.reasonTag ?? ''}
                          onChange={e => updateDecision(f.field, { reasonTag: e.target.value as ReasonTag })}
                          className="bg-[#0f1117] border border-[#1e2235] rounded-lg px-3 py-2 text-sm text-white w-full"
                        >
                          <option value="" disabled>Select a reason…</option>
                          {REASON_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Pattern this belongs to</label>
                        <select
                          value={d.patternTag}
                          onChange={e => updateDecision(f.field, { patternTag: e.target.value })}
                          className="bg-[#0f1117] border border-[#1e2235] rounded-lg px-3 py-2 text-sm text-white w-full"
                        >
                          {(draft.patternTags.length ? draft.patternTags : ['untagged']).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        {f.role !== 'synthesis' && (
                          <>
                            <label className="block text-xs text-slate-500 mb-1 mt-2">
                              Rule key (groups this with the same correction elsewhere)
                            </label>
                            <input
                              value={d.ruleKey ?? ''}
                              onChange={e => updateDecision(f.field, { ruleKey: e.target.value })}
                              placeholder="e.g. name-gatekeeper-sla"
                              className="bg-[#0f1117] border border-[#1e2235] rounded-lg px-3 py-2 text-sm text-white w-full"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            ✅ Submit review
          </button>

          {status && (
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl px-5 py-3 text-sm text-emerald-300">
              {status}
            </div>
          )}
        </>
      )}
    </div>
  )
}
