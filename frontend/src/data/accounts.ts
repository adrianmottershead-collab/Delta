export type HealthStatus = 'Healthy' | 'At Risk' | 'Expanding' | 'Churning'
export type Sentiment = 'Positive' | 'Negative' | 'Blocked' | 'Neutral'
export type DeploymentStatus = 'Stable' | 'Stalled' | 'Expanding' | 'At Risk'

export interface Deployment {
  division: string
  usagePct: number
  status: DeploymentStatus
  notes: string
}

export interface Stakeholder {
  name: string
  role: string
  sentiment: Sentiment
  notes: string
  influence: number   // 1-10
  risk: number        // 1-10
}

export interface Opportunity {
  name: string
  value: number
  stage: string
}

export interface DagNode {
  id: string
  label: string
  type: 'blocker' | 'dependency' | 'outcome' | 'risk'
  x: number
  y: number
}

export interface DagEdge {
  from: string
  to: string
  label?: string
}

export interface TimelineEvent {
  day: number
  time: string
  source: string
  icon: string
  label: string
  body: string
}

export interface ProactiveAlert {
  thresholdCrossed: string
  siloInversionExplanation: string
  playbook: {
    cco: string[]
    csm: string[]
    fde: string[]
  }
}

export type Urgency = 'Critical' | 'High' | 'Medium'

export interface PriorityAction {
  role: 'CCO' | 'CSM' | 'FDE'
  action: string
  urgency: Urgency
  rationale: string
  deadline: string
}

export interface Synthesis {
  pivotPoint: string          // single sentence — the one move that unlocks everything
  stakeholderRiskHeatmap: string
  deploymentSiloAnalysis: string
  priorityActions: PriorityAction[]   // top actions across all roles, ordered
  playbook: {
    cco: string[]
    csm: string[]
    fde: string[]
  }
}

export interface Account {
  id: string
  name: string
  arr: number
  renewalDaysOut: number
  openCriticalBugs: number
  marketingEngagement: 'Low' | 'Medium' | 'High'
  healthStatus: HealthStatus
  churnRisk: number       // 0-100
  expansionScore: number  // 0-100
  npsScore: number
  deployments: Deployment[]
  stakeholders: Stakeholder[]
  opportunities: Opportunity[]
  fdeStatus: string
  csmNotes: string
  siloGraph: { nodes: DagNode[]; edges: DagEdge[] }
  timeline: TimelineEvent[]
  alerts: ProactiveAlert[]
  monthlyUsageTrend: { month: string; usage: number; benchmark: number }[]
  synthesis: Synthesis
}

