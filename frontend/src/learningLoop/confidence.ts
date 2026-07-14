// Per-pattern confidence + autonomy gating — mirrors confidence.py.
// Computed per pattern_tag, never globally: a pattern that's earned trust
// shouldn't be held back by an unrelated pattern that hasn't, and vice
// versa.

import type { AutonomyTier, PatternConfidence, PlaybookRule, ReviewRecord, Reviewer } from '../types/learningLoop'
import { tierOf } from './trust'

interface ThresholdRow {
  minN: number
  minRate: number
  requiresSeniorEndorsement: boolean
  tier: AutonomyTier
}

// Deliberately conservative — this touches the customer.
const THRESHOLDS: ThresholdRow[] = [
  { minN: 12, minRate: 0.95, requiresSeniorEndorsement: true, tier: 'autonomous' },
  { minN: 6, minRate: 0.85, requiresSeniorEndorsement: true, tier: 'auto_send_notify' },
  { minN: 3, minRate: 0.65, requiresSeniorEndorsement: false, tier: 'approve_to_send' },
]

function seniorEndorsed(patternTag: string, canonical: PlaybookRule[], reviewers: Reviewer[]): boolean {
  return canonical
    .filter(r => r.patternTag === patternTag)
    .some(r => tierOf(reviewers, r.promotedBy ?? r.createdBy) === 'senior')
}

export function computeConfidence(
  reviews: ReviewRecord[],
  canonical: PlaybookRule[],
  reviewers: Reviewer[],
): Record<string, PatternConfidence> {
  const tallies: Record<string, { accept: number; edit: number; reject: number }> = {}

  for (const review of reviews) {
    for (const fb of review.fieldFeedback) {
      const tag = fb.patternTag || review.patternTags[0] || 'untagged'
      tallies[tag] ??= { accept: 0, edit: 0, reject: 0 }
      tallies[tag][fb.action] += 1
    }
  }

  const results: Record<string, PatternConfidence> = {}
  for (const [tag, counts] of Object.entries(tallies)) {
    const total = counts.accept + counts.edit + counts.reject
    const rate = total ? counts.accept / total : 0
    const endorsed = seniorEndorsed(tag, canonical, reviewers)

    let tier: AutonomyTier = 'draft_only'
    for (const row of THRESHOLDS) {
      if (total >= row.minN && rate >= row.minRate && (endorsed || !row.requiresSeniorEndorsement)) {
        tier = row.tier
        break
      }
    }

    results[tag] = {
      patternTag: tag,
      totalFieldsReviewed: total,
      acceptedFields: counts.accept,
      editedFields: counts.edit,
      rejectedFields: counts.reject,
      acceptanceRate: Math.round(rate * 1000) / 1000,
      seniorEndorsed: endorsed,
      autonomyTier: tier,
    }
  }
  return results
}
