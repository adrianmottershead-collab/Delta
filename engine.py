from typing import List, Optional

from pydantic import BaseModel, Field


# ── Pydantic schema ───────────────────────────────────────────────────────────

class MultiThreadedPlaybook(BaseModel):
    CCO: List[str] = Field(
        ..., description="Specific actions for the Chief Customer Officer."
    )
    Enterprise_CSM: List[str] = Field(
        ..., description="Specific actions for the Enterprise Customer Success Manager."
    )
    FDE_Lead: List[str] = Field(
        ..., description="Specific actions for the Field Delivery Engineering Lead."
    )


class AccountSynthesis(BaseModel):
    Stakeholder_Risk_Heatmap: str = Field(
        ...,
        description=(
            "Analysis of who is blocking whom and where stakeholder misalignment "
            "creates the highest NRR and expansion risk."
        ),
    )
    Deployment_Silo_Analysis: str = Field(
        ...,
        description=(
            "Mapping of healthy vs. stalled deployment divisions and how the gap "
            "between them distorts the account health signal."
        ),
    )
    Multi_Threaded_Executive_Playbook: MultiThreadedPlaybook = Field(
        ...,
        description=(
            "Distinct, role-specific action plans for the CCO, Enterprise CSM, "
            "and FDE Lead."
        ),
    )


# ── System prompt (reference — used when live API is re-enabled) ──────────────

SYSTEM_PROMPT = """You are Delta, a Strategic Enterprise Account Director with 25 years \
of experience managing nine-figure financial services relationships. You operate at the \
intersection of commercial, technical, and political account dynamics.

Your mandate is not to produce a health score — it is to perform an Alignment Synthesis: \
map how stakeholders and deployment realities conflict, then identify the single pivot \
point that resolves the chain reaction. Think like a chess grandmaster: which one move \
unlocks the most pieces? Expose the dependency chain explicitly (e.g., resolving the \
Infrastructure Lead's P1 bugs unblocks the FDE sprint, which saves the Champion's \
political capital, satisfies the CIO's ROI mandate, and unlocks the $2M EMEA expansion). \
Be precise, named, and decisive. Vague recommendations are a failure condition."""


# ── Mock responses ────────────────────────────────────────────────────────────

