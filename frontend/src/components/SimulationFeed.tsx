import { useState, useEffect, useRef } from 'react'
import type { Account } from '../data/accounts'

interface Props {
  account: Account
}

export function SimulationFeed({ account }: Props) {
  const [fired, setFired] = useState<number[]>([])
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [approved, setApproved] = useState<Set<number>>(new Set())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const events = account.timeline
  const allFired = fired.length === events.length

  useEffect(() => {
    // Reset when account changes
    setFired([])
    setRunning(false)
    setPaused(false)
    setApproved(new Set())
  }, [account.id])

  useEffect(() => {
    if (!running || paused || allFired) return
    const next = fired.length
    timerRef.current = setTimeout(() => {
      setFired(prev => [...prev, next])
      const alert = account.alerts[next]
      if (alert) setPaused(true)
    }, 2500)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [running, paused, fired, allFired, account])

  function approve(idx: number) {
    setApproved(prev => new Set([...prev, idx]))
    setPaused(false)
  }

  function reset() {
    if (timerRef.current) clearTimeout(timerRef.current)
    setFired([])
    setRunning(false)
    setPaused(false)
    setApproved(new Set())
  }

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-3">
        {!running && !allFired && (
          <button
            onClick={() => setRunning(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Start Active Portfolio Monitoring
          </button>
        )}
        {(running || allFired) && (
          <button onClick={reset} className="px-3 py-2 rounded-lg bg-[#1e2235] hover:bg-[#2d3148] text-slate-400 text-xs transition-colors">
            Reset
          </button>
        )}
        {running && !allFired && (
          <span className="flex items-center gap-2 text-xs text-slate-500">
            {paused
              ? <><span className="w-2 h-2 rounded-full bg-amber-400" /> Paused — Delta alert requires approval</>
              : <><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Monitoring live signals…</>
            }
          </span>
        )}
        {allFired && <span className="text-xs text-emerald-400">✓ Simulation complete</span>}
      </div>

      {/* Event log */}
      {fired.map(idx => {
        const ev = events[idx]
        const alert = account.alerts[idx]
        return (
          <div key={idx} className="space-y-2 animate-[fadeIn_0.4s_ease-out]">
            {/* Event card */}
            <div className="bg-[#0d1117] border border-[#1e2235] rounded-lg p-3 font-mono text-xs">
              <span className="text-slate-600 mr-2">Day {ev.day} · {ev.time}</span>
              <span className="text-sky-400 font-bold mr-2">{ev.icon} {ev.label}</span>
              <span className="text-emerald-400">{ev.body}</span>
            </div>

            {/* Delta alert */}
            {alert && (
              <div className="border border-red-900/60 bg-[#1c0f0f] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-red-400">⚡ Delta — Proactive Threshold Alert</span>
                </div>
                <p className="text-sm text-red-200 leading-relaxed">{alert.thresholdCrossed}</p>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">Silo Inversion Analysis</p>
                  <p className="text-sm text-amber-100/80 leading-relaxed">{alert.siloInversionExplanation}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {([
                    { title: 'CCO', steps: alert.playbook.cco, color: 'border-amber-700 text-amber-300' },
                    { title: 'Enterprise CSM', steps: alert.playbook.csm, color: 'border-blue-700 text-blue-300' },
                    { title: 'FDE Lead', steps: alert.playbook.fde, color: 'border-teal-700 text-teal-300' },
                  ]).map(({ title, steps, color }) => (
                    <div key={title} className={`bg-[#141720] rounded-lg p-3 border ${color.split(' ')[0]}`}>
                      <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${color.split(' ')[1]}`}>{title}</p>
                      <ol className="space-y-1.5 list-decimal list-inside">
                        {steps.map((s, i) => <li key={i} className="text-xs text-slate-300 leading-relaxed">{s}</li>)}
                      </ol>
                    </div>
                  ))}
                </div>

                {!approved.has(idx) ? (
                  <button
                    onClick={() => approve(idx)}
                    className="mt-1 w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                  >
                    ✅ Approve and Route Playbook
                  </button>
                ) : (
                  <div className="mt-1 p-3 rounded-lg bg-emerald-950 border border-emerald-800 font-mono text-xs text-emerald-400">
                    Delta: Execution order received. Routed P1 mitigation code directly to FDE Jira sprint backlog and sent executive calendar placeholder to CCO.
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
