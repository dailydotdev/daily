declare module 'claude-code' {
  interface PluginState {
    'daily.dev': {
      /** Current headline, plain text (SGR codes and OSC 8 wrappers removed). */
      headline?: { title: string; url?: string };
      /** User dismissed the band for this session. */
      bandHidden?: boolean;
    };
  }
}
export type Headline = { title: string; url?: string };
