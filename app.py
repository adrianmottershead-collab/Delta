import html
import time

import streamlit as st

from data import ACCOUNTS, TIMELINE_EVENTS
from engine import AccountSynthesis, ProactiveAlert, evaluate_event, synthesize_account

# ── Page config ───────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="NRR Cross-Functional Radar",
    page_icon="📡",
    layout="wide",
)

# ── Custom CSS ────────────────────────────────────────────────────────────────
st.markdown(
    """
    <style>
    [data-testid="stSidebar"] { background-color: #0f1117; }

    .section-header {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #6b7280;
        margin-bottom: 0.6rem;
        margin-top: 1rem;
    }

    /* Status badges */
    .badge {
        display: inline-block;
        padding: 0.2rem 0.75rem;
        border-radius: 999px;
        font-weight: 700;
        font-size: 0.75rem;
        letter-spacing: 0.06em;
    }
    .badge-stable   { background: #d1fae5; color: #065f46; }
    .badge-stalled  { background: #fee2e2; color: #991b1b; }
    .badge-positive { background: #d1fae5; color: #065f46; }
    .badge-negative { background: #fee2e2; color: #991b1b; }
    .badge-blocked  { background: #fef3c7; color: #92400e; }
    .badge-buyer    { background: #ede9fe; color: #5b21b6; }
    .badge-gatekeeper { background: #fee2e2; color: #991b1b; }
    .badge-champion { background: #dbeafe; color: #1e40af; }

    /* Info cards */
    .info-card {
        background: #1a1d2e;
        border-radius: 10px;
        padding: 1.1rem 1.25rem;
        height: 100%;
        border: 1px solid #2d3148;
    }
    .info-card h5 {
        font-size: 0.95rem;
        font-weight: 700;
        color: #e2e8f0;
        margin: 0 0 0.35rem 0;
    }
    .info-card .sub {
        font-size: 0.75rem;
        color: #9ca3af;
        margin-bottom: 0.6rem;
    }
    .info-card p {
        font-size: 0.85rem;
        color: #cbd5e1;
        line-height: 1.6;
        margin: 0;
    }

    /* Synthesis cards */
    .synth-card {
        background: #1e2130;
        border-radius: 10px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 1rem;
        border-left: 4px solid #6366f1;
    }
    .synth-card.teal  { border-left-color: #14b8a6; }
    .synth-card.amber { border-left-color: #f59e0b; }
    .synth-card.blue  { border-left-color: #3b82f6; }
    .synth-card h4 {
        color: #a5b4fc;
        font-size: 0.7rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        margin-bottom: 0.6rem;
    }
    .synth-card.teal  h4 { color: #5eead4; }
    .synth-card.amber h4 { color: #fcd34d; }
    .synth-card.blue  h4 { color: #93c5fd; }
    .synth-card p, .synth-card li {
        color: #e2e8f0;
        font-size: 0.88rem;
        line-height: 1.65;
        white-space: pre-wrap;
    }

    /* Step list */
    .step-list { padding-left: 1.2rem; margin: 0; }
    .step-list li { margin-bottom: 0.55rem; }

    hr { border-color: #2d3148; margin: 1.5rem 0; }

    /* Simulation log */
    .event-log {
        background: #0d1117;
        border-radius: 8px;
        padding: 1rem 1.25rem;
        margin-bottom: 0.6rem;
        border: 1px solid #2d3148;
        font-family: 'Courier New', monospace;
        font-size: 0.82rem;
        color: #a3e635;
    }
    .event-log .ts {
        color: #6b7280;
        margin-right: 0.6rem;
    }
    .event-log .src {
        color: #38bdf8;
        font-weight: 700;
        margin-right: 0.5rem;
    }

    /* Delta alert */
    .delta-alert {
        background: #1c0f0f;
        border: 1px solid #ef4444;
        border-left: 5px solid #ef4444;
        border-radius: 8px;
        padding: 1.25rem 1.5rem;
        margin-bottom: 1rem;
        animation: pulse-border 1.5s ease-in-out 3;
    }
    @keyframes pulse-border {
        0%, 100% { border-left-color: #ef4444; }
        50%       { border-left-color: #fca5a5; }
    }
    .delta-alert .alert-header {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #ef4444;
        margin-bottom: 0.75rem;
    }
    .delta-alert .threshold {
        font-size: 0.86rem;
        color: #fca5a5;
        line-height: 1.65;
        margin-bottom: 0.9rem;
        white-space: pre-wrap;
    }
    .delta-alert .silo-header {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #fb923c;
        margin-bottom: 0.5rem;
    }
    .delta-alert .silo-body {
        font-size: 0.84rem;
        color: #fed7aa;
        line-height: 1.65;
        white-space: pre-wrap;
    }

    /* Playbook mini-cards inside alert */
    .mini-playbook {
        background: #1a1d2e;
        border-radius: 8px;
        padding: 0.9rem 1.1rem;
        margin-top: 0.6rem;
        border: 1px solid #2d3148;
    }
    .mini-playbook h5 {
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #a5b4fc;
        margin-bottom: 0.5rem;
    }
    .mini-playbook li {
        font-size: 0.82rem;
        color: #e2e8f0;
        line-height: 1.6;
        margin-bottom: 0.4rem;
    }

    /* Confirmed payload */
    .payload-confirmed {
        background: #052e16;
        border: 1px solid #16a34a;
        border-left: 5px solid #16a34a;
        border-radius: 8px;
        padding: 1rem 1.25rem;
        font-family: 'Courier New', monospace;
        font-size: 0.85rem;
        color: #4ade80;
        margin-top: 0.75rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 📡 NRR Radar")
    st.markdown("**Strategic Enterprise Intelligence**")
    st.markdown("---")
    selected = st.radio(
        "Select Account",
        list(ACCOUNTS.keys()),
        label_visibility="collapsed",
    )
    st.markdown("---")
    st.caption("Powered by Claude Opus · Anthropic")

acct = ACCOUNTS[selected]

# ── Account header ────────────────────────────────────────────────────────────
st.title(f"📊 {selected}")
st.markdown(
    f"**ARR:** ${acct['arr']:,} &nbsp;·&nbsp; "
    f"**Renewal in:** {acct['renewal_days_out']} days &nbsp;·&nbsp; "
    f"**Open P1 Bugs:** {acct['open_critical_bugs']} &nbsp;·&nbsp; "
    f"**Marketing Engagement:** {acct['marketing_engagement']}",
    unsafe_allow_html=True,
)
st.markdown("---")

# ── Tabs ──────────────────────────────────────────────────────────────────────
tab_deploy, tab_stake, tab_commercial = st.tabs(
    ["🗺  Deployment Matrix", "👥  Stakeholder Sentiment", "💰  Commercial Pipeline"]
)

# ── Tab 1: Deployment Matrix ──────────────────────────────────────────────────
with tab_deploy:
    st.markdown("")
    cols = st.columns(len(acct["deployment_topology"]))
    for col, (division, details) in zip(cols, acct["deployment_topology"].items()):
        status = details["status"]
        badge_cls = f"badge-{status.lower()}"
        with col:
            st.markdown(
                f"""
                <div class="info-card">
                    <h5>{html.escape(division)}</h5>
                    <div class="sub">
                        <span class="badge {badge_cls}">{html.escape(status)}</span>
                    </div>
                    <p><strong style="color:#e2e8f0;">Usage: {details['usage_pct']}%</strong></p>
                    <br/>
                    <p>{html.escape(details['notes'])}</p>
                </div>
                """,
                unsafe_allow_html=True,
            )
    st.markdown("")
    with st.expander("CSM Account Notes"):
        st.write(acct["csm_notes"])

# ── Tab 2: Stakeholder Sentiment ──────────────────────────────────────────────
with tab_stake:
    st.markdown("")
    cols = st.columns(len(acct["stakeholder_matrix"]))
    role_badge = {
        "Economic Buyer": "badge-buyer",
        "Technical Gatekeeper": "badge-gatekeeper",
        "Internal Champion": "badge-champion",
    }
    for col, stakeholder in zip(cols, acct["stakeholder_matrix"]):
        sentiment = stakeholder["sentiment"]
        role = stakeholder["role"]
        with col:
            st.markdown(
                f"""
                <div class="info-card">
                    <h5>{html.escape(stakeholder['name'])}</h5>
                    <div class="sub">
                        <span class="badge {role_badge.get(role, 'badge-buyer')}">{html.escape(role)}</span>
                        &nbsp;
                        <span class="badge badge-{sentiment.lower()}">{html.escape(sentiment)}</span>
                    </div>
                    <p>{html.escape(stakeholder['notes'])}</p>
                </div>
                """,
                unsafe_allow_html=True,
            )

# ── Tab 3: Commercial Pipeline ────────────────────────────────────────────────
with tab_commercial:
    st.markdown("")
    c1, c2, c3 = st.columns(3)

    with c1:
        st.markdown('<div class="section-header">💼 Open Opportunities</div>', unsafe_allow_html=True)
        if acct["sales_opportunities"]:
            for opp in acct["sales_opportunities"]:
                st.metric(opp["name"][:32], f"${opp['value']:,}")
                st.caption(opp["stage"])
        else:
            st.metric("Open Opportunities", "None")

    with c2:
        st.markdown('<div class="section-header">🔧 Engineering & FDE</div>', unsafe_allow_html=True)
        bug_count = acct["open_critical_bugs"]
        st.metric(
            "Open P1 Bugs",
            bug_count,
            delta=f"⚠ {bug_count} blocking sign-off" if bug_count else None,
            delta_color="inverse",
        )
        with st.expander("FDE Sprint Status"):
            st.write(acct["fde_services_planned"])

    with c3:
        st.markdown('<div class="section-header">📣 Marketing Engagement</div>', unsafe_allow_html=True)
        st.metric("Engagement Level", acct["marketing_engagement"])
        st.caption("Low engagement reflects relationship freeze — not product dissatisfaction.")

st.markdown("---")

# ── C-Suite Synthesis ─────────────────────────────────────────────────────────
st.markdown("### ⚡ C-Suite Alignment Synthesis")
st.caption(
    "Delta performs a cross-functional Alignment Synthesis — mapping stakeholder "
    "conflicts, deployment silos, and the single pivot point that unlocks full commercial potential."
)

if "synthesis_cache" not in st.session_state:
    st.session_state.synthesis_cache = {}

if st.button("🧠 Run Alignment Synthesis", type="primary"):
    with st.spinner("Synthesizing stakeholder dynamics and deployment signals…"):
        try:
            result: AccountSynthesis = synthesize_account(selected, acct)
            st.session_state.synthesis_cache[selected] = result
        except Exception as e:
            st.error(f"Synthesis error: {e}")

# ── Render synthesis ──────────────────────────────────────────────────────────
if selected in st.session_state.synthesis_cache:
    result = st.session_state.synthesis_cache[selected]

    # Row 1: Heatmap + Deployment Silo
    r1_col1, r1_col2 = st.columns(2)

    with r1_col1:
        st.markdown(
            f"""
            <div class="synth-card">
                <h4>Stakeholder Risk Heatmap</h4>
                <p>{html.escape(result.Stakeholder_Risk_Heatmap)}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with r1_col2:
        st.markdown(
            f"""
            <div class="synth-card teal">
                <h4>Deployment Silo Analysis</h4>
                <p>{html.escape(result.Deployment_Silo_Analysis)}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    # Row 2: Multi-Threaded Playbook
    st.markdown("#### Multi-Threaded Executive Playbook")
    p_col1, p_col2, p_col3 = st.columns(3)
    playbook = result.Multi_Threaded_Executive_Playbook

    def _render_playbook_card(col, title: str, steps: list, css_class: str) -> None:
        steps_html = "".join(f"<li>{html.escape(s)}</li>" for s in steps)
        with col:
            st.markdown(
                f"""
                <div class="synth-card {css_class}">
                    <h4>{html.escape(title)}</h4>
                    <ol class="step-list">{steps_html}</ol>
                </div>
                """,
                unsafe_allow_html=True,
            )

    _render_playbook_card(p_col1, "CCO",            playbook.CCO,            "amber")
    _render_playbook_card(p_col2, "Enterprise CSM", playbook.Enterprise_CSM, "blue")
    _render_playbook_card(p_col3, "FDE Lead",       playbook.FDE_Lead,       "teal")

st.markdown("---")

# ── Active Portfolio Monitoring ───────────────────────────────────────────────
st.markdown("### 🛰  Active Portfolio Monitoring")
st.caption(
    "Delta continuously monitors live system signals across Jira, Salesforce, and CSM "
    "notes. When a critical threshold is crossed, Delta proactively interjects with a "
    "Silo Inversion analysis and a tailored multi-threaded playbook."
)

# ── Session state for simulation ──────────────────────────────────────────────
if "sim_events_fired" not in st.session_state:
    st.session_state.sim_events_fired = []   # list of int indices already shown
if "sim_running" not in st.session_state:
    st.session_state.sim_running = False
if "sim_paused" not in st.session_state:
    st.session_state.sim_paused = False      # paused awaiting human approval
if "sim_approved" not in st.session_state:
    st.session_state.sim_approved = set()    # event indices whose playbook was approved

account_events = [e for e in TIMELINE_EVENTS if e["account"] == selected]


def _render_event_log(event: dict) -> None:
    st.markdown(
        f"""
        <div class="event-log">
            <span class="ts">Day {event['day']} · {event['time']}</span>
            <span class="src">{html.escape(event['icon'])} {html.escape(event['label'])}</span>
            {html.escape(event['body'])}
        </div>
        """,
        unsafe_allow_html=True,
    )


def _render_delta_alert(alert: ProactiveAlert, event_idx: int) -> None:
    pb = alert.urgent_playbook

    def _steps_html(steps: list) -> str:
        return "".join(f"<li>{html.escape(s)}</li>" for s in steps)

    st.markdown(
        f"""
        <div class="delta-alert">
            <div class="alert-header">⚡ Delta — Proactive Threshold Alert</div>
            <div class="threshold">{html.escape(alert.threshold_crossed)}</div>
            <div class="silo-header">Silo Inversion Analysis</div>
            <div class="silo-body">{html.escape(alert.silo_inversion_explanation)}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    pc1, pc2, pc3 = st.columns(3)
    for col, title, steps in [
        (pc1, "CCO — Immediate Actions", pb.CCO),
        (pc2, "Enterprise CSM", pb.Enterprise_CSM),
        (pc3, "FDE Lead", pb.FDE_Lead),
    ]:
        with col:
            st.markdown(
                f"""
                <div class="mini-playbook">
                    <h5>{html.escape(title)}</h5>
                    <ol>{_steps_html(steps)}</ol>
                </div>
                """,
                unsafe_allow_html=True,
            )

    if event_idx not in st.session_state.sim_approved:
        if st.button(
            "✅ Approve and Route Playbook",
            key=f"approve_{event_idx}",
            type="primary",
        ):
            st.session_state.sim_approved.add(event_idx)
            st.session_state.sim_paused = False
            st.rerun()
    else:
        st.markdown(
            """
            <div class="payload-confirmed">
            Delta: Execution order received. Routed P1 mitigation code directly to
            FDE Jira sprint backlog and sent executive calendar placeholder to CCO.
            </div>
            """,
            unsafe_allow_html=True,
        )


# ── Render all events fired so far ────────────────────────────────────────────
for fired_idx in st.session_state.sim_events_fired:
    ev = account_events[fired_idx]
    _render_event_log(ev)
    alert = evaluate_event(fired_idx)
    if alert:
        _render_delta_alert(alert, fired_idx)

# ── Simulation state machine ──────────────────────────────────────────────────
all_fired = len(st.session_state.sim_events_fired) == len(account_events)

if all_fired:
    st.success("Simulation complete — all timeline events have been processed.", icon="✅")
elif not st.session_state.sim_running:
    # Show start button only when simulation has not yet begun
    if st.button("🛰  Start Active Portfolio Monitoring", type="primary"):
        st.session_state.sim_running = True
        st.rerun()
elif st.session_state.sim_paused:
    # Waiting for human approval — nothing to auto-advance; approval button above handles it
    pass
else:
    # Running and not paused — fire the next event after a brief delay
    next_idx = len(st.session_state.sim_events_fired)
    if next_idx < len(account_events):
        with st.spinner(f"Monitoring live signals… next event incoming"):
            time.sleep(3)
        st.session_state.sim_events_fired.append(next_idx)
        alert = evaluate_event(next_idx)
        if alert:
            st.session_state.sim_paused = True
        st.rerun()
