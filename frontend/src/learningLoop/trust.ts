// Reviewer trust registry — deliberately explicit rather than inferred.
// Same three seed reviewers as the Python prototype, for continuity.

import type { Reviewer, ReviewerTier } from '../types/learningLoop'

export const DEFAULT_REVIEWERS: Reviewer[] = [
  { name: 'Priya Natarajan (Sr. CSM)', tier: 'senior' },
  { name: 'Adrian (CS Lead, learning the domain)', tier: 'junior' },
  { name: 'Jordan Lee (Associate CSM)', tier: 'junior' },
  { name: 'Marcus Webb (FDE Lead)', tier: 'senior' },
]

export function tierOf(reviewers: Reviewer[], name: string): ReviewerTier {
  return reviewers.find(r => r.name === name)?.tier ?? 'junior' // unknown reviewers default to junior
}
