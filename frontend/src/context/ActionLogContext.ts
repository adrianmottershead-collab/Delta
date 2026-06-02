import { createContext, useContext } from 'react'
import type { ActionLog } from '../hooks/useActionLog'

const noop = () => null as unknown as ReturnType<ActionLog['getEntry']>

export const ActionLogContext = createContext<ActionLog>({
  log: {},
  pushUpdate: () => {},
  getEntry: noop,
})

export function useActionLogContext() {
  return useContext(ActionLogContext)
}
