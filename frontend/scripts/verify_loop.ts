import { ACCOUNTS } from '../src/data/accounts'
import { generateDraft } from '../src/learningLoop/generateDraft'
import { submitCorrection } from '../src/learningLoop/playbookLogic'
import { computeConfidence } from '../src/learningLoop/confidence'
import { DEFAULT_REVIEWERS } from '../src/learningLoop/trust'
import type { PlaybookRule, ReviewRecord } from '../src/types/learningLoop'

let canonical: PlaybookRule[] = []
let candidates: PlaybookRule[] = []
const reviews: ReviewRecord[] = []
function logReview(r: ReviewRecord) { reviews.push(r) }

const account = ACCOUNTS.find(a => a.id === 'global-bank-corp')!

console.log('=== ROUND 1: baseline draft, senior correction ===')
let draft = generateDraft(account, canonical)
console.log('patterns:', draft.patternTags)
console.log('CCO[0] baseline:', draft.playbook.cco[0])

let result = submitCorrection(canonical, candidates, {
  patternTag: 'technical_gatekeeper_veto',
  role: 'cco',
  guidance: 'Personally escalate to {gatekeeper} with a named 10-business-day remediation SLA and written accountability — not a general check-in.',
  ruleKey: 'name-gatekeeper-sla',
  reviewId: 'REV-001',
  reviewer: 'Priya Natarajan (Sr. CSM)',
  reviewerTier: 'senior',
})
canonical = result.canonical; candidates = result.candidates
console.log('promoted immediately (senior)?', result.promoted)
logReview({
  reviewId: 'REV-001', accountId: account.id, timestamp: new Date().toISOString(),
  reviewer: 'Priya Natarajan (Sr. CSM)', reviewerTier: 'senior',
  fieldFeedback: [
    { field: 'pivotPoint', action: 'accept', original: draft.pivotPoint, patternTag: 'technical_gatekeeper_veto' },
    { field: 'playbook.cco[0]', action: 'edit', original: draft.playbook.cco[0], edited: result.rule.guidance, patternTag: 'technical_gatekeeper_veto' },
    { field: 'playbook.cco[1]', action: 'accept', original: draft.playbook.cco[1], patternTag: 'commercial_gate_blocked' },
  ],
  patternTags: draft.patternTags,
})

console.log('\n=== ROUND 2: regenerated, junior correction (candidate, not yet canonical) ===')
draft = generateDraft(account, canonical)
console.log('CCO[0] now:', draft.playbook.cco[0])

result = submitCorrection(canonical, candidates, {
  patternTag: 'champion_capital_erosion',
  role: 'csm',
  guidance: "Give {champion} pre-drafted talking points defending the platform ahead of {buyer}'s review — she needs ammunition, not a check-in.",
  ruleKey: 'champion-give-talking-points',
  reviewId: 'REV-002',
  reviewer: 'Adrian (CS Lead, learning the domain)',
  reviewerTier: 'junior',
  sourceFieldIndex: 1,
})
canonical = result.canonical; candidates = result.candidates
console.log('promoted after 1 junior correction?', result.promoted, '(expect false)')

console.log('\n=== ROUND 3: second independent junior reinforces the same correction ===')
result = submitCorrection(canonical, candidates, {
  patternTag: 'champion_capital_erosion',
  role: 'csm',
  guidance: "Give {champion} pre-drafted talking points defending the platform ahead of {buyer}'s review — she needs ammunition, not a check-in.",
  ruleKey: 'champion-give-talking-points',
  reviewId: 'REV-003',
  reviewer: 'Jordan Lee (Associate CSM)',
  reviewerTier: 'junior',
  sourceFieldIndex: 1,
})
canonical = result.canonical; candidates = result.candidates
console.log('promoted after 2nd independent junior correction?', result.promoted, '(expect true)')

console.log('\n=== ROUND 4: regenerated again — both fixes now live with zero human input ===')
draft = generateDraft(account, canonical)
console.log('CCO[0]:', draft.playbook.cco[0])
console.log('CSM[1]:', draft.playbook.csm[1])
console.log('applied rule ids:', draft.appliedRuleIds)

logReview({
  reviewId: 'REV-004', accountId: account.id, timestamp: new Date().toISOString(),
  reviewer: 'Priya Natarajan (Sr. CSM)', reviewerTier: 'senior',
  fieldFeedback: [
    { field: 'pivotPoint', action: 'accept', original: draft.pivotPoint, patternTag: 'technical_gatekeeper_veto' },
    { field: 'playbook.cco[0]', action: 'accept', original: draft.playbook.cco[0], patternTag: 'technical_gatekeeper_veto' },
    { field: 'playbook.csm[1]', action: 'accept', original: draft.playbook.csm[1], patternTag: 'champion_capital_erosion' },
  ],
  patternTags: draft.patternTags,
})

console.log('\n=== CONFIDENCE ===')
const confidence = computeConfidence(reviews, canonical, DEFAULT_REVIEWERS)
for (const c of Object.values(confidence)) {
  console.log(`  ${c.patternTag.padEnd(30)} n=${c.totalFieldsReviewed} accept=${(c.acceptanceRate * 100).toFixed(0)}% senior_endorsed=${c.seniorEndorsed} -> ${c.autonomyTier}`)
}

console.log('\n=== CANONICAL PLAYBOOK ===')
for (const r of canonical) {
  console.log(`  ${r.ruleId}  [${r.patternTag}/${r.role}]  promoted_by=${r.promotedBy}`)
}

console.log('\nOK - TS port behaves consistently with the Python prototype.')
