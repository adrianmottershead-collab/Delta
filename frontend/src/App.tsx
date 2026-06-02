import { useState } from 'react'
import { ACCOUNTS } from './data/accounts'
import { PortfolioOverview } from './components/PortfolioOverview'
import { AccountDetail } from './components/AccountDetail'
import { TopPriorities } from './components/TopPriorities'
import { ActionLogContext } from './context/ActionLogContext'
import { useActionLog } from './hooks/useActionLog'

type View = 'portfolio' | 'priorities' | 'account'

export default function App() {
  const [view, setView] = useState<View>('portfolio')
  const [selectedId, setSelectedId] = useState(ACCOUNTS[0].id)
  const actionLog = useActionLog()

  const selected = ACCOUNTS.find(a => a.id === selectedId)!

  function selectAccount(id: string) {
    setSelectedId(id)
    setView('account')
  }

  // Cross-account critical count for sidebar badge
  const criticalOpen = ACCOUNTS.flatMap(a =>
    a.synthesis.priorityActions.map((_, i) => ({ accountId: a.id, i }))
  ).filter(({ accountId, i }) => {
    const entry = actionLog.getEntry(accountId, i)
    const action = ACCOUNTS.find(a => a.id === accountId)!.synthesis.priorityActions[i]
    return action.urgency === 'Critical' && entry?.status !== 'Completed'
  }).length

  return (
    <ActionLogContext.Provider value={actionLog}>
      <div className="min-h-screen flex" style={{ background: '#0a0c14' }}>
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-[#1e2235] flex flex-col" style={{ background: '#0f1117' }}>
          <div className="p-5 border-b border-[#1e2235]">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-indigo-400 text-lg">⚡</span>
              <span className="text-white font-bold text-sm tracking-wide">Delta</span>
            </div>
            <p className="text-xs text-slate-600">Strategic Account Intelligence</p>
          </div>

          <nav className="p-3 flex flex-col gap-1">
            <button
              onClick={() => setView('portfolio')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                view === 'portfolio' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-[#141720]'
              }`}
            >
              Portfolio Overview
            </button>

            <button
              onClick={() => setView('priorities')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                view === 'priorities' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30' : 'text-slate-400 hover:text-white hover:bg-[#141720]'
              }`}
            >
              <span>⚡ Top Priorities</span>
              {criticalOpen > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {criticalOpen}
                </span>
              )}
            </button>

            <p className="text-xs text-slate-600 uppercase tracking-widest px-3 mt-3 mb-1">Accounts</p>
            {ACCOUNTS.map(a => {
              const dot = { Healthy: 'bg-emerald-400', Expanding: 'bg-blue-400', 'At Risk': 'bg-amber-400', Churning: 'bg-red-400' }[a.healthStatus]
              return (
                <button
                  key={a.id}
                  onClick={() => selectAccount(a.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    view === 'account' && selectedId === a.id
                      ? 'bg-indigo-600/20 text-white border border-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-[#141720]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                    <span className="text-xs font-medium truncate">{a.name}</span>
                  </div>
                  <p className="text-xs text-slate-600 ml-3.5 mt-0.5">${(a.arr / 1_000_000).toFixed(1)}M ARR</p>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto p-4 border-t border-[#1e2235]">
            <p className="text-xs text-slate-600">Powered by Claude Sonnet</p>
            <p className="text-xs text-slate-700">Anthropic</p>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {view === 'portfolio' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white mb-1">Portfolio Overview</h1>
                  <p className="text-sm text-slate-500">
                    Delta · Strategic Account Intelligence ·{' '}
                    {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <PortfolioOverview accounts={ACCOUNTS} selectedId={selectedId} onSelect={selectAccount} />
              </div>
            )}

            {view === 'priorities' && (
              <TopPriorities accounts={ACCOUNTS} onSelectAccount={selectAccount} />
            )}

            {view === 'account' && (
              <div>
                <button
                  onClick={() => setView('portfolio')}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white mb-4 transition-colors"
                >
                  ← Back to Portfolio
                </button>
                <AccountDetail account={selected} />
              </div>
            )}
          </div>
        </main>
      </div>
    </ActionLogContext.Provider>
  )
}
