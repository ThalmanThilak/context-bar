import { atom, read, update } from 'claude-code'
import type { Register, SessionUsage } from 'claude-code'

import type { Limit, Reading } from '../types'

const reading = atom({ plugin: 'context-bar', key: 'reading' } as const, null)

const BAR_WIDTH = 20
const LIMIT_NAMES: Record<string, string> = {
  five_hour: '5-hour limit',
  seven_day: 'Weekly limit',
  spend_limit: 'Spend limit',
}

function toReading(u: Pick<SessionUsage, 'context' | 'rateLimits'>): Reading {
  return {
    percent: u.context.percent ?? null,
    tokens: u.context.tokens ?? null,
    window: u.context.window,
    limits: u.rateLimits.map((l): Limit => ({ kind: l.kind, percentUsed: l.percentUsed, resetsAt: l.resetsAt })),
  }
}

export function colorFor(percent: number): 'success' | 'warning' | 'error' {
  if (percent >= 90) return 'error'
  if (percent >= 70) return 'warning'
  return 'success'
}

export function barText(percent: number): string {
  const filled = Math.min(BAR_WIDTH, Math.round((percent / 100) * BAR_WIDTH))
  return '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled)
}

function shortTokens(n: number): string {
  return n >= 1000 ? `${Math.round(n / 1000)}k` : String(n)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    const usage = await $.session.usage()
    await update($, reading, () => toReading(usage))
    return result
  })

  // After every turn (and when a plan limit moves) the engine re-measures.
  on('session.measure', async ($, e, next) => {
    await update($, reading, () => toReading(e))
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const r = await read($, reading)
    if (e.props.hasSurvey || r === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    const percent = r.percent

    return (
      <Box flexDirection="column">
        <Box>
          <Text>Context </Text>
          {percent === null ? (
            <Text dimColor>no reading yet, send a message</Text>
          ) : (
            <>
              <Text color={colorFor(percent)}>{barText(percent)}</Text>
              <Text color={colorFor(percent)} bold> {percent}%</Text>
              <Text dimColor>
                {' '}({shortTokens(r.tokens ?? 0)} of {shortTokens(r.window)} tokens)
              </Text>
            </>
          )}
        </Box>
        {r.limits.length > 0 && (
          <Box>
            <Text dimColor>Plan  </Text>
            {r.limits.map((l, i) => (
              <Text key={l.kind} color={colorFor(l.percentUsed)}>
                {i > 0 ? ' · ' : ''}
                {LIMIT_NAMES[l.kind] ?? l.kind} {l.percentUsed}%
              </Text>
            ))}
          </Box>
        )}
      </Box>
    )
  })
}
