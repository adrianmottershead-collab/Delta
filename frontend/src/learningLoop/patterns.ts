// Situational pattern detection — the join key that lets a correction made
// on one account generalize to a different account. See generator.py's
// detect_patterns() in the standalone Python prototype for the original.

import type { Account } from '../data/accounts'

export interface PatternContext {
  gatekeeper: string
  champion: string
  buyer: string
  bugCount: number
  dealName: string
  dealValue: string
  stalledDivision: string
  healthyDivision: string
}

export function detectPatterns(account: Account): { tags: string[]; context: PatternContext } {
  const gatekeeper = account.stakeholders.find(s => s.role === 'Technical Gatekeeper')
  const champion = account.stakeholders.find(s => s.role === 'Internal Champion')
  const buyer = account.stakeholders.find(s => s.role === 'Economic Buyer')
  const stalled = account.deployments.filter(d => d.status === 'Stalled')
  const healthy = account.deployments.filter(d => d.status === 'Stable')
  const deal = account.opportunities[0]

  const tags: string[] = []
  if (stalled.length > 0 && gatekeeper?.sentiment === 'Blocked' && account.openCriticalBugs > 0) {
    tags.push('technical_gatekeeper_veto')
  }
  if (champion?.sentiment === 'Positive' && stalled.length > 0) {
    tags.push('champion_capital_erosion')
  }
  if (buyer?.sentiment === 'Negative' && deal) {
    tags.push('commercial_gate_blocked')
  }

  const context: PatternContext = {
    gatekeeper: gatekeeper?.name ?? 'the technical gatekeeper',
    champion: champion?.name ?? 'the internal champion',
    buyer: buyer?.name ?? 'the economic buyer',
    bugCount: account.openCriticalBugs,
    dealName: deal?.name ?? 'the pending expansion',
    dealValue: deal ? `$${deal.value.toLocaleString()}` : 'the pending value',
    stalledDivision: stalled[0]?.division ?? 'the stalled deployment',
    healthyDivision: healthy[0]?.division ?? 'the healthy deployment',
  }

  return { tags, context }
}

export function fillTemplate(template: string, ctx: PatternContext): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = (ctx as unknown as Record<string, string | number>)[key]
    return value === undefined ? `{${key}}` : String(value)
  })
}
