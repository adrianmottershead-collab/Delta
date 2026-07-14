// Playbook-as-state: the in-browser equivalent of playbook_store.py.
//
// There's no filesystem/git available client-side, so this keeps the same
// candidate -> canonical promotion rules and full provenance, but as plain
// in-memory state (consistent with how the rest of this app already works
// — see useActionLog.ts, which is also just React state with no backend).
// In production this same logic would sit behind an API and write to the
// git-backed playbook store from the Python prototype; the promotion rules
// themselves don't change.

import type { PlaybookRole, PlaybookRule, ReviewerTier } from '../types/learningLoop'

export const REINFORCEMENT_THRESHOLD = 2

export function findCandidate(
  candidates: PlaybookRule[],
  patternTag: string,
  role: PlaybookRole,
  ruleKey: string,
): PlaybookRule | undefined {
  return candidates.find(
    r => r.patternTag === patternTag && r.role === role && r.ruleId.startsWith(`cand-${ruleKey}`),
  )
}

export interface SubmitCorrectionInput {
  patternTag: string
  role: PlaybookRole
  guidance: string
  ruleKey: string
  reviewId: string
  reviewer: string
  reviewerTier: ReviewerTier
  sourceFieldIndex?: number
}

export interface SubmitCorrectionResult {
  canonical: PlaybookRule[]
  candidates: PlaybookRule[]
  rule: PlaybookRule
  promoted: boolean
}

export function submitCorrection(
  canonical: PlaybookRule[],
  candidates: PlaybookRule[],
  input: SubmitCorrectionInput,
): SubmitCorrectionResult {
  const now = new Date().toISOString()
  const existing = findCandidate(candidates, input.patternTag, input.role, input.ruleKey)

  let rule: PlaybookRule
  let nextCandidates: PlaybookRule[]

  if (existing) {
    const alreadyCounted =
      existing.reinforcedByReviewIds.includes(input.reviewId) ||
      existing.createdFromReviewIds.includes(input.reviewId)
    rule = alreadyCounted
      ? existing
      : { ...existing, reinforcedByReviewIds: [...existing.reinforcedByReviewIds, input.reviewId] }
    nextCandidates = candidates.map(r => (r.ruleId === rule.ruleId ? rule : r))
  } else {
    rule = {
      ruleId: `cand-${input.ruleKey}-${Math.random().toString(16).slice(2, 8)}`,
      patternTag: input.patternTag,
      role: input.role,
      guidance: input.guidance,
      status: 'candidate',
      createdBy: input.reviewer,
      createdAt: now,
      createdFromReviewIds: [input.reviewId],
      reinforcedByReviewIds: [],
      sourceFieldIndex: input.sourceFieldIndex ?? 0,
    }
    nextCandidates = [...candidates, rule]
  }

  // Trust gate: a senior's correction is trusted solo; a junior's needs
  // reinforcement from a second, independent reviewer.
  const reinforcementCount = rule.reinforcedByReviewIds.length + 1 // +1 for the original correction
  const trusted = input.reviewerTier === 'senior' || reinforcementCount >= REINFORCEMENT_THRESHOLD

  if (trusted && rule.status === 'candidate') {
    const promotedRule: PlaybookRule = {
      ...rule,
      status: 'canonical',
      promotedBy: input.reviewer,
      promotedAt: now,
    }
    return {
      canonical: [...canonical, promotedRule],
      candidates: nextCandidates.filter(r => r.ruleId !== rule.ruleId),
      rule: promotedRule,
      promoted: true,
    }
  }

  return { canonical, candidates: nextCandidates, rule, promoted: false }
}

export function promoteManually(
  canonical: PlaybookRule[],
  candidates: PlaybookRule[],
  ruleId: string,
  promotedBy: string,
): { canonical: PlaybookRule[]; candidates: PlaybookRule[] } {
  const target = candidates.find(r => r.ruleId === ruleId)
  if (!target) return { canonical, candidates }
  const promoted: PlaybookRule = {
    ...target,
    status: 'canonical',
    promotedBy,
    promotedAt: new Date().toISOString(),
  }
  return {
    canonical: [...canonical, promoted],
    candidates: candidates.filter(r => r.ruleId !== ruleId),
  }
}
