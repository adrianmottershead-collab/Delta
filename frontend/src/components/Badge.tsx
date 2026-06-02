import type { HealthStatus, Sentiment, DeploymentStatus } from '../data/accounts'

const HEALTH_STYLES: Record<HealthStatus, string> = {
  Healthy:   'bg-emerald-950 text-emerald-400 border border-emerald-800',
  Expanding: 'bg-blue-950 text-blue-400 border border-blue-800',
  'At Risk': 'bg-amber-950 text-amber-400 border border-amber-800',
  Churning:  'bg-red-950 text-red-400 border border-red-800',
}

const SENTIMENT_STYLES: Record<Sentiment, string> = {
  Positive: 'bg-emerald-950 text-emerald-400 border border-emerald-800',
  Neutral:  'bg-slate-800 text-slate-400 border border-slate-700',
  Negative: 'bg-red-950 text-red-400 border border-red-800',
  Blocked:  'bg-amber-950 text-amber-400 border border-amber-800',
}

const DEPLOYMENT_STYLES: Record<DeploymentStatus, string> = {
  Stable:    'bg-emerald-950 text-emerald-400 border border-emerald-800',
  Expanding: 'bg-blue-950 text-blue-400 border border-blue-800',
  Stalled:   'bg-red-950 text-red-400 border border-red-800',
  'At Risk': 'bg-amber-950 text-amber-400 border border-amber-800',
}

export function HealthBadge({ status }: { status: HealthStatus }) {
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${HEALTH_STYLES[status]}`}>{status}</span>
}

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${SENTIMENT_STYLES[sentiment]}`}>{sentiment}</span>
}

export function DeploymentBadge({ status }: { status: DeploymentStatus }) {
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${DEPLOYMENT_STYLES[status]}`}>{status}</span>
}
