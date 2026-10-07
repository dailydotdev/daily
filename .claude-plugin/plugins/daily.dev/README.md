# daily.dev plugin for Claude Code

Real-time developer content from daily.dev, inside Claude Code:

- **daily.dev skill** — query feeds, search posts, and pull personalized content via the daily.dev API (requires a Plus API token; see the skill for setup).
- **`/daily.dev:trends` skill** — today's curated headlines and most-upvoted posts, no token needed.
- **✨ daily.dev mod** — a sparkly headline band above the prompt, `/daily` for today's best in a pane, and post suggestions when you install a package. Needs a recent Claude Code build with mods support; see below.
- **Statusline** — rotating daily.dev headlines at the bottom of Claude Code while you wait. Curated major headlines interleaved with the community's most-upvoted posts of the day, refreshed every 10 minutes, rotating every ~60 seconds. Headlines are clickable in terminals with hyperlink support (iTerm2, Kitty, WezTerm, Ghostty).

## ✨ The daily.dev mod

On a Claude Code build with mods support, the plugin ships a mod that loads with it, so there's nothing to wire up:

- **Headline band above the prompt**: one daily.dev headline at a time, rotating every minute, with a little sparkle sweep each time a new one comes in. Breaking news jumps the queue with a 🚨. Click the headline to read it, `›` for the next one, `✕` to hide the band for the session.
- **`/daily`**: opens a pane with today's 🔥 headlines and ⭐ most upvoted posts, every title clickable.
- **Post suggestions when you install a package**: after a successful `npm`/`pnpm`/`yarn`/`bun`/`pip`/`uv`/`poetry`/`cargo`/`go`/`gem`/`composer` install, if the community has a well-loved recent post about that package, you get a ✨ toast and the post is pinned in the band. At most 3 an hour, once a week per package, never for failed commands.
- **Status line entry** (off by default): the same headline pinned under the prompt, with no `settings.json` editing. If you've already wired the classic statusline below, the mod leaves it alone.

Tune it in `/config` (the plugin's options): `band`, `statusline`, `packageToasts`, `telemetry`. Older Claude Code builds ignore the mod and keep the skills and the classic statusline working as before.

Working on the mod: it lives in `hooks/` (`register.tsx` plus helpers), with tests in `tests/`. Load it from a checkout with `claude --plugin-dir .claude-plugin/plugins/daily.dev`, check it with `claude plugin validate` and `claude plugin test` on that folder, and type-check with `tsc -p` once Claude Code has loaded it once and written `.claude-plugin/types/`.

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

The statusline and the mod report anonymous impressions (which headlines were shown) to daily.dev analytics, using the same anonymous tracking id a logged-out daily.dev visitor gets. No code, file paths, or session content is ever collected — events carry only the shown post id and plugin version.

Opt out any time:

```bash
export DAILY_DEV_TELEMETRY=0
```
