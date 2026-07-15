// Ties every priority action to the metric it's actually meant to move.
// The point: nothing in this app should just be an activity — each action
// should be legible as "this is the lever, this is the metric it pulls."
//
// Deliberately simple keyword heuristics rather than hand-authored data per
// account, so it works uniformly across every account without extra
// authoring, current or future.

import type { Account, PriorityAction, Urgency } from '../data/accounts'

export type Metric = 'churnRisk' | 'expansionScore' | 'npsScore'

export interface MetricImpact {
  metric: Metric
  label: string          // "Churn Risk", "Expansion Score", "NPS"
  direction: 'down' | 'up' // which way the action should move the metric (down = good for churnRisk)
  magnitude: 'high' | 'medium' | 'low'
  currentValue: number
}

const EXPANSION_KEYWORDS = /roi|business case|expansion|cross-sell|upsell|pipeline|budget review|cost reduction/i
const RELATIONSHIP_KEYWORDS = /champion|talking points|brief|credit|stakeholder|advocate|political/i
const RETENTION_KEYWORDS = /bug|deploy|sign-off|remediation|sla|compliance|technical|migration|churn|escalat/i

function urgencyToMagnitude(u: Urgency): MetricImpact['magnitude'] {
  if (u === 'Critical') return 'high'
  if (u === 'High') return 'medium'
  return 'low'
}

export function estimateImpact(action: PriorityAction, account: Account): MetricImpact {
  const text = action.action

  if (EXPANSION_KEYWORDS.test(text)) {
    return { metric: 'expansionScore', label: 'Expansion Score', direction: 'up', magnitude: urgencyToMagnitude(action.urgency), currentValue: account.expansionScore }
  }
  if (RELATIONSHIP_KEYWORDS.test(text)) {
    return { metric: 'npsScore', label: 'NPS', direction: 'up', magnitude: urgencyToMagnitude(action.urgency), currentValue: account.npsScore }
  }
  if (RETENTION_KEYWORDS.test(text) || action.role === 'FDE') {
    return { metric: 'churnRisk', label: 'Churn Risk', direction: 'down', magnitude: urgencyToMagnitude(action.urgency), currentValue: account.churnRisk }
  }
  // default: most unclassified CS actions are retention-motivated
  return { metric: 'churnRisk', label: 'Churn Risk', direction: 'down', magnitude: urgencyToMagnitude(action.urgency), currentValue: account.churnRisk }
}

export function impactLabel(impact: MetricImpact): string {
  const arrow = impact.direction === 'down' ? '↓' : '↑'
  return `${arrow} ${impact.label}`
}

// For each metric, find the single highest-leverage upcoming action —
// the "if you only do one thing to move this number" answer.
export function topLeverPerMetric(account: Account): Record<Metric, { action: PriorityAction; impact: MetricImpact } | null> {
  const order: Record<Urgency, number> = { Critical: 0, High: 1, Medium: 2 }
  const result: Record<Metric, { action: PriorityAction; impact: MetricImpact } | null> = {
    churnRisk: null,
    expansionScore: null,
    npsScore: null,
  }

  const ranked = [...account.synthesis.priorityActions].sort((a, b) => order[a.urgency] - order[b.urgency])
  for (const action of ranked) {
    const impact = estimateImpact(action, account)
    if (!result[impact.metric]) {
      result[impact.metric] = { action, impact }
    }
  }
  return result
}
