export type Limit = { kind: string; percentUsed: number; resetsAt?: string }
export type Reading = { percent: number | null; tokens: number | null; window: number; limits: Limit[] }

declare module 'claude-code' {
  interface PluginState {
    'context-bar': { reading: Reading | null }
  }
}
