const FLOW_CHAIN_GAP_MS = 4 * 60 * 60 * 1000
const FLOW_CHAIN_THRESHOLD = 4

/** Minimal shape needed from a focus session row to compute the Flow chain. */
export interface FlowChainSession {
  started_at: string
  completed_at: string
}

export interface FlowChainResult {
  chainLength: number
  isFlowActive: boolean
}

/**
 * Consecutive-session chain per SCHEMA_PROPOSAL.md "Flow Mode consecutive
 * sessions": ordered by completed_at, a session continues the chain when the
 * gap from the previous session's completed_at to its own started_at is at
 * most four hours. Returns the chain length ending at the most recent
 * session and whether that meets the Flow Mode threshold (4).
 */
export function calculateFlowChain(sessions: FlowChainSession[]): FlowChainResult {
  if (sessions.length === 0) {
    return { chainLength: 0, isFlowActive: false }
  }

  const ordered = [...sessions].sort(
    (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  )

  let chainLength = 1
  for (let i = 1; i < ordered.length; i++) {
    const gapMs =
      new Date(ordered[i].started_at).getTime() - new Date(ordered[i - 1].completed_at).getTime()

    chainLength = gapMs <= FLOW_CHAIN_GAP_MS ? chainLength + 1 : 1
  }

  return { chainLength, isFlowActive: chainLength >= FLOW_CHAIN_THRESHOLD }
}
