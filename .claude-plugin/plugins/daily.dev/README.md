# daily.dev plugin for Claude Code

Real-time developer content from daily.dev, inside Claude Code:

- **daily.dev skill** — query feeds, search posts, and pull personalized content via the daily.dev API (requires a Plus API token; see the skill for setup).
- **`/daily.dev:trends` skill** — today's curated headlines and most-upvoted posts, no token needed.
- **Statusline** — rotating daily.dev headlines at the bottom of Claude Code while you wait. Curated major headlines interleaved with the community's most-upvoted posts of the day, refreshed every 10 minutes, rotating every ~60 seconds. Headlines are clickable in terminals with hyperlink support (iTerm2, Kitty, WezTerm, Ghostty).

## Statusline setup

Claude Code doesn't activate statuslines from plugins automatically — after installing the plugin, run:

```
/daily.dev:statusline
```

and Claude wires it into your `~/.claude/settings.json` (and can remove it again later). If you prefer to do it by hand, point `statusLine` at the plugin's script — the glob keeps it working across plugin updates:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node \"$(ls -td \"$HOME/.claude/plugins/cache/daily-dev/daily-dev\"/*/ | head -1)statusline/statusline.mjs\"",
    "refreshInterval": 10
  }
}
```

## Statusline notes

- If you already have a custom statusline, setting this one replaces it — your Claude Code user settings hold a single `statusLine`.
- Requires `node` on your PATH. Honors `NO_COLOR`.
- Content is fetched anonymously from the public daily.dev API and cached in `~/.cache/dailydev-claude/`.

## Telemetry

The statusline reports anonymous impressions (which headlines were shown) to daily.dev analytics, using the same anonymous tracking id a logged-out daily.dev visitor gets. No code, file paths, or session content is ever collected — events carry only the shown post id and plugin version.

Opt out any time:

```bash
export DAILY_DEV_TELEMETRY=0
```
