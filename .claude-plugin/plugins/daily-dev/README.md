# daily.dev plugin for Claude Code

Real-time developer content from daily.dev, inside Claude Code.

Install it from the daily.dev marketplace (Claude Code 2.1.275 or later does this in one step):

```
/plugin install daily-dev --marketplace dailydotdev/daily
```

The first time a daily.dev skill needs your account, run `/mcp`, pick `daily-dev` and sign in. daily.dev opens in your browser, where you sign in or create an account and approve access. There is no API token to create or store, and you can disconnect any time from Settings > API on daily.dev.

### Moving from the `daily.dev` plugin

Versions before 0.30.0 were published as `daily.dev`. Replace it with this one:

```
claude plugin uninstall daily.dev@daily.dev
claude plugin install daily-dev@daily.dev
```

Skills are now under `/daily-dev:`, for example `/daily-dev:trends`. If you added `https://api.daily.dev/mcp` to Claude Code yourself, you can remove that server: the plugin brings its own.

What you get:

- **daily.dev MCP server** — the plugin connects Claude Code to `https://api.daily.dev/mcp`, with OAuth sign-in. Every skill below uses it.
- **daily.dev skill** — query feeds, search posts, and pull personalized content from your daily.dev account. Works with any daily.dev account.
- **`/daily-dev:daily-dev-ask` skill** — answers technical questions from daily.dev's knowledge base, with links to the articles it used.
- **`/daily-dev:trends` skill** — today's curated headlines and most-upvoted posts, no token needed.
- **`/daily-dev:daily-dev-onboarding` skill** — sets up your daily.dev account from the agent: sign in or create the account, then tags, sources, squads and preferences based on what you work on.
- **`/daily-dev:daily-dev-routine` skill** — a daily or weekly brief of what is worth reading on daily.dev for what you are working on, run on a schedule.
- **`/daily-dev:daily-dev-profile` skill** — makes your daily.dev profile credible: photo, headline, current role, About me, links and stack.
- **For daily.dev for Startups companies** — `daily-dev-content-ideas` and `daily-dev-content-review` shape posts with your weekly intel, and `daily-dev-growth-routine` schedules a daily report on your page, posts and boosts, with reminders at the content cadence you choose.
- **Headlines** — rotating daily.dev headlines while you wait, in a band above the prompt with **Open** and **Hide**. Curated major headlines interleaved with the community's most-upvoted posts of the day, refreshed every 10 minutes, rotating every ~60 seconds. Headlines are clickable in terminals with hyperlink support (iTerm2, Kitty, WezTerm, Ghostty).

## Headlines setup

Nothing to set up. On Claude Code 2.1.275 or later the plugin ships a hooks module that shows the headline band as soon as the plugin is installed, with no edits to your `settings.json`. Your own `statusLine` setting, if you have one, keeps working alongside it. Press **Hide** on the band to dismiss it for the current session.

### Upgrading from the old statusline

Versions before 0.7.0 wired the headlines into `statusLine` in `~/.claude/settings.json`. Leaving that in place next to the new hooks module shows the headline twice. Run:

```
/daily-dev:statusline
```

and Claude removes the old entry. If you prefer to do it by hand, delete the `statusLine` key whose command points at `statusline/statusline.mjs`.

### Older Claude Code

Claude Code before 2.1.275 does not load the hooks module, so the band does not appear. The old setup still works there: run `/daily-dev:statusline` and Claude wires the script into `~/.claude/settings.json`, or point `statusLine` at the plugin's script yourself. The glob keeps it working across plugin updates:

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
