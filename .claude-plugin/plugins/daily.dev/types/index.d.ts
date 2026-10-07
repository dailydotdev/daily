export type Headline = {
  /** daily.dev post id, from the /c/ link */
  postId: string | null
  title: string
  /** /c/ click-redirect URL (utm + cc_uid tagged) */
  url: string | null
  upvotes: number | null
}

declare module 'claude-code' {
  interface PluginState {
    'daily.dev': {
      current: Headline | null
      isHidden: boolean
    }
  }
}
