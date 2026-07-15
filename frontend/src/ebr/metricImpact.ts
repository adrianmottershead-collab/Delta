
// Ties every priority action to the metric it's actually meant to move.
// The point: nothing in this app should just be an activity — each action
// should be legible as "this is the lever, this is the metric it pulls."
//
// Deliberately simple keyword heuristics rather than hand-authored data per
// account, so it works uniformly across every account without extra
// authoring, current or future.

import type { Account, PriorityAction, Urgency } from '../data/accounts'
import { ACCOUNTS } from '../data/accounts'

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

// "Better" means different directions for different metrics — lower is
// better for churn risk, higher is better for expansion/NPS. This is what
// lets a raw number ("72/100") mean something: is that good or bad
// relative to the rest of the book of business?
const BETTER_WHEN_LOWER: Record<Metric, boolean> = {
  churnRisk: true,
  expansionScore: false,
  npsScore: false,
}

export function portfolioAverage(metric: Metric): number {
  const values = ACCOUNTS.map(a => a[metric])
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

export interface BenchmarkComparison {
  value: number
  average: number
  delta: number          // value - average, signed
  isBetterThanAverage: boolean
  label: string           // "18 pts better than portfolio avg (54)"
}

export function compareToPortfolio(metric: Metric, account: Account): BenchmarkComparison {
  const value = account[metric]
  const average = portfolioAverage(metric)
  const delta = value - average
  const betterWhenLower = BETTER_WHEN_LOWER[metric]
  const isBetterThanAverage = betterWhenLower ? delta < 0 : delta > 0
  const magnitude = Math.round(Math.abs(delta))
  const direction = isBetterThanAverage ? 'better' : 'worse'
  const label = magnitude === 0
    ? `in line with portfolio avg (${Math.round(average)})`
    : `${magnitude} pts ${direction} than portfolio avg (${Math.round(average)})`
  return { value, average, delta, isBetterThanAverage, label }
}
