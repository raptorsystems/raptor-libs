export const askOn = (route?: 'message' | 'chat') => (message?: string) => {
  const prefill = (subject: string | undefined) => {
    window.Beacon('prefill', { subject })
  }
  window.Beacon('once', 'open', () => {
    if (message) prefill(message)
    if (route === 'message') window.Beacon('navigate', '/ask/message/')
    else if (route === 'chat') window.Beacon('navigate', '/ask/chat/')
    else window.Beacon('navigate', `/ask/`)
  })
  window.Beacon('once', 'close', () => {
    prefill(undefined)
  })
  window.Beacon('open')
}

export const ask = {
  open: askOn(),
  message: askOn('message'),
  chat: askOn('chat'),
}

export type Ask = typeof ask
