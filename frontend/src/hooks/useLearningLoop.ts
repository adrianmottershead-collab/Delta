import { useCallback, useMemo, useState } from 'react'
import type {
  FieldFeedback,
  PatternConfidence,
  PlaybookRole,
  PlaybookRule,
  ReasonTag,
  ReviewRecord,
  Reviewer,
  ReviewerTier,
} from '../types/learningLoop'
import { DEFAULT_REVIEWERS } from '../learningLoop/trust'
import { computeConfidence } from '../learningLoop/confidence'
import { promoteManually, submitCorrection } from '../learningLoop/playbookLogic'

export interface FieldDecision {
  field: string
  action: 'accept' | 'edit' | 'reject'
  original: string
  edited?: string
  reasonTag?: ReasonTag
  patternTag: string
  role: PlaybookRole
  ruleKey?: string // required for edit/reject if you want it to become a rule
}

export interface SubmitReviewInput {
  accountId: string
  reviewer: string
  reviewerTier: ReviewerTier
  patternTags: string[]
  decisions: FieldDecision[]
}

export interface SubmitReviewResult {
  reviewId: string
  promotedRuleIds: string[]
}

function makeReviewId() {
  return `REV-${Math.random().toString(16).slice(2, 10)}`
}

export function useLearningLoop() {
  const [canonical, setCanonical] = useState<PlaybookRule[]>([])
  const [candidates, setCandidates] = useState<PlaybookRule[]>([])
  const [reviews, setReviews] = useState<ReviewRecord[]>([])
  const [reviewers, setReviewers] = useState<Reviewer[]>(DEFAULT_REVIEWERS)

  const submitReview = useCallback((input: SubmitReviewInput): SubmitReviewResult => {
    const reviewId = makeReviewId()
    const promotedRuleIds: string[] = []

    // Apply corrections first so the resulting canonical/candidate state
    // reflects this review, then log the review itself.
    let nextCanonical = canonical
    let nextCandidates = candidates

    for (const d of input.decisions) {
      if ((d.action === 'edit' || d.action === 'reject') && d.ruleKey) {
        const indexMatch = d.field.match(/\[(\d+)\]$/)
        const result = submitCorrection(nextCanonical, nextCandidates, {
          patternTag: d.patternTag,
          role: d.role,
          guidance: d.edited ?? d.original,
          ruleKey: d.ruleKey,
          reviewId,
          reviewer: input.reviewer,
          reviewerTier: input.reviewerTier,
          sourceFieldIndex: indexMatch ? Number(indexMatch[1]) : 0,
        })
        nextCanonical = result.canonical
        nextCandidates = result.candidates
        if (result.promoted) promotedRuleIds.push(result.rule.ruleId)
      }
    }

    setCanonical(nextCanonical)
    setCandidates(nextCandidates)

    const fieldFeedback: FieldFeedback[] = input.decisions.map(d => ({
      field: d.field,
      action: d.action,
      reasonTag: d.reasonTag,
      original: d.original,
      edited: d.edited,
      patternTag: d.patternTag,
    }))

    const record: ReviewRecord = {
      reviewId,
      accountId: input.accountId,
      timestamp: new Date().toISOString(),
      reviewer: input.reviewer,
      reviewerTier: input.reviewerTier,
      fieldFeedback,
      patternTags: input.patternTags,
    }
    setReviews(prev => [...prev, record])

    return { reviewId, promotedRuleIds }
  }, [canonical, candidates])

  const promoteRule = useCallback((ruleId: string, promotedBy: string) => {
    const result = promoteManually(canonical, candidates, ruleId, promotedBy)
    setCanonical(result.canonical)
    setCandidates(result.candidates)
  }, [canonical, candidates])

  const addReviewer = useCallback((name: string, tier: ReviewerTier) => {
    setReviewers(prev => [...prev.filter(r => r.name !== name), { name, tier }])
  }, [])

  const confidence: Record<string, PatternConfidence> = useMemo(
    () => computeConfidence(reviews, canonical, reviewers),
    [reviews, canonical, reviewers],
  )

  return {
    canonical,
    candidates,
    reviews,
    reviewers,
    confidence,
    submitReview,
    promoteRule,
    addReviewer,
  }
}

export type LearningLoop = ReturnType<typeof useLearningLoop>