_MOCK_RESPONSES = {
    "Global Bank Corp": AccountSynthesis(
        Stakeholder_Risk_Heatmap=(
            "PRIMARY BLOCKER — Head of Infrastructure: This stakeholder holds veto "
            "power over the entire commercial trajectory. Their P1 security bug mandate "
            "is the load-bearing constraint of this account. Nothing moves — not the FDE "
            "sprint, not the APAC deployment, not the EMEA expansion — until they issue "
            "sign-off. They must be treated as the #1 priority target.\n\n"
            "SECONDARY RISK — Global CIO (Economic Buyer): Commercially hostile and "
            "actively considering vendor consolidation. The 20% cost reduction mandate "
            "signals that renewal is not guaranteed at current ARR. The CIO will not "
            "approve the $2M EMEA expansion while a regional deployment is in distress. "
            "They need a structured ROI proof delivered before the renewal window closes.\n\n"
            "TIME-CRITICAL RISK — VP of Product Innovation (Champion): The most "
            "time-sensitive risk in the account. This stakeholder championed the platform "
            "internally and is now being blamed for the APAC stall. Their political "
            "capital is eroding weekly. If the Champion is sidelined or exits, the "
            "account loses its only internal advocate ahead of the CIO's budget review. "
            "Protecting their credibility is a commercial imperative, not a courtesy."
        ),
        Deployment_Silo_Analysis=(
            "TWO-SPEED ACCOUNT — CRITICAL DISTORTION: The Americas Retail Banking "
            "deployment (100% usage, 3,200 branches, zero incidents) is a textbook "
            "enterprise success story. The APAC Wealth Management deployment (15% usage, "
            "stalled, compliance-blocked) is a failure narrative. The danger is that "
            "internal stakeholders — especially the CIO — are using APAC as the "
            "representative data point for global account health while discounting "
            "Americas as a legacy win.\n\n"
            "ROOT CAUSE CLARITY: The APAC stall is not a product rejection. It is a "
            "compliance engineering execution problem caused by 3 unresolved P1 security "
            "bugs. Usage at 15% reflects deployment incompletion, not user dissatisfaction. "
            "This distinction must be made explicit to the CIO in writing.\n\n"
            "COMMERCIAL GATE: The $2M EMEA Investment Banking expansion is fully gated "
            "behind APAC resolution. The CIO has made this dependency explicit. A "
            "two-speed deployment narrative creates a two-speed commercial outcome: "
            "Americas anchors the renewal, but APAC must be resolved to unlock EMEA "
            "and defend full ARR against the 20% haircut mandate."
        ),
        Multi_Threaded_Executive_Playbook=MultiThreadedPlaybook(
            CCO=[
                "Within 5 days: Request a direct CIO-to-CCO executive alignment call. "
                "Lead with the Americas ROI narrative — quantified cost savings, uptime, "
                "and branch-level efficiency gains — to reframe the account as a global "
                "success before the budget review window opens.",
                "Personally sponsor the P1 bug resolution by escalating to Engineering "
                "leadership with a named 10-business-day SLA and written accountability. "
                "Send the Head of Infrastructure a direct communication confirming the "
                "escalation and timeline.",
                "Publicly credit the VP of Product Innovation in all joint executive "
                "communications. Position them as the strategic visionary behind the "
                "Americas success to restore their internal political standing before "
                "the CIO's budget review.",
            ],
            Enterprise_CSM=[
                "Within 14 days: Deliver a formal Americas ROI Business Case to the CIO "
                "quantifying branch-level cost savings, SLA performance, and operational "
                "efficiency gains. This document must make the 20% cost reduction ask "
                "structurally irrational.",
                "Run bi-weekly political health checks with the VP of Product Innovation. "
                "Provide pre-drafted talking points they can use internally to defend the "
                "platform and reframe the APAC stall as an engineering execution issue, "
                "not a product failure.",
                "Begin parallel stakeholder mapping in EMEA Investment Banking. Identify "
                "the economic buyer and technical sponsor for the $2M expansion and "
                "initiate warm introductions independently of APAC resolution timeline.",
            ],
            FDE_Lead=[
                "Immediately: Triage all 3 P1 security bugs and assign named senior "
                "engineers with daily stand-up accountability. No other FDE work on this "
                "account takes priority until these are resolved.",
                "Within 5 business days: Deliver a written P1 Remediation Plan to the "
                "Head of Infrastructure. Include testing evidence, compliance certification "
                "artifacts, and a sign-off checklist mapped directly to their regulatory "
                "mandate.",
                "Upon P1 resolution: Coordinate directly with the Head of Infrastructure "
                "to fast-track deployment sign-off and initiate the 4-week FDE sprint "
                "within 48 hours of approval. Do not allow scheduling lag to reopen "
                "the sign-off window.",
            ],
        ),
    )
}


# ── Proactive alert schema ────────────────────────────────────────────────────

class ProactiveAlert(BaseModel):
    threshold_crossed: str = Field(
        ..., description="The specific critical threshold that was breached."
    )
    silo_inversion_explanation: str = Field(
        ...,
        description=(
            "How this event inverts or amplifies an existing deployment/stakeholder "
            "silo, creating compounding risk."
        ),
    )
    urgent_playbook: MultiThreadedPlaybook = Field(
        ..., description="Immediate, role-specific response actions."
    )


