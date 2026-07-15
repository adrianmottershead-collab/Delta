import { useState } from 'react'
import type { Account } from '../data/accounts'
import { downloadEbrDocx } from '../ebr/generateEbrDocx'

export function GenerateEbrButton({ account }: { account: Account }) {
  const [state, setState] = useState<'idle' | 'generating' | 'done'>('idle')

  function handleClick() {
    setState('generating')
    downloadEbrDocx(account)
    setTimeout(() => setState('done'), 600)
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'generating'}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-60"
    >
      {state === 'generating' ? (
        <><span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />Generating…</>
      ) : state === 'done' ? (
        <>✓ EBR draft downloaded</>
      ) : (
        <>📄 Generate EBR Draft</>
      )}
    </button>
  )
}
