// Types for the Delta Learning Loop extension.
//
// Mirrors the standalone Python prototype (schema.py / playbook_store.py /
// confidence.py) one-to-one, so the same story — draft, structured
// feedback, trust-gated promotion, per-pattern confidence — holds whether
// you're looking at the Python demo or this in-app version.

export type ReviewerTier = 'junior' | 'senior'
export type FieldAction = 'accept' | 'edit' | 'reject'
export type RuleStatus = 'candidate' | 'canonical'
export type AutonomyTier = 'draft_only' | 'approve_to_send' | 'auto_send_notify' | 'autonomous'
export type PlaybookRole = 'cco' | 'csm' | 'fde' | 'synthesis'

export const REASON_TAGS = [
  'not_specific_enough',
  'missed_actionability',
  'wrong_pivot',
  'missed_stakeholder',
  'tone_off',
  'factually_wrong',
  'other',
] as const
export type ReasonTag = typeof REASON_TAGS[number]

export interface Reviewer {
  name: string
  tier: ReviewerTier
}

export interface FieldFeedback {
  field: string
  action: FieldAction
  reasonTag?: ReasonTag
  original: string
  edited?: string
  patternTag: string
}

export interface ReviewRecord {
  reviewId: string
  accountId: string
  timestamp: string
  reviewer: string
  reviewerTier: ReviewerTier
  fieldFeedback: FieldFeedback[]
  patternTags: string[]
}

export interface PlaybookRule {
  ruleId: string
  patternTag: string
  role: PlaybookRole
  guidance: string // may contain {gatekeeper}/{champion}/{buyer}/etc placeholders
  status: RuleStatus
  createdBy: string
  createdAt: string
  createdFromReviewIds: string[]
  reinforcedByReviewIds: string[]
  promotedBy?: string
  promotedAt?: string
  // Which bullet index within the role's playbook array this correction
  // targeted originally (e.g. playbook.csm[1] -> 1). Defaults to 0 if
  // absent, but tracking it means a correction to the second bullet
  // doesn't end up overwriting the first one on future drafts.
  sourceFieldIndex?: number
}

export interface PatternConfidence {
  patternTag: string
  totalFieldsReviewed: number
  acceptedFields: number
  editedFields: number
  rejectedFields: number
  acceptanceRate: number
  seniorEndorsed: boolean
  autonomyTier: AutonomyTier
}

// A draft is the same shape as Delta's real Synthesis, plus the two fields
// that make the loop inspectable: which patterns were detected, and which
// canonical rules (if any) shaped this particular draft.
export interface DraftMeta {
  patternTags: string[]
  appliedRuleIds: string[]
  generatedAt: string
}
