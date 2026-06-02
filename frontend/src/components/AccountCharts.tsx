import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from 'recharts'
import type { Account } from '../data/accounts'

// ── Stakeholder Risk Radar ────────────────────────────────────────────────────
export function StakeholderRadar({ account }: { account: Account }) {
  const data = account.stakeholders.map(s => ({
    name: s.name.split(' ').slice(-1)[0], // last name for brevity
    Influence: s.influence,
    Risk: s.risk,
  }))

  return (
    <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-5">
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Stakeholder Influence vs Risk</p>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="#1e2235" />
          <PolarAngleAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Radar name="Influence" dataKey="Influence" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
          <Radar name="Risk" dataKey="Risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.12} />
          <Tooltip
            contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3148', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-1">
        <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-0.5 bg-indigo-400 inline-block" />Influence</span>
        <span className="flex items-center gap-1.5 text-xs text-slate-400"><span className="w-2.5 h-0.5 bg-red-400 inline-block" />Risk</span>
      </div>
    </div>
  )
}

// ── Usage Trend ───────────────────────────────────────────────────────────────
export function UsageTrend({ account }: { account: Account }) {
  return (
    <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-5">
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Platform Usage vs Benchmark (%)</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={account.monthlyUsageTrend} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
          <CartesianGrid stroke="#1e2235" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} unit="%" />
          <Tooltip
            contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3148', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Area type="monotone" dataKey="benchmark" stroke="#4b5563" strokeWidth={1} strokeDasharray="4 2" fill="rgba(55,65,81,0.12)" name="Benchmark" dot={false} />
          <Area type="monotone" dataKey="usage" stroke="#818cf8" strokeWidth={2} fill="rgba(99,102,241,0.15)" name="Usage" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Deployment Health Bars ────────────────────────────────────────────────────
const DEP_COLOR: Record<string, string> = {
  Stable: '#22c55e', Expanding: '#3b82f6', Stalled: '#ef4444', 'At Risk': '#f59e0b',
}

export function DeploymentBars({ account }: { account: Account }) {
  const data = account.deployments.map(d => ({
    name: d.division.split('—')[0].trim(),
    usage: d.usagePct,
    status: d.status,
  }))

  return (
    <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-5">
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Deployment Health (%)</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
          <CartesianGrid stroke="#1e2235" strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} unit="%" />
          <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} width={120} />
          <Tooltip
            contentStyle={{ background: '#1a1d2e', border: '1px solid #2d3148', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(v) => [`${v}%`, 'Usage']}
          />
          <Bar dataKey="usage" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => <Cell key={i} fill={DEP_COLOR[d.status] ?? '#6366f1'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Score Gauges ──────────────────────────────────────────────────────────────
function Gauge({ label, value, color, invert = false }: { label: string; value: number; color: string; invert?: boolean }) {
  const angle = -90 + (value / 100) * 180
  const r = 52
  const cx = 70, cy = 70
  const rad = (a: number) => (a * Math.PI) / 180
  const arc = (pct: number) => {
    const a = -90 + pct * 180
    return `M ${cx + r * Math.cos(rad(-90))} ${cy + r * Math.sin(rad(-90))} A ${r} ${r} 0 ${pct > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(rad(a))} ${cy + r * Math.sin(rad(a))}`
  }
  return (
    <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-4 flex flex-col items-center">
      <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">{label}</p>
      <svg width={140} height={82} viewBox="0 0 140 82">
        <path d={arc(1)} fill="none" stroke="#1e2235" strokeWidth={10} strokeLinecap="round" />
        <path d={arc(value / 100)} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
        <line
          x1={cx} y1={cy}
          x2={cx + (r - 14) * Math.cos(rad(angle))}
          y2={cy + (r - 14) * Math.sin(rad(angle))}
          stroke="#e2e8f0" strokeWidth={2} strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={4} fill="#e2e8f0" />
      </svg>
      <p className="text-2xl font-bold mt-[-8px]" style={{ color }}>{invert && value > 0 ? '' : ''}{value}<span className="text-base font-normal text-slate-500">%</span></p>
    </div>
  )
}

export function ScoreGauges({ account }: { account: Account }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Gauge label="Churn Risk" value={account.churnRisk} color={account.churnRisk > 60 ? '#ef4444' : account.churnRisk > 30 ? '#f59e0b' : '#22c55e'} invert />
      <Gauge label="Expansion Score" value={account.expansionScore} color={account.expansionScore > 60 ? '#22c55e' : account.expansionScore > 30 ? '#6366f1' : '#6b7280'} />
      <div className="bg-[#141720] border border-[#1e2235] rounded-xl p-4 flex flex-col items-center justify-center">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">NPS Score</p>
        <p className={`text-4xl font-bold ${account.npsScore >= 40 ? 'text-emerald-400' : account.npsScore >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
          {account.npsScore > 0 ? '+' : ''}{account.npsScore}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          {account.npsScore >= 40 ? 'Promoter zone' : account.npsScore >= 0 ? 'Passive zone' : 'Detractor zone'}
        </p>
      </div>
    </div>
  )
}