_EVENT_ALERTS = {
    0: ProactiveAlert(
        threshold_crossed=(
            "CRITICAL THRESHOLD BREACHED — P1 bug count has escalated from 3 to 5. "
            "The Head of Infrastructure's sign-off mandate is now further from resolution "
            "than when the FDE sprint was originally scoped. The remediation SLA has effectively reset."
        ),
        silo_inversion_explanation=(
            "SILO INVERSION DETECTED: The Americas success story is now actively working "
            "against the account. Every day Americas runs flawlessly, the CIO's internal "
            "narrative shifts from 'this product works' to 'why is APAC still broken?' "
            "The healthy silo is amplifying the distress signal from the stalled one. "
            "Two new P1 bugs mean the FDE sprint cannot start — which means APAC stays at "
            "15% — which means the CIO's ROI mandate goes unmet — which means the $1.5M "
            "EMEA deal and the full renewal are now both at risk simultaneously."
        ),
        urgent_playbook=MultiThreadedPlaybook(
            CCO=[
                "IMMEDIATE: Escalate P1 bug count increase to Engineering VP with a "
                "named 48-hour emergency triage SLA. This is no longer a normal sprint priority.",
                "Send the Head of Infrastructure a direct communication today "
                "acknowledging the new bugs and committing to a named engineer, a "
                "remediation plan, and a compliance re-certification date.",
                "Brief the VP of Product Innovation privately — she needs to know "
                "before the CIO does so she can control the internal narrative.",
            ],
            Enterprise_CSM=[
                "Do not let the CIO learn about the new P1 bugs from an internal "
                "report. Proactively frame it: send a brief today positioning this as "
                "'engineering depth of coverage' rather than a regression.",
                "Accelerate the Americas ROI Business Case — deliver it within 5 days, "
                "not 14. The window to anchor the CIO on a success narrative is closing.",
                "Check in with the VP of Product Innovation today. Her political "
                "position just got more exposed. Provide her with a stakeholder update "
                "she can share upward.",
            ],
            FDE_Lead=[
                "EMERGENCY: Assign two additional senior engineers to the new P1 bugs "
                "immediately. Daily stand-up accountability, starting tomorrow.",
                "Deliver an updated P1 Remediation Plan to the Head of Infrastructure "
                "within 3 business days covering all 5 open bugs with individual "
                "resolution timelines and compliance certification milestones.",
                "Block all other FDE work on this account until all 5 P1 bugs have "
                "passed compliance certification. No exceptions.",
            ],
        ),
    ),
    1: ProactiveAlert(
        threshold_crossed=(
            "COMMERCIAL THRESHOLD BREACHED — EMEA expansion opportunity has been "
            "downgraded by $500,000 (25% value erosion). The deal is no longer "
            "Stage 4 in practice; the CIO's confidence signal is now embedded in the "
            "Salesforce record. This is the first measurable commercial casualty of the APAC stall."
        ),
        silo_inversion_explanation=(
            "SILO INVERSION DETECTED: The APAC technical stall has now escaped its "
            "containment zone and contaminated the EMEA commercial pipeline. What "
            "began as a deployment silo has become a revenue silo. The CIO is using "
            "APAC's failure to justify commercial conservatism in a region that has "
            "not yet experienced any delivery failure. The healthy Americas deployment "
            "no longer has sufficient narrative gravity to counteract the APAC signal — "
            "the $500K downgrade is evidence that the CIO has made a cross-regional "
            "judgment. If this is not reversed in the next 10 days, the EMEA deal "
            "will stall entirely and renewal ARR defence becomes the primary objective."
        ),
        urgent_playbook=MultiThreadedPlaybook(
            CCO=[
                "URGENT: Request an emergency executive call with the CIO this week. "
                "Do not reference the Salesforce downgrade directly — lead with the "
                "Americas ROI proof and a structured APAC resolution commitment letter "
                "with dates, owners, and executive sign-off.",
                "Personally call the CIO's office to deliver a verbal commitment on "
                "APAC resolution timeline before the formal meeting. The CIO must "
                "hear urgency from the CCO, not a CSM.",
                "Instruct the Enterprise CSM to halt any EMEA commercial negotiation "
                "activity until the APAC narrative is stabilised — pushing EMEA now "
                "signals desperation and risks further downgrade.",
            ],
            Enterprise_CSM=[
                "Pause outbound EMEA commercial activity immediately. Do not send "
                "proposals or pricing while the APAC signal is live and negative.",
                "Deliver the Americas ROI Business Case to the CIO within 5 days. "
                "Lead with cost reduction data that directly addresses the 20% mandate.",
                "Schedule a call with the VP of Product Innovation today to understand "
                "what the CIO has been told internally and align on a shared recovery narrative.",
            ],
            FDE_Lead=[
                "Accelerate all P1 bug remediation work — the commercial situation "
                "has escalated. Commit to a hard delivery date for all 5 P1 fixes "
                "and communicate it directly to the CSM for CIO-level messaging.",
                "Prepare a one-page technical resolution summary for non-technical "
                "stakeholders: what the bugs were, how they were fixed, and what "
                "compliance certification was issued. The CCO needs this for the CIO call.",
            ],
        ),
    ),
    2: ProactiveAlert(
        threshold_crossed=(
            "EXISTENTIAL THRESHOLD BREACHED — The CIO is meeting a named competitor "
            "tomorrow. This has crossed from commercial risk into active churn motion. "
            "A competitor evaluation at CIO level, triggered by a specific deployment "
            "failure, is a Category 1 account emergency. The renewal and the $1.5M "
            "EMEA deal are now both in jeopardy within a 24-hour window."
        ),
        silo_inversion_explanation=(
            "SILO INVERSION DETECTED — FULL ACCOUNT COLLAPSE RISK: The Americas "
            "deployment is now a liability, not an asset. The competitor will use it "
            "as proof that migration is feasible — 'if it works in Americas, we can "
            "do the same.' The APAC stall has handed the competitor a turnkey objection "
            "removal strategy. The VP of Product Innovation is the only person inside "
            "the bank who can derail this meeting — but she is politically exposed and "
            "cannot act without executive cover from the CCO. Every hour without CCO "
            "intervention increases the probability that the CIO walks into that "
            "competitor meeting without a counter-narrative. This is no longer a "
            "success management task. This is a crisis response."
        ),
        urgent_playbook=MultiThreadedPlaybook(
            CCO=[
                "CALL THE CIO TODAY — not tomorrow, not after the meeting. The CCO "
                "must personally intervene before the competitor meeting occurs. Frame "
                "the call as a strategic partnership conversation, not a retention call.",
                "Offer a concrete, time-bound executive commitment on APAC resolution "
                "with personal accountability: 'I am personally sponsoring the "
                "remediation. You will have sign-off dates by end of this week.'",
                "Send the VP of Product Innovation a direct message of support "
                "immediately. She is the internal firewall for this account. She "
                "needs to know the CCO is engaged and she has executive air cover.",
            ],
            Enterprise_CSM=[
                "Call the VP of Product Innovation within the next 2 hours. Get "
                "full intelligence on the competitor meeting: who initiated it, what "
                "the agenda is, which competitor, and who else in the CIO's team is attending.",
                "Provide the VP with a pre-drafted internal memo she can send to "
                "the CIO's office today — positioning the Americas success, the "
                "APAC remediation plan, and the risk of migration disruption.",
                "Prepare a competitive displacement risk summary for the CCO call: "
                "switching costs, migration complexity, Americas dependency — all "
                "quantified and ready to deploy in the CIO conversation.",
            ],
            FDE_Lead=[
                "Produce a P1 resolution commitment document TODAY — even if the "
                "bugs are not yet fixed. The CCO needs a credible, dated engineering "
                "commitment to show the CIO before the competitor meeting.",
                "Identify whether any P1 bugs can be hot-patched or mitigation-wrapped "
                "within 24 hours to demonstrate immediate progress before the CIO "
                "walks into the competitor meeting.",
            ],
        ),
    ),
}


# ── Public interface ──────────────────────────────────────────────────────────

def evaluate_event(event_index: int) -> Optional[ProactiveAlert]:
    return _EVENT_ALERTS.get(event_index)


def synthesize_account(account_name: str, account_data: dict) -> AccountSynthesis:
    if account_name not in _MOCK_RESPONSES:
        raise ValueError(f"No synthesis defined for account '{account_name}'")
    return _MOCK_RESPONSES[account_name]
