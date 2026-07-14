import { createContext, useContext } from 'react'
import type { LearningLoop } from '../hooks/useLearningLoop'

const noop = () => {}

export const LearningLoopContext = createContext<LearningLoop>({
  canonical: [],
  candidates: [],
  reviews: [],
  reviewers: [],
  confidence: {},
  submitReview: () => ({ reviewId: '', promotedRuleIds: [] }),
  promoteRule: noop,
  addReviewer: noop,
})

export function useLearningLoopContext() {
  return useContext(LearningLoopContext)
}
