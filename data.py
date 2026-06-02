TIMELINE_EVENTS = [
    {
        "day": 1,
        "time": "09:00",
        "source": "Jira",
        "icon": "🔴",
        "label": "Jira Alert",
        "body": (
            "Head of Infrastructure has logged 2 new Critical P1 Security Bugs on the "
            "APAC deployment branch. Open P1 count now stands at 5. FDE sprint remains "
            "on hold pending full remediation and compliance sign-off."
        ),
        "account": "Global Bank Corp",
        "mutations": {"open_critical_bugs": 5},
    },
    {
        "day": 2,
        "time": "14:00",
        "source": "Salesforce",
        "icon": "📉",
        "label": "Salesforce Alert",
        "body": (
            "EMEA Investment Banking expansion opportunity value downgraded from $2,000,000 "
            "to $1,500,000. Stage held at Stage 4 – Commercial Negotiation. Reason noted: "
            "technical approval delay on APAC deployment branch has eroded CIO confidence "
            "in projected delivery timeline."
        ),
        "account": "Global Bank Corp",
        "mutations": {"sales_opportunities[0].value": 1_500_000},
    },
    {
        "day": 3,
        "time": "11:30",
        "source": "CSM Note",
        "icon": "⚠️",
        "label": "CSM Note Inputted",
        "body": (
            '"Spoke to VP of Innovation. She warns that the CIO is meeting with a '
            'competitor tomorrow because of the APAC stall. She believes the CIO is '
            "using the competitor meeting as leverage for the budget review. This is "
            'no longer a technical problem — it is a commercial emergency."'
        ),
        "account": "Global Bank Corp",
        "mutations": {},
    },
]

ACCOUNTS = {
    "Global Bank Corp": {
        "arr": 4_500_000,
        "renewal_days_out": 120,
        "open_critical_bugs": 3,
        "marketing_engagement": "Low",

        "deployment_topology": {
            "Retail Banking — Americas": {
                "usage_pct": 100,
                "status": "Stable",
                "notes": (
                    "Fully deployed across 3,200 retail branches. High adoption, "
                    "stable workloads, zero open incidents. Reference-ready for "
                    "case studies and analyst briefings."
                ),
            },
            "Wealth Management — APAC": {
                "usage_pct": 15,
                "status": "Stalled",
                "notes": (
                    "Blocked by a custom compliance API incompatibility. Three open "
                    "P1 security bugs are preventing the Head of Infrastructure from "
                    "issuing deployment sign-off. FDE sprint on hold."
                ),
            },
        },

        "stakeholder_matrix": [
            {
                "name": "Global CIO",
                "role": "Economic Buyer",
                "sentiment": "Negative",
                "notes": (
                    "Demanding a 20% cost reduction across all technology vendors "
                    "ahead of annual budget review. Will not approve the $2M EMEA "
                    "expansion until global ROI proof is delivered. Commercially "
                    "hostile if APAC stall is not resolved before the renewal window."
                ),
            },
            {
                "name": "Head of Infrastructure",
                "role": "Technical Gatekeeper",
                "sentiment": "Blocked",
                "notes": (
                    "Holding veto on APAC deployment sign-off and FDE sprint "
                    "initiation until all 3 P1 security bugs are fully remediated "
                    "with written compliance certification. Non-negotiable mandate "
                    "from the bank's regulatory team."
                ),
            },
            {
                "name": "VP of Product Innovation",
                "role": "Internal Champion",
                "sentiment": "Positive",
                "notes": (
                    "Strong product advocate who personally championed the platform "
                    "internally. Actively losing political capital as APAC stall "
                    "drags on — being blamed internally for the deployment failure. "
                    "Needs a visible, public win urgently."
                ),
            },
        ],

        "fde_services_planned": (
            "4-week joint FDE sprint fully scoped and resourced. Currently paused "
            "pending Head of Infrastructure sign-off on 3 open P1 security bugs. "
            "Sprint would address the compliance API blocker and complete the APAC rollout."
        ),

        "sales_opportunities": [
            {
                "name": "EMEA Investment Banking Expansion",
                "value": 2_000_000,
                "stage": "Stage 4 – Commercial Negotiation",
            }
        ],

        "csm_notes": (
            "Account is at a critical inflection point. The Americas deployment is a "
            "showcase success being held hostage by the APAC failure. The CIO is using "
            "vendor budget reviews as leverage. The Champion (VP Product Innovation) is "
            "politically exposed and losing ground weekly. The $2M EMEA expansion is "
            "gated behind CIO approval, which requires APAC to be unblocked first. "
            "The entire commercial trajectory converges on a single pivot point: "
            "resolving the 3 P1 security bugs unlocks the FDE sprint, which unblocks "
            "APAC, which satisfies the CIO's ROI mandate, which frees the $2M EMEA deal."
        ),
    }
}
