# daily.dev plugin for Claude Code

Real-time developer content from daily.dev, inside Claude Code:

- **daily.dev skill** — query feeds, search posts, and pull personalized content via the daily.dev API (requires a Plus API token; see the skill for setup).
- **`/daily.dev:trends` skill** — today's curated headlines and most-upvoted posts, no token needed.
- **Statusline** — rotating daily.dev headlines at the bottom of Claude Code while you wait. Curated major headlines interleaved with the community's most-upvoted posts of the day, refreshed every 10 minutes, rotating every ~20 seconds. Headlines are clickable in terminals with hyperlink support (iTerm2, Kitty, WezTerm, Ghostty).

## Statusline notes

- Enabling this plugin sets Claude Code's `statusLine` — if you already have a custom statusline, the plugin's takes over. Remove the `statusLine` block from the plugin's `settings.json` (or disable the plugin) to keep your own.
- Requires `node` on your PATH. Honors `NO_COLOR`.
- Content is fetched anonymously from the public daily.dev API and cached in `~/.cache/dailydev-claude/`.

## Telemetry

The statusline reports anonymous impressions (which headlines were shown) to daily.dev analytics, using the same anonymous tracking id a logged-out daily.dev visitor gets. No code, file paths, or session content is ever collected — events carry only the shown post id and plugin version.

Opt out any time:

```bash
export DAILY_DEV_TELEMETRY=0
```