// ── 1. Global Bank Corp — At Risk ─────────────────────────────────────────────
const globalBankCorp: Account = {
  id: 'global-bank-corp',
  name: 'Global Bank Corp',
  arr: 4_500_000,
  renewalDaysOut: 120,
  openCriticalBugs: 5,
  marketingEngagement: 'Low',
  healthStatus: 'At Risk',
  churnRisk: 72,
  expansionScore: 28,
  npsScore: 22,
  deployments: [
    {
      division: 'Retail Banking — Americas',
      usagePct: 100,
      status: 'Stable',
      notes:
        'Fully deployed across 3,200 retail branches. High adoption, stable workloads, zero open incidents. Reference-ready for case studies.',
    },
    {
      division: 'Wealth Management — APAC',
      usagePct: 15,
      status: 'Stalled',
      notes:
        'Blocked by a custom compliance API incompatibility. Five open P1 security bugs are preventing the Head of Infrastructure from issuing deployment sign-off.',
    },
  ],
  stakeholders: [
    {
      name: 'Global CIO',
      role: 'Economic Buyer',
      sentiment: 'Negative',
      notes:
        'Demanding 20% cost reduction across all technology vendors. Will not approve the EMEA expansion until global ROI proof is delivered.',
      influence: 10,
      risk: 9,
    },
    {
      name: 'Head of Infrastructure',
      role: 'Technical Gatekeeper',
      sentiment: 'Blocked',
      notes:
        'Holding veto on APAC deployment sign-off until all P1 security bugs are fully remediated with written compliance certification.',
      influence: 8,
      risk: 10,
    },
    {
      name: 'VP of Product Innovation',
      role: 'Internal Champion',
      sentiment: 'Positive',
      notes:
        'Strong advocate who championed the platform internally. Actively losing political capital as the APAC stall drags on.',
      influence: 6,
      risk: 7,
    },
  ],
  opportunities: [
    { name: 'EMEA Investment Banking Expansion', value: 1_500_000, stage: 'Stage 4 – Commercial Negotiation' },
  ],
  fdeStatus:
    '4-week joint FDE sprint fully scoped and resourced. Currently paused pending Head of Infrastructure sign-off on 5 open P1 security bugs.',
  csmNotes:
    'Account is at a critical inflection point. The Americas deployment is a showcase success being held hostage by the APAC failure. The entire commercial trajectory converges on resolving the P1 security bugs.',
  siloGraph: {
    nodes: [
      { id: 'bugs',   label: '5 P1 Security\nBugs Open',       type: 'blocker',    x: 80,  y: 200 },
      { id: 'infra',  label: 'Infra Lead\nSign-off Blocked',   type: 'blocker',    x: 240, y: 200 },
      { id: 'fde',    label: 'FDE Sprint\nOn Hold',            type: 'dependency', x: 400, y: 200 },
      { id: 'apac',   label: 'APAC Deployment\n15% Stalled',   type: 'dependency', x: 560, y: 200 },
      { id: 'cio',    label: 'CIO ROI\nMandate Unmet',         type: 'risk',       x: 560, y: 80  },
      { id: 'champ',  label: "Champion's\nCapital Eroding",    type: 'risk',       x: 560, y: 320 },
      { id: 'emea',   label: 'EMEA $1.5M\nDeal Gated',        type: 'outcome',    x: 720, y: 140 },
      { id: 'renewal',label: '$4.5M Renewal\nAt Risk',         type: 'outcome',    x: 720, y: 280 },
    ],
    edges: [
      { from: 'bugs',  to: 'infra',   label: 'prevents' },
      { from: 'infra', to: 'fde',     label: 'blocks' },
      { from: 'fde',   to: 'apac',    label: 'required for' },
      { from: 'apac',  to: 'cio',     label: 'fails to satisfy' },
      { from: 'apac',  to: 'champ',   label: 'undermines' },
      { from: 'cio',   to: 'emea',    label: 'withholds approval' },
      { from: 'cio',   to: 'renewal', label: 'threatens' },
      { from: 'champ', to: 'renewal', label: 'loses advocacy' },
    ],
  },
  timeline: [
    {
      day: 1, time: '09:00', source: 'Jira', icon: '🔴', label: 'Jira Alert',
      body: 'Head of Infrastructure has logged 2 new Critical P1 Security Bugs on the APAC deployment branch. Open P1 count now stands at 5. FDE sprint remains on hold.',
    },
    {
      day: 2, time: '14:00', source: 'Salesforce', icon: '📉', label: 'Salesforce Alert',
      body: 'EMEA Investment Banking expansion opportunity downgraded from $2,000,000 to $1,500,000. Technical approval delay on APAC deployment branch has eroded CIO confidence.',
    },
    {
      day: 3, time: '11:30', source: 'CSM Note', icon: '⚠️', label: 'CSM Note Inputted',
      body: '"Spoke to VP of Innovation. She warns that the CIO is meeting with a competitor tomorrow because of the APAC stall. This is no longer a technical problem — it is a commercial emergency."',
    },
  ],
  alerts: [
    {
      thresholdCrossed:
        'CRITICAL — P1 bug count escalated from 3 to 5. Remediation SLA has effectively reset. FDE sprint cannot start.',
      siloInversionExplanation:
        'The Americas success story is now working against the account. Every day Americas runs flawlessly, the CIO\'s narrative shifts to "why is APAC still broken?" The healthy silo amplifies the distress signal from the stalled one.',
      playbook: {
        cco: [
          'IMMEDIATE: Escalate P1 bug count to Engineering VP with a named 48-hour emergency triage SLA.',
          'Send Head of Infrastructure a direct communication acknowledging the new bugs and committing to a named engineer and remediation timeline.',
          'Brief VP of Product Innovation privately before the CIO learns about it.',
        ],
        csm: [
          'Do not let the CIO learn about the new P1 bugs from an internal report — proactively frame it today.',
          'Accelerate the Americas ROI Business Case — deliver within 5 days, not 14.',
          'Check in with the VP of Product Innovation today. Provide pre-drafted talking points.',
        ],
        fde: [
          'EMERGENCY: Assign two additional senior engineers to the new P1 bugs immediately.',
          'Deliver an updated P1 Remediation Plan to the Head of Infrastructure within 3 business days.',
          'Block all other FDE work on this account until all 5 P1 bugs have passed compliance certification.',
        ],
      },
    },
    {
      thresholdCrossed:
        'COMMERCIAL — EMEA expansion downgraded by $500K (25% value erosion). First measurable commercial casualty of the APAC stall.',
      siloInversionExplanation:
        'The APAC technical stall has escaped its containment zone and contaminated the EMEA commercial pipeline. The CIO is using APAC\'s failure to justify commercial conservatism in a region that has not yet experienced any delivery failure.',
      playbook: {
        cco: [
          'URGENT: Request an emergency executive call with the CIO this week. Lead with Americas ROI and a structured APAC resolution commitment letter.',
          'Personally call the CIO\'s office to deliver a verbal commitment on APAC resolution timeline before the formal meeting.',
          'Halt EMEA commercial negotiation activity until APAC narrative is stabilised.',
        ],
        csm: [
          'Pause outbound EMEA commercial activity immediately.',
          'Deliver the Americas ROI Business Case to the CIO within 5 days.',
          'Schedule a call with the VP of Product Innovation today to understand what the CIO has been told internally.',
        ],
        fde: [
          'Commit to a hard delivery date for all 5 P1 fixes and communicate to CSM for CIO-level messaging.',
          'Prepare a one-page technical resolution summary for non-technical stakeholders.',
        ],
      },
    },
    {
      thresholdCrossed:
        'EXISTENTIAL — CIO is meeting a named competitor tomorrow. Active churn motion. Category 1 account emergency.',
      siloInversionExplanation:
        'The Americas deployment is now a liability. The competitor will use it as proof that migration is feasible. The APAC stall has handed the competitor a turnkey objection removal strategy.',
      playbook: {
        cco: [
          'CALL THE CIO TODAY. The CCO must personally intervene before the competitor meeting occurs.',
          'Offer a concrete, time-bound executive commitment on APAC resolution with personal accountability.',
          'Send the VP of Product Innovation a direct message of support immediately — she is the internal firewall.',
        ],
        csm: [
          'Call the VP of Product Innovation within the next 2 hours to get full intelligence on the competitor meeting.',
          'Provide the VP with a pre-drafted internal memo she can send to the CIO\'s office today.',
          'Prepare a competitive displacement risk summary with quantified switching costs for the CCO call.',
        ],
        fde: [
          'Produce a P1 resolution commitment document TODAY — even if the bugs are not yet fixed.',
          'Identify whether any P1 bugs can be hot-patched or mitigation-wrapped within 24 hours.',
        ],
      },
    },
  ],
  monthlyUsageTrend: [
    { month: 'Jan', usage: 78, benchmark: 82 },
    { month: 'Feb', usage: 74, benchmark: 83 },
    { month: 'Mar', usage: 71, benchmark: 84 },
    { month: 'Apr', usage: 68, benchmark: 85 },
    { month: 'May', usage: 65, benchmark: 86 },
    { month: 'Jun', usage: 60, benchmark: 87 },
  ],
  synthesis: {
    pivotPoint: 'Resolving the 5 P1 security bugs is the single move that unlocks the FDE sprint, saves the Champion\'s political capital, satisfies the CIO\'s ROI mandate, and frees the $1.5M EMEA deal — every other action is downstream of this.',
    stakeholderRiskHeatmap:
      'PRIMARY BLOCKER — Head of Infrastructure: Holds veto power over the entire commercial trajectory. Their P1 security bug mandate is the load-bearing constraint. Nothing moves — not the FDE sprint, not APAC, not EMEA — until they issue sign-off. Treat as #1 priority target.\n\n' +
      'SECONDARY RISK — Global CIO (Economic Buyer): Commercially hostile and actively meeting competitors. The 20% cost reduction mandate signals renewal is not guaranteed at current ARR. Needs a structured ROI proof delivered before the renewal window closes — the Americas success narrative is currently the only card we hold.\n\n' +
      'TIME-CRITICAL RISK — VP of Product Innovation (Champion): The most time-sensitive risk in the account. Championed the platform internally and is now being blamed for the APAC stall. Political capital eroding weekly. If the Champion is sidelined before the CIO\'s budget review, we lose our only internal advocate.',
    deploymentSiloAnalysis:
      'TWO-SPEED ACCOUNT — CRITICAL DISTORTION: Americas Retail Banking (100% usage, 3,200 branches, zero incidents) is a textbook enterprise success story. APAC Wealth Management (15% usage, compliance-blocked) is a failure narrative. The danger: the CIO is using APAC as the representative data point for global health while discounting Americas.\n\n' +
      'ROOT CAUSE CLARITY: The APAC stall is not a product rejection — it is a compliance engineering execution problem caused by 5 unresolved P1 bugs. Usage at 15% reflects deployment incompletion, not user dissatisfaction. This distinction must be made explicit to the CIO in writing before the next executive touchpoint.\n\n' +
      'COMMERCIAL GATE: The $1.5M EMEA expansion is fully gated behind APAC resolution. A two-speed deployment creates a two-speed commercial outcome: Americas anchors the renewal, but APAC must be resolved to unlock EMEA and defend full ARR against the 20% haircut mandate.',
    priorityActions: [
      {
        role: 'FDE',
        action: 'Emergency triage all 5 P1 security bugs — assign named senior engineers with daily stand-up accountability, no other FDE work on this account takes priority',
        urgency: 'Critical',
        rationale: 'Every day without P1 resolution extends the FDE sprint delay, weakens the Champion\'s political position, and keeps the CIO in active competitor evaluation mode',
        deadline: 'Start today',
      },
      {
        role: 'CCO',
        action: 'Call the CIO directly — do not let the competitor meeting happen without CCO-level intervention. Lead with Americas ROI proof and a named P1 resolution commitment with dates',
        urgency: 'Critical',
        rationale: 'The CIO is meeting a competitor tomorrow. A CSM-level touchpoint will not carry enough weight. Only CCO personal accountability will arrest the churn motion',
        deadline: 'Today',
      },
      {
        role: 'FDE',
        action: 'Deliver a written P1 Remediation Plan to the Head of Infrastructure within 3 business days — include fix timelines, testing evidence, and compliance certification milestones',
        urgency: 'Critical',
        rationale: 'The Head of Infrastructure will not issue sign-off without a formal, documented remediation plan. Verbal assurances have already failed to unblock this stakeholder',
        deadline: '3 business days',
      },
      {
        role: 'CSM',
        action: 'Deliver the Americas ROI Business Case to the CIO — quantify cost savings, SLA performance, and branch-level efficiency gains to make the 20% cost reduction demand structurally irrational',
        urgency: 'High',
        rationale: 'The CIO\'s 20% cost mandate is the commercial weapon being used to justify the competitor evaluation. A quantified ROI case is the only counter-argument that operates at the same level',
        deadline: '5 business days',
      },
      {
        role: 'CSM',
        action: 'Brief the VP of Product Innovation immediately — provide pre-drafted talking points to help her defend the platform internally and reframe APAC as an engineering execution issue, not a product failure',
        urgency: 'High',
        rationale: 'The Champion is losing ground weekly. Without active air cover from the CSM, she will either exit or go silent — removing the last internal advocate before the budget review',
        deadline: 'Today',
      },
    ],
    playbook: {
      cco: [
        'Call the CIO today — personally — before the competitor meeting occurs. Frame as a strategic partnership call, not a retention call. Open with the Americas success narrative.',
        'Offer a named, time-bound commitment on APAC resolution: "I am personally sponsoring the P1 remediation. You will have sign-off dates by end of this week."',
        'Escalate P1 bug count to Engineering VP with a named 48-hour emergency triage SLA and written accountability. Send Head of Infrastructure a direct communication confirming the escalation.',
        'Publicly credit the VP of Product Innovation in all joint executive communications. Position her as the strategic visionary behind Americas success to restore her political standing before the budget review.',
      ],
      csm: [
        'Within 5 days: Deliver a formal Americas ROI Business Case to the CIO quantifying branch-level cost savings, SLA performance, and operational efficiency gains. Make the 20% cost reduction ask structurally irrational.',
        'Today: Brief the VP of Product Innovation privately. Provide pre-drafted talking points to reframe APAC stall as an engineering execution issue, not a product failure.',
        'Run bi-weekly political health checks with the VP of Product Innovation. Her internal position is the leading indicator of account trajectory.',
        'Pause all EMEA commercial negotiation activity until the APAC narrative is stabilised. Pushing EMEA now signals desperation and risks further deal downgrade.',
      ],
      fde: [
        'EMERGENCY: Assign named senior engineers to all 5 P1 bugs with daily stand-up accountability. No other FDE work on this account until all bugs pass compliance certification.',
        'Within 3 business days: Deliver a written P1 Remediation Plan to the Head of Infrastructure with individual resolution timelines, testing evidence, and compliance certification milestones.',
        'Upon P1 resolution: Fast-track deployment sign-off directly with the Head of Infrastructure and initiate the 4-week FDE sprint within 48 hours of approval. Do not allow scheduling lag to reopen the sign-off window.',
      ],
    },
  },
}

