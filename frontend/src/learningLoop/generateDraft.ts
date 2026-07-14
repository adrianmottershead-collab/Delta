// Baseline synthesis drafting, rule-based rather than a model call — same
// design choice as the Python prototype's generator.py: deterministic, no
// API dependency, and the effect of "learning" stays fully inspectable.
//
// Two stages: draft a deliberately generic baseline (what a zero-learning
// agent produces), then look up canonical playbook rules for the detected
// patterns and, where one exists, replace the generic line with the
// learned one.

import type { Account } from '../data/accounts'
import type { PlaybookRole, PlaybookRule } from '../types/learningLoop'
import { detectPatterns, fillTemplate, type PatternContext } from './patterns'

export interface DraftPlaybook {
  cco: string[]
  csm: string[]
  fde: string[]
}

export interface LoopDraft {
  accountId: string
  pivotPoint: string
  stakeholderRiskHeatmap: string
  deploymentSiloAnalysis: string
  playbook: DraftPlaybook
  patternTags: string[]
  appliedRuleIds: string[]
  generatedAt: string
}

function baselinePlaybook(ctx: PatternContext): DraftPlaybook {
  return {
    cco: [
      fillTemplate('Schedule a check-in call with {gatekeeper} to discuss the sign-off timeline.', ctx),
      fillTemplate('Monitor the relationship with {buyer} ahead of the renewal.', ctx),
    ],
    csm: [
      fillTemplate('Send {buyer} a status update on deployment progress.', ctx),
      fillTemplate("Check in with {champion} to see how they're doing.", ctx),
    ],
    fde: [
      fillTemplate('Continue working the open {bugCount} P1 bugs on {stalledDivision}.', ctx),
    ],
  }
}

function baselinePivotPoint(ctx: PatternContext): string {
  return fillTemplate(
    'Resolving the {bugCount} open P1 bugs on {stalledDivision} is the fastest path to unblocking {dealName}.',
    ctx,
  )
}

function baselineHeatmap(ctx: PatternContext): string {
  return fillTemplate(
    '{gatekeeper} is currently the primary blocker with veto power over sign-off. {buyer} is negative on the ' +
      "account and gating {dealName} behind resolution. {champion} is a positive internal advocate but exposed " +
      'by the ongoing delay.',
    ctx,
  )
}

function baselineSilo(ctx: PatternContext): string {
  return fillTemplate(
    '{healthyDivision} is healthy and reference-ready. {stalledDivision} is stalled at a fraction of expected ' +
      "usage, which is distorting the account's overall health signal.",
    ctx,
  )
}

export function generateDraft(account: Account, canonicalRules: PlaybookRule[]): LoopDraft {
  const { tags, context } = detectPatterns(account)
  const playbook = baselinePlaybook(context)
  let pivotPoint = baselinePivotPoint(context)
  const heatmap = baselineHeatmap(context)
  const silo = baselineSilo(context)
  const appliedRuleIds: string[] = []

  const roleLists: Record<Exclude<PlaybookRole, 'synthesis'>, string[]> = {
    cco: playbook.cco,
    csm: playbook.csm,
    fde: playbook.fde,
  }

  for (const tag of tags) {
    const rulesForTag = canonicalRules.filter(r => r.patternTag === tag)
    for (const rule of rulesForTag) {
      const guidance = fillTemplate(rule.guidance, context)
      if (rule.role === 'synthesis') {
        pivotPoint = guidance
      } else if (roleLists[rule.role] && roleLists[rule.role].length > 0) {
        // Learned guidance replaces the specific bullet this correction
        // originally targeted, falling back to the first bullet if that
        // index doesn't exist on this account's draft.
        const list = roleLists[rule.role]
        const idx = rule.sourceFieldIndex !== undefined && rule.sourceFieldIndex < list.length ? rule.sourceFieldIndex : 0
        list[idx] = guidance
      }
      appliedRuleIds.push(rule.ruleId)
    }
  }

  return {
    accountId: account.id,
    pivotPoint,
    stakeholderRiskHeatmap: heatmap,
    deploymentSiloAnalysis: silo,
    playbook,
    patternTags: tags,
    appliedRuleIds,
    generatedAt: new Date().toISOString(),
  }
}
