# Delta

Customer success agent that turns deployment data, stakeholder risk and CRM signals into a single pivot point and a one-click executable playbook.

## The problem

Health scores are lagging indicators. By the time they turn red, you already lost.

The real signal lives in the CSM's head — the political dynamic between stakeholders, the champion losing credibility internally, the thing the VP mentioned in passing that isn't in any database.

## A different question

What if you built the CSM instead of the dashboard?

Delta reads across deployment data, stakeholder sentiment and CRM notes, identifies a single pivot point, and routes the playbook. One click pushes to Jira, creates the Salesforce task, and sends the calendar placeholder to the right owner.

The schema says it all:

```typescript
interface Synthesis {
  pivotPoint: string          // the single move that unlocks everything
  priorityActions: PriorityAction[]
  playbook: { cco: string[]; csm: string[]; fde: string[] }
}
```

Most CS tools have `healthScore: number`. This one has `pivotPoint: string`.

## Stack

- **Frontend** — React + TypeScript + Vite
- **Prototype** — Python / Streamlit
- In production this would synthesise Salesforce, Gainsight, Jira, product telemetry and call transcripts. The integrations are solvable. Turning five dashboards into one routable decision is the hard part.

## Run it locally

```bash
cd frontend
npm install
npm run dev
```

Opens at http://localhost:5173

## Status

Prototype. A more interesting question than better red/amber/green.