// ── 2. Meridian Health Systems — Expanding ───────────────────────────────────
const meridianHealth: Account = {
  id: 'meridian-health',
  name: 'Meridian Health Systems',
  arr: 3_200_000,
  renewalDaysOut: 280,
  openCriticalBugs: 0,
  marketingEngagement: 'High',
  healthStatus: 'Expanding',
  churnRisk: 8,
  expansionScore: 88,
  npsScore: 71,
  deployments: [
    { division: 'Clinical Operations — US East', usagePct: 98, status: 'Stable', notes: 'Full deployment across 14 hospital systems. Zero incidents in 8 months. Active case study in progress.' },
    { division: 'Revenue Cycle Management', usagePct: 82, status: 'Stable', notes: 'Deployed Q3. ROI validated at 23% reduction in claims processing time. CFO has signed off on expansion scope.' },
    { division: 'Pharmacy Networks — US West', usagePct: 45, status: 'Expanding', notes: 'Phase 2 rollout underway. On track for full deployment by end of Q3. No blockers identified.' },
  ],
  stakeholders: [
    { name: 'Chief Digital Officer', role: 'Economic Buyer', sentiment: 'Positive', notes: 'Personally championing the platform at board level. Preparing a 3-year strategic roadmap built around the platform.', influence: 10, risk: 1 },
    { name: 'VP of Clinical Informatics', role: 'Technical Gatekeeper', sentiment: 'Positive', notes: 'Deep technical advocate. Runs internal enablement sessions for clinical staff. Wants to co-author a joint whitepaper.', influence: 8, risk: 2 },
    { name: 'CFO', role: 'Financial Approver', sentiment: 'Neutral', notes: 'Satisfied with current ROI. Requires formal business case for the $1.8M expansion. Focused on budget cycle in Q4.', influence: 9, risk: 4 },
  ],
  opportunities: [
    { name: 'Pharmacy Network Full Rollout', value: 800_000, stage: 'Stage 3 – Technical Validation' },
    { name: 'Analytics & Reporting Module', value: 1_200_000, stage: 'Stage 2 – Business Case' },
  ],
  fdeStatus: 'FDE sprint active and on schedule. Phase 2 Pharmacy rollout proceeding with dedicated FDE resource. No blockers.',
  csmNotes: 'Model expansion account. CDO is a vocal reference customer. CFO requires Q4 business case for the Analytics module — prioritise ROI documentation by end of Q3.',
  siloGraph: {
    nodes: [
      { id: 'cdo',     label: 'CDO Champion\nBoard-level Buy-in', type: 'outcome',    x: 80,  y: 200 },
      { id: 'roi',     label: 'Validated ROI\n23% Efficiency Gain', type: 'outcome',  x: 240, y: 200 },
      { id: 'phase2',  label: 'Phase 2 Rollout\nOn Track',          type: 'dependency', x: 400, y: 200 },
      { id: 'cfo',     label: 'CFO Business\nCase Required',        type: 'risk',      x: 400, y: 80  },
      { id: 'pharma',  label: 'Pharmacy Full\nDeployment Q3',       type: 'outcome',   x: 560, y: 200 },
      { id: 'analytics', label: '$1.2M Analytics\nModule',         type: 'outcome',   x: 720, y: 140 },
      { id: 'expand',  label: '$2M Total\nExpansion Pipeline',      type: 'outcome',   x: 720, y: 280 },
    ],
    edges: [
      { from: 'cdo',    to: 'roi',      label: 'validates' },
      { from: 'roi',    to: 'phase2',   label: 'accelerates' },
      { from: 'phase2', to: 'pharma',   label: 'delivers' },
      { from: 'cfo',    to: 'analytics', label: 'gates' },
      { from: 'roi',    to: 'cfo',      label: 'builds case for' },
      { from: 'pharma', to: 'expand',   label: 'contributes to' },
      { from: 'analytics', to: 'expand', label: 'contributes to' },
    ],
  },
  timeline: [
    { day: 1, time: '10:00', source: 'Salesforce', icon: '💚', label: 'Opportunity Update', body: 'Analytics & Reporting Module moved from Stage 1 to Stage 2. CDO has formally requested a business case presentation for the Q4 budget cycle.' },
    { day: 2, time: '09:15', source: 'CSM Note', icon: '📋', label: 'CSM Note Inputted', body: '"Spoke to VP of Clinical Informatics. He has volunteered to co-present at our annual conference. Wants to showcase the clinical workflow automation results. Excellent reference opportunity."' },
    { day: 3, time: '15:00', source: 'Jira', icon: '✅', label: 'Milestone Completed', body: 'Phase 2 Pharmacy Network rollout hit 45% deployment milestone on schedule. FDE lead confirmed no technical blockers for full Q3 completion.' },
  ],
  alerts: [],
  monthlyUsageTrend: [
    { month: 'Jan', usage: 71, benchmark: 82 },
    { month: 'Feb', usage: 76, benchmark: 83 },
    { month: 'Mar', usage: 81, benchmark: 84 },
    { month: 'Apr', usage: 85, benchmark: 85 },
    { month: 'May', usage: 89, benchmark: 86 },
    { month: 'Jun', usage: 94, benchmark: 87 },
  ],
  synthesis: {
    pivotPoint: 'Delivering the CFO business case for the Analytics module before Q4 budget lock is the single move that converts $2M of expansion pipeline into booked revenue — every stakeholder and deployment signal is already aligned.',
    stakeholderRiskHeatmap:
      'EXPANSION ENGINE — Chief Digital Officer: The CDO is a rare asset — an economic buyer who is also a vocal public advocate. Their board-level sponsorship is removing objections before they materialise. Protect and amplify this relationship through executive co-marketing and joint roadmap visibility.\n\n' +
      'TECHNICAL ACCELERATOR — VP of Clinical Informatics: An unusually deep technical partner. The offer to co-present at conference is a high-value reference signal — accept and prioritise. His willingness to build internally on the platform is the strongest lock-in signal in the portfolio.\n\n' +
      'CONTROLLED RISK — CFO (Financial Approver): The only friction point in an otherwise clean expansion account. The CFO is not opposed — they are process-following. A well-structured business case delivered before Q4 budget lock will convert this from a gate into a formality. Missing the Q4 deadline is the only scenario that creates real risk.',
    deploymentSiloAnalysis:
      'THREE-SPEED ADVANCE: Clinical Operations (98% usage, zero incidents, 8 months clean) is the proof point. Revenue Cycle Management (82%, ROI validated at 23% efficiency gain) is the expansion justification. Pharmacy Networks (45%, Phase 2 underway) is the active growth front.\n\n' +
      'ZERO BLOCKER ENVIRONMENT: All three deployments are either stable or actively expanding. The absence of any stalled or at-risk division means the entire commercial narrative is positive — a rare condition that should be leveraged immediately for reference activity and case study production.\n\n' +
      'Q4 DEPENDENCY: The $1.2M Analytics module is the critical commercial gate. The CFO requires a formal business case before Q4 budget lock. If the CSM delivers quantified ROI evidence from Revenue Cycle and Clinical Ops within the next 30 days, this deal closes in Q4. If the deadline is missed, the deal moves to Q1 at best.',
    priorityActions: [
      {
        role: 'CSM',
        action: 'Build and deliver the Analytics & Reporting Module business case to the CFO before Q4 budget lock — anchor it to the validated 23% Revenue Cycle ROI and Clinical Ops efficiency data',
        urgency: 'Critical',
        rationale: 'The CFO will not approve the $1.2M expansion without a formal business case. Q4 budget cycle is the window — missing it pushes the deal to Q1 and loses the current momentum',
        deadline: '30 days',
      },
      {
        role: 'CCO',
        action: 'Accept the VP of Clinical Informatics\'s offer to co-present at the annual conference — assign a named marketing resource to develop the joint case study this week',
        urgency: 'High',
        rationale: 'A CDO-level public reference with quantified clinical outcomes is a portfolio-wide asset. This window is time-limited — the offer should be formalised before it becomes a casual mention',
        deadline: 'This week',
      },
      {
        role: 'CSM',
        action: 'Begin parallel stakeholder mapping for the AI Analytics module — identify the technical sponsor and build internal support before the CFO business case lands',
        urgency: 'High',
        rationale: 'A CFO approval without a technical champion already engaged risks a slow procurement process. Warming the internal buying group now accelerates post-approval execution',
        deadline: '2 weeks',
      },
      {
        role: 'FDE',
        action: 'Deliver Phase 3 Pharmacy Network kickoff on schedule and produce a deployment milestone report the CSM can use in the CFO business case',
        urgency: 'Medium',
        rationale: 'Concrete, recent deployment evidence strengthens the CFO\'s confidence in delivery capability. A Phase 3 kickoff report arriving alongside the business case makes the ask more credible',
        deadline: 'Next week',
      },
    ],
    playbook: {
      cco: [
        'Formalise the VP of Clinical Informatics conference co-presentation this week. Assign a dedicated marketing resource. Position the CDO as the headline sponsor — this becomes a flagship reference for all healthcare verticals.',
        'Schedule a strategic roadmap review with the CDO before Q4. Use it to align the 3-year platform vision with the Analytics module scope — converting the CFO approval from a line-item decision into a strategic commitment.',
        'Ensure the CCO personally attends or sends a written executive endorsement to the Q4 CFO business case presentation. CCO visibility signals strategic importance and accelerates CFO sign-off.',
      ],
      csm: [
        'Within 30 days: Deliver the Analytics & Reporting Module business case to the CFO. Lead with quantified Revenue Cycle ROI (23% efficiency), Clinical Ops uptime data, and projected analytics outcomes. Arrive before Q4 budget lock.',
        'This week: Begin internal stakeholder mapping for the Analytics module. Identify the technical champion and economic secondary approver. Brief them before the formal CFO presentation lands.',
        'Formalise the joint conference presentation with VP of Clinical Informatics — draft the abstract, confirm dates, and brief marketing. This is the highest-leverage reference activity in the current portfolio.',
      ],
      fde: [
        'Deliver Phase 3 Pharmacy Network kickoff on schedule. Produce a one-page deployment milestone summary (usage, timelines, zero incidents) for the CSM to include in the CFO business case.',
        'Begin AI Analytics module scoping sprint next month as planned. Prioritise technical architecture documentation that can be shared with the VP of Clinical Informatics during the pre-sales phase.',
        'Maintain zero-incident discipline across all active deployments — the clean track record is a commercial asset and must not be compromised by under-resourced sprint delivery.',
      ],
    },
  },
}

