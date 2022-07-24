// ref: https://deltener.com/blog/nuxt-third-party-code-is-poison/

export const onLoad = (callback: () => void, delay = 1) => {
  if (document.readyState === 'complete') {
    setTimeout(() => callback(), delay)
  } else {
    window.addEventListener('load', function () {
      setTimeout(() => callback(), delay)
    })
  }
}

export class OnDemandLoader {
  isLoaded: boolean
  isLoading: boolean
  callbacks: (() => void)[]
  src: string
  waitForPageLoad: boolean

  constructor(src: string, waitForPageLoad = true) {
    this.isLoaded = false
    this.isLoading = false
    this.callbacks = []
    this.src = src
    this.waitForPageLoad = waitForPageLoad
  }

  async load(callback = (): void => undefined) {
    if (this.isLoaded) return callback()

    this.callbacks.push(callback)

    if (!this.isLoading) {
      this.isLoading = true
      if (!this.waitForPageLoad || document.readyState === 'complete')
        await this._loadScript()
      else
        window.addEventListener('load', () => {
          // eslint-disable-next-line no-void
          void this._loadScript()
        })
    }
  }

  _loadScript() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = this.src
      script.onload = () => this._invokeCallbacks()
      document.getElementsByTagName('head')[0].appendChild(script)

      script.onload = () => {
        this._invokeCallbacks()
        return resolve
      }
      script.onerror = reject
    })
  }

  _loadLink() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('link')
      script.rel = this.src
      script.onload = () => this._invokeCallbacks()
      document.getElementsByTagName('head')[0].appendChild(script)

      script.onload = () => {
        this._invokeCallbacks()
        return resolve
      }
      script.onerror = reject
    })
  }

  _invokeCallbacks() {
    this.isLoaded = true
    this.callbacks.forEach((callback) => callback())
  }
}
