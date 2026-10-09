# daily.dev plugin for Claude Code

Real-time developer content from daily.dev, inside Claude Code.

Install it from the daily.dev marketplace (Claude Code 2.1.275 or later does this in one step):

```
/plugin install daily.dev --marketplace dailydotdev/daily
```

The `daily-dev-ask` skill ships as its own plugin from the same marketplace:

```
/plugin install daily-dev-ask --marketplace dailydotdev/daily
```

What you get:

- **daily.dev skill** — query feeds, search posts, and pull personalized content via the daily.dev API. Works with any daily.dev account: create a free API token, or connect Claude Code to the daily.dev MCP server at `https://api.daily.dev/mcp` and sign in instead (see the skill for setup).
- **`/daily.dev:trends` skill** — today's curated headlines and most-upvoted posts, no token needed.
- **Headlines** — rotating daily.dev headlines while you wait: a status line entry under the prompt and a band above it with **Open** and **Hide**. Curated major headlines interleaved with the community's most-upvoted posts of the day, refreshed every 10 minutes, rotating every ~60 seconds. Headlines are clickable in terminals with hyperlink support (iTerm2, Kitty, WezTerm, Ghostty).

## Headlines setup

Nothing to set up. On Claude Code 2.1.275 or later the plugin ships a hooks module that shows the headline as soon as the plugin is installed, with no edits to your `settings.json`. Your own `statusLine` setting, if you have one, keeps working alongside it. Press **Hide** on the band to dismiss it for the current session.

### Upgrading from the old statusline

Versions before 0.7.0 wired the headlines into `statusLine` in `~/.claude/settings.json`. Leaving that in place next to the new hooks module shows the headline twice. Run:

```
/daily.dev:statusline
```

and Claude removes the old entry. If you prefer to do it by hand, delete the `statusLine` key whose command points at `statusline/statusline.mjs`.

### Older Claude Code

Claude Code before 2.1.275 does not load the hooks module, so the band and status line entry do not appear. The old setup still works there: run `/daily.dev:statusline` and Claude wires the script into `~/.claude/settings.json`, or point `statusLine` at the plugin's script yourself. The glob keeps it working across plugin updates:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node \"$(ls -td \"$HOME/.claude/plugins/cache/daily-dev/daily-dev\"/*/ | head -1)statusline/statusline.mjs\"",
    "refreshInterval": 10
  }
}
```

This replaces any custom statusline you already have, since Claude Code user settings hold a single `statusLine`.

## Notes

- Requires `node` on your PATH. Honors `NO_COLOR`.
- Content is fetched anonymously from the public daily.dev API and cached in `~/.cache/dailydev-claude/`.
- The hooks module runs the same `statusline/statusline.mjs` script, so caching, the 24h no-repeat history and click attribution behave the same either way.

## Telemetry

The headlines report anonymous impressions (which headlines were shown) to daily.dev analytics, using the same anonymous tracking id a logged-out daily.dev visitor gets. No code, file paths, or session content is ever collected — events carry only the shown post id and plugin version.

Opt out any time:

```bash
export DAILY_DEV_TELEMETRY=0
```