// ── 3. Cascade Retail Group — Churning ───────────────────────────────────────
const cascadeRetail: Account = {
  id: 'cascade-retail',
  name: 'Cascade Retail Group',
  arr: 1_800_000,
  renewalDaysOut: 45,
  openCriticalBugs: 2,
  marketingEngagement: 'Low',
  healthStatus: 'Churning',
  churnRisk: 91,
  expansionScore: 5,
  npsScore: -18,
  deployments: [
    { division: 'E-Commerce Platform', usagePct: 38, status: 'At Risk', notes: 'Usage has declined from 71% to 38% over 6 months following a failed migration to v4.2. IT team is actively evaluating a competitor re-platforming.' },
    { division: 'In-Store Analytics', usagePct: 12, status: 'Stalled', notes: 'Pilot never progressed beyond 3 stores. Store operations team disengaged after the e-commerce migration issues. Contract scope unfulfilled.' },
  ],
  stakeholders: [
    { name: 'CTO', role: 'Economic Buyer', sentiment: 'Negative', notes: 'Has formally requested a contract exit review with legal. Cited the v4.2 migration failure and unfulfilled in-store pilot scope as the primary causes.', influence: 10, risk: 10 },
    { name: 'Head of Digital', role: 'Internal Champion', sentiment: 'Negative', notes: 'Previously an advocate — now publicly blaming the platform for e-commerce revenue underperformance in two board presentations.', influence: 7, risk: 9 },
    { name: 'IT Director', role: 'Technical Gatekeeper', sentiment: 'Blocked', notes: 'Actively managing a competitor PoC. Has requested all integration documentation to facilitate a potential migration. Non-responsive to CSM outreach.', influence: 8, risk: 10 },
  ],
  opportunities: [],
  fdeStatus: 'No active FDE engagement. Last sprint completed 4 months ago. Re-engagement proposal sent — no response from IT Director.',
  csmNotes: 'Highest churn risk in portfolio. CTO has initiated a contract exit review. The only viable path to retention is a direct CCO intervention with a concrete remediation commitment and commercial concession package before the renewal window in 45 days.',
  siloGraph: {
    nodes: [
      { id: 'migration', label: 'v4.2 Migration\nFailure',           type: 'blocker',    x: 80,  y: 200 },
      { id: 'usage',     label: 'Usage Drop\n71% → 38%',            type: 'risk',       x: 240, y: 200 },
      { id: 'pilot',     label: 'In-Store Pilot\nAbandoned',         type: 'risk',       x: 240, y: 320 },
      { id: 'cto',       label: 'CTO Exit\nReview Initiated',       type: 'blocker',    x: 400, y: 200 },
      { id: 'itdir',     label: 'IT Director\nCompetitor PoC',      type: 'blocker',    x: 400, y: 320 },
      { id: 'champ',     label: 'Champion\nNow Hostile',            type: 'risk',       x: 560, y: 260 },
      { id: 'churn',     label: '$1.8M ARR\nChurn Risk',            type: 'outcome',    x: 720, y: 200 },
    ],
    edges: [
      { from: 'migration', to: 'usage',  label: 'caused' },
      { from: 'migration', to: 'pilot',  label: 'derailed' },
      { from: 'usage',     to: 'cto',    label: 'triggered' },
      { from: 'pilot',     to: 'itdir',  label: 'drove' },
      { from: 'cto',       to: 'champ',  label: 'turned' },
      { from: 'itdir',     to: 'churn',  label: 'accelerates' },
      { from: 'champ',     to: 'churn',  label: 'removes barrier to' },
    ],
  },
  timeline: [
    { day: 1, time: '11:00', source: 'CSM Note', icon: '🚨', label: 'CSM Note Inputted', body: '"IT Director has formally requested all API integration documentation. Context from our contact in procurement: they are compiling a migration package for a competitor PoC. 45 days to renewal."' },
    { day: 2, time: '16:30', source: 'Salesforce', icon: '📉', label: 'Salesforce Alert', body: 'Account health score updated to Red. Renewal probability downgraded from 35% to 12%. Escalation flag raised to CCO.' },
    { day: 3, time: '09:00', source: 'Jira', icon: '🔴', label: 'Jira Alert', body: 'CTO has opened a formal support ticket requesting a contract exit clause review. Ticket tagged Priority 1 — Legal. CSM has been copied on the correspondence.' },
  ],
  alerts: [],
  monthlyUsageTrend: [
    { month: 'Jan', usage: 71, benchmark: 82 },
    { month: 'Feb', usage: 65, benchmark: 83 },
    { month: 'Mar', usage: 58, benchmark: 84 },
    { month: 'Apr', usage: 50, benchmark: 85 },
    { month: 'May', usage: 43, benchmark: 86 },
    { month: 'Jun', usage: 38, benchmark: 87 },
  ],
  synthesis: {
    pivotPoint: 'The only viable path to retention is a CCO-level intervention in the next 72 hours with a concrete remediation commitment and commercial concession package — without it, the CTO\'s exit review will complete before any recovery play can land.',
    stakeholderRiskHeatmap:
      'ACTIVE CHURN DRIVER — CTO (Economic Buyer): Has formally initiated a contract exit review with legal. This is not posturing — it is a structured procurement process. The CTO is not waiting for a retention call; they are actively building the exit case. Only a CCO-level intervention with a concrete remediation package has any chance of interrupting this motion.\n\n' +
      'HOSTILE CHAMPION — Head of Digital: The most dangerous stakeholder configuration in the portfolio. A former advocate who is now actively blaming the platform in board presentations. This person is providing the CTO with internal justification for exit. Neutralising their narrative is as important as the executive intervention.\n\n' +
      'ACTIVE DEFECTOR — IT Director (Technical Gatekeeper): Has requested all integration documentation — this is migration preparation, not due diligence. The IT Director is non-responsive to CSM outreach, is running a competitor PoC, and has effectively already made a decision. Any technical re-engagement must come via the CTO channel, not the IT Director.',
    deploymentSiloAnalysis:
      'REVERSE SILO — FAILURE CONTAMINATION: The e-commerce deployment (38% usage, down from 71%) is the dominant narrative, and it is a failure narrative. The In-Store Analytics pilot (12%, 3 stores, abandoned) amplifies it. There are no healthy deployment divisions to anchor a counter-narrative — unlike Global Bank Corp, this account has no Americas equivalent.\n\n' +
      'ROOT CAUSE: The v4.2 migration failure is the origin event. IT Director and Head of Digital have both attributed commercial underperformance to the platform. Whether or not this attribution is accurate, it is the operative reality in every internal stakeholder conversation.\n\n' +
      'LAST WINDOW: 45 days to renewal. The IT Director is running a competitor PoC. The CTO has initiated exit review. The mathematical probability of retention without an extraordinary intervention in the next 72 hours is below 20%.',
    priorityActions: [
      {
        role: 'CCO',
        action: 'Request an emergency call with the CTO within 24 hours — bring a signed remediation commitment letter with named owners, fixed dates, and a commercial concession offer (extended term, credits, or SLA guarantees)',
        urgency: 'Critical',
        rationale: 'The CTO has initiated a formal contract exit review. There is a 45-day window. A CSM touchpoint will not arrest this motion. Only CCO personal accountability at the economic buyer level has a realistic chance of creating space for a retention conversation',
        deadline: '24 hours',
      },
      {
        role: 'CSM',
        action: 'Get full intelligence from any remaining internal contact on the competitor PoC — identify the competitor, the evaluation scope, and which internal stakeholders are driving it',
        urgency: 'Critical',
        rationale: 'Entering the CCO retention conversation without knowing the competitive threat and the internal decision-makers is a tactical error. Every piece of intelligence shapes the commercial offer',
        deadline: 'Before CCO call',
      },
      {
        role: 'CCO',
        action: 'Prepare a quantified switching cost analysis — migration complexity, integration rebuild cost, operational downtime risk — and bring it to the CTO call as a structured risk document',
        urgency: 'High',
        rationale: 'The competitor PoC looks attractive because the IT Director has framed migration as straightforward. A detailed switching cost analysis reframes the decision — especially given the e-commerce integration depth',
        deadline: '48 hours',
      },
      {
        role: 'FDE',
        action: 'Produce a v4.2 migration post-mortem with a concrete remediation plan and timeline — give the CCO a credible technical commitment to bring to the CTO',
        urgency: 'High',
        rationale: 'The CTO\'s exit case is built on the v4.2 failure. A documented post-mortem with named fixes and delivery dates converts a vague failure into a bounded, solvable problem',
        deadline: '48 hours',
      },
    ],
    playbook: {
      cco: [
        'WITHIN 24 HOURS: Request an emergency call with the CTO. Do not reference the exit review directly. Frame as "I want to personally understand what we need to fix." Arrive with a signed remediation commitment letter and a commercial concession package.',
        'Commercial offer structure: extended contract term at current pricing (removes the 20% cut risk), service credits for the v4.2 disruption, and a named SLA guarantee on the e-commerce deployment recovery.',
        'Prepare a switching cost analysis before the call. Quantify: migration complexity, integration rebuild effort, operational downtime during transition, and the risk of a second failed migration with a new vendor.',
        'Do not engage the Head of Digital directly — they are now a hostile actor. Route all stakeholder communications through the CTO until the retention motion is resolved.',
      ],
      csm: [
        'Before the CCO call: contact every remaining friendly internal contact to map the competitor PoC. Identify the vendor, the evaluation scope, the internal sponsor, and the decision timeline.',
        'Prepare a competitive displacement risk brief for the CCO — quantified switching costs, migration complexity, and a summary of what the Head of Digital has communicated publicly in board presentations.',
        'If retention succeeds: immediately schedule a structured account recovery plan kickoff with the CTO, IT Director, and Head of Digital in the room. The retention commitment means nothing without an execution framework they have signed off on.',
      ],
      fde: [
        'Within 48 hours: Produce a v4.2 migration post-mortem document. Structure it as: what failed, why it failed, what has already been fixed, and what the remaining remediation plan and timeline is. The CCO needs this for the CTO call.',
        'Identify whether any quick-win technical improvements to the e-commerce deployment can be delivered within 30 days. A visible early win strengthens the retention argument before the renewal date.',
        'Do not initiate any new FDE work on this account until the retention outcome is confirmed. Resource allocation to a churning account must be authorised at CCO level given the commercial risk.',
      ],
    },
  },
}

