import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'context-bar',
  component: 'AbovePrompt',
  requestId: 'above-prompt',
  surface: 'desktop',
  props: {
    hasSurvey: false,
    isWorking: false,
    maxRows: 6,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 6 },
    view: {},
  },
} as const

async function measure($: any, percent: number, rateLimits: unknown[] = []) {
  await $.session.measure({
    context: { tokens: percent * 2000, window: 200000, percent },
    rateLimits,
    changed: ['context'],
  })
}

for (const [percent, color] of [[45, 'success'], [75, 'warning'], [93, 'error']] as const) {
  test(`${percent}% context is drawn ${color}`, async ($, on) => {
    on('session.measure', (_, e) => ({ changed: e.changed }))
    await measure($, percent)

    const ui = await $.ui.mount(BAND)
    const label = await ui.find({ type: 'Text', text: new RegExp(`${percent}%`) })
    expect(label?.props.color).toBe(color)
    await ui.unmount()
  })
}

test('plan limits are shown when the engine reports them', async ($, on) => {
  on('session.measure', (_, e) => ({ changed: e.changed }))
  await measure($, 30, [
    { kind: 'five_hour', percentUsed: 42 },
    { kind: 'seven_day', percentUsed: 91.5 },
  ])

  const ui = await $.ui.mount(BAND)
  expect((await ui.find({ type: 'Text', text: /5-hour limit 42%/ }))?.props.color).toBe('success')
  expect((await ui.find({ type: 'Text', text: /Weekly limit 91.5%/ }))?.props.color).toBe('error')
  await ui.unmount()
})

test('no plan line when the engine has no limit reading', async ($, on) => {
  on('session.measure', (_, e) => ({ changed: e.changed }))
  await measure($, 30)

  const ui = await $.ui.mount(BAND)
  expect(await ui.find({ type: 'Text', text: /limit/ })).toBe(undefined)
  await ui.unmount()
})
