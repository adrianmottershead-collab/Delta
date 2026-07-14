import type { LoopDraft } from '../../learningLoop/generateDraft'
import type { PlaybookRole } from '../../types/learningLoop'

export interface DraftField {
  field: string
  label: string
  text: string
  role: PlaybookRole
}

export function draftToFields(draft: LoopDraft): DraftField[] {
  const fields: DraftField[] = [
    { field: 'pivotPoint', label: 'Pivot Point', text: draft.pivotPoint, role: 'synthesis' },
    { field: 'stakeholderRiskHeatmap', label: 'Stakeholder Risk Heatmap', text: draft.stakeholderRiskHeatmap, role: 'synthesis' },
    { field: 'deploymentSiloAnalysis', label: 'Deployment Silo Analysis', text: draft.deploymentSiloAnalysis, role: 'synthesis' },
  ]
  draft.playbook.cco.forEach((t, i) => fields.push({ field: `playbook.cco[${i}]`, label: `CCO action ${i + 1}`, text: t, role: 'cco' }))
  draft.playbook.csm.forEach((t, i) => fields.push({ field: `playbook.csm[${i}]`, label: `CSM action ${i + 1}`, text: t, role: 'csm' }))
  draft.playbook.fde.forEach((t, i) => fields.push({ field: `playbook.fde[${i}]`, label: `FDE action ${i + 1}`, text: t, role: 'fde' }))
  return fields
}