// ── 4. Apex Capital Partners — Healthy ───────────────────────────────────────
const apexCapital: Account = {
  id: 'apex-capital',
  name: 'Apex Capital Partners',
  arr: 6_100_000,
  renewalDaysOut: 340,
  openCriticalBugs: 0,
  marketingEngagement: 'High',
  healthStatus: 'Healthy',
  churnRisk: 5,
  expansionScore: 62,
  npsScore: 58,
  deployments: [
    { division: 'Investment Management Platform', usagePct: 97, status: 'Stable', notes: 'Flagship deployment. 99.98% uptime over 18 months. Platform is embedded in core trading workflows. Zero migration risk.' },
    { division: 'Risk & Compliance Reporting', usagePct: 91, status: 'Stable', notes: 'Full deployment completed Q1. Regulatory audit passed with zero findings. CCO has cited this as best-in-class implementation.' },
    { division: 'Client Reporting Portal — APAC', usagePct: 68, status: 'Expanding', notes: 'Phase 2 expansion underway following strong EMEA adoption. On track for 90% deployment by Q4.' },
  ],
  stakeholders: [
    { name: 'Managing Director, Technology', role: 'Economic Buyer', sentiment: 'Positive', notes: 'Long-tenured relationship. Has cited the platform in two industry panels. Actively advocates for expansion internally ahead of budget cycle.', influence: 10, risk: 1 },
    { name: 'Head of Quantitative Research', role: 'Power User', sentiment: 'Positive', notes: 'Deepest technical user in the organisation. Has built proprietary workflows on top of the platform API. Switching cost is extremely high.', influence: 7, risk: 1 },
    { name: 'Chief Risk Officer', role: 'Compliance Gatekeeper', sentiment: 'Neutral', notes: 'Satisfied with compliance reporting performance. Requires evidence of SOC 2 Type II renewal before approving any new module expansion.', influence: 9, risk: 3 },
  ],
  opportunities: [
    { name: 'APAC Client Portal Full Rollout', value: 600_000, stage: 'Stage 3 – Technical Validation' },
    { name: 'AI-Powered Risk Analytics Module', value: 1_400_000, stage: 'Stage 2 – Business Case' },
  ],
  fdeStatus: 'Two concurrent FDE sprints active. APAC portal expansion on track. AI Risk Analytics module scoping sprint begins next month.',
  csmNotes: 'Anchor account and flagship reference customer. CRO requires SOC 2 Type II renewal confirmation before the AI module progresses. Priority action: confirm compliance documentation timeline with security team and deliver to CRO within 30 days.',
  siloGraph: {
    nodes: [
      { id: 'embed',  label: 'Platform\nCore-Embedded',            type: 'outcome',    x: 80,  y: 200 },
      { id: 'md',     label: 'MD Champion\nIndustry Advocacy',     type: 'outcome',    x: 240, y: 120 },
      { id: 'quant',  label: 'Quant Team\nProprietary Workflows',  type: 'outcome',    x: 240, y: 280 },
      { id: 'apac',   label: 'APAC Expansion\nOn Track',           type: 'dependency', x: 400, y: 200 },
      { id: 'soc2',   label: 'SOC 2 Type II\nRequired by CRO',     type: 'risk',       x: 400, y: 80  },
      { id: 'ai',     label: '$1.4M AI Risk\nModule Gated',        type: 'outcome',    x: 560, y: 140 },
      { id: 'total',  label: '$2M Expansion\nPipeline',            type: 'outcome',    x: 720, y: 200 },
    ],
    edges: [
      { from: 'embed', to: 'md',    label: 'enables' },
      { from: 'embed', to: 'quant', label: 'enables' },
      { from: 'md',    to: 'apac',  label: 'sponsors' },
      { from: 'soc2',  to: 'ai',    label: 'gates' },
      { from: 'apac',  to: 'total', label: 'contributes' },
      { from: 'ai',    to: 'total', label: 'contributes' },
    ],
  },
  timeline: [
    { day: 1, time: '14:00', source: 'CSM Note', icon: '⭐', label: 'CSM Note Inputted', body: '"MD of Technology mentioned us by name in a Bloomberg interview as a competitive advantage. Marketing team flagged — strong PR opportunity. Requesting formal case study approval."' },
    { day: 2, time: '11:30', source: 'Salesforce', icon: '💼', label: 'Opportunity Update', body: 'AI-Powered Risk Analytics Module progressed to Stage 2. Head of Quant Research has submitted an internal business case. Pending CRO sign-off on SOC 2 Type II renewal.' },
    { day: 3, time: '10:00', source: 'Jira', icon: '✅', label: 'Sprint Complete', body: 'APAC Client Portal Phase 2 deployment sprint completed successfully. 68% deployment reached. FDE lead has scheduled Phase 3 kickoff for next week.' },
  ],
  alerts: [],
  monthlyUsageTrend: [
    { month: 'Jan', usage: 88, benchmark: 82 },
    { month: 'Feb', usage: 90, benchmark: 83 },
    { month: 'Mar', usage: 91, benchmark: 84 },
    { month: 'Apr', usage: 93, benchmark: 85 },
    { month: 'May', usage: 94, benchmark: 86 },
    { month: 'Jun', usage: 96, benchmark: 87 },
  ],
  synthesis: {
    pivotPoint: 'Delivering SOC 2 Type II renewal documentation to the CRO within 30 days is the gate that unlocks the $1.4M AI Risk Analytics module — the highest-value expansion opportunity in the portfolio.',
    stakeholderRiskHeatmap:
      'STRATEGIC ANCHOR — Managing Director of Technology: A rare combination of economic buyer, internal champion, and public reference. Two industry panel mentions and a Bloomberg interview citation represent extraordinary advocacy. This relationship must be treated as a portfolio-level asset — not just an account-level one — and receive executive sponsorship proportionate to that value.\n\n' +
      'IRREPLACEABLE LOCK-IN — Head of Quantitative Research: Has built proprietary workflows on the platform API. The switching cost for this stakeholder is effectively prohibitive. This is the strongest technical lock-in signal in the portfolio and should be documented for internal risk tracking.\n\n' +
      'PROCESS GATE — Chief Risk Officer (Compliance Gatekeeper): Not a risk in the traditional sense — the CRO is process-compliant, not obstructive. SOC 2 Type II renewal confirmation is a routine ask that has been allowed to become an expansion blocker. This is an internal execution failure, not a stakeholder problem. Resolve it in 30 days.',
    deploymentSiloAnalysis:
      'ABOVE-BENCHMARK PERFORMANCE: All three deployment divisions are operating at or above the platform benchmark. Investment Management (97%), Risk & Compliance (91%), APAC Portal (68%, expanding). This is the only account in the portfolio with no stalled or at-risk division.\n\n' +
      'APAC EXPANSION VECTOR: The APAC Client Portal (68%, Phase 2 active) represents both a live commercial deliverable and a proof point for the AI Risk Analytics module pitch. Completing APAC on schedule strengthens the CRO\'s confidence in delivery capability at the moment the AI module business case lands.\n\n' +
      'SOC 2 AS THE ONLY GATE: The AI Risk Analytics module ($1.4M) is entirely gated on a single administrative action — SOC 2 Type II renewal documentation. There is no technical, commercial, or stakeholder opposition. This is a pure internal execution dependency that should have been resolved proactively.',
    priorityActions: [
      {
        role: 'CSM',
        action: 'Escalate SOC 2 Type II renewal documentation to the internal security team today — confirm delivery timeline to the CRO within 30 days to ungate the $1.4M AI Risk Analytics module',
        urgency: 'Critical',
        rationale: 'The only blocker on a $1.4M expansion is an internal compliance document. Every day this sits unresolved is a day of unnecessary commercial delay in an account with zero opposing signals',
        deadline: '30 days',
      },
      {
        role: 'CCO',
        action: 'Formalise the MD of Technology reference programme — approve the Bloomberg quote for case study use, schedule a joint analyst briefing, and assign a dedicated marketing resource',
        urgency: 'High',
        rationale: 'An MD-level public reference with quantified financial services outcomes is a $500K+ marketing asset. It is currently being underutilised as an informal mention rather than a structured programme',
        deadline: 'This week',
      },
      {
        role: 'CSM',
        action: 'Begin technical pre-sales for the AI Risk Analytics module with the Head of Quantitative Research before the CRO business case is formally presented',
        urgency: 'High',
        rationale: 'The Quant team is the likely internal champion for this module. Warming the technical evaluation before the CFO-level approval lands accelerates implementation timeline and reduces post-approval delay',
        deadline: '2 weeks',
      },
      {
        role: 'FDE',
        action: 'Complete APAC Phase 2 on schedule and produce a delivery report the CSM can include in the AI module business case',
        urgency: 'Medium',
        rationale: 'The CRO will review recent delivery performance when evaluating the AI module expansion. A clean APAC milestone report arriving alongside the SOC 2 documentation creates a positive dual signal',
        deadline: 'Per sprint plan',
      },
    ],
    playbook: {
      cco: [
        'This week: Formally accept the MD\'s Bloomberg reference and assign a dedicated marketing resource to develop it into a financial services case study. Schedule a joint analyst briefing for Q3.',
        'Initiate a strategic executive briefing with the MD of Technology on the AI Risk Analytics module roadmap — position it as a competitive advantage, not a product sale. The MD\'s advocacy should be enrolled before the formal CRO business case lands.',
        'Confirm that SOC 2 Type II renewal is being tracked at VP level internally — this must not be allowed to slip past the 30-day window due to internal administrative delay.',
      ],
      csm: [
        'TODAY: Escalate SOC 2 Type II renewal to internal security team. Get a firm delivery date within 30 days. Communicate the date to the CRO as a proactive update — do not wait for them to chase.',
        'Within 2 weeks: Begin technical pre-sales with the Head of Quant Research for the AI Risk Analytics module. Share the product roadmap, understand their specific workflow requirements, and identify any technical prerequisites.',
        'Confirm APAC Phase 2 completion timeline with FDE and prepare a deployment milestone report for the CRO business case presentation.',
      ],
      fde: [
        'Deliver APAC Phase 2 on schedule. Produce a one-page delivery report (deployment %, uptime, zero incidents) for CSM to use in the AI module business case and CRO compliance review.',
        'Begin AI Risk Analytics module scoping sprint as planned. Prioritise documentation of integration architecture — the Head of Quant Research will want to review technical specs before internal sign-off.',
        'Maintain 99.98%+ uptime discipline across Investment Management and Risk & Compliance deployments. These are the reference benchmarks the CRO will use when evaluating the AI module expansion.',
      ],
    },
  },
}

export const ACCOUNTS: Account[] = [globalBankCorp, meridianHealth, cascadeRetail, apexCapital]
